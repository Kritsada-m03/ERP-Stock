import { TestBed } from '@angular/core/testing';
import { DEMO_STORAGE_KEY, DemoStore } from './demo-store';

describe('Demo workflow', () => {
  let store: DemoStore;
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(DemoStore);
  });
  afterEach(() => vi.restoreAllMocks());
  const customer = { name: 'ลูกค้าทดสอบ', phone: '0000000000', address: 'ที่อยู่ทดลอง' };
  const create = (quantity = 2) => store.createOrder({ warehouseId: 'w1', customer, items: [{ productId: 'p1', quantity }], discount: 0 });
  const confirm = (id: string) => { store.orderAction(id, 'check'); store.orderAction(id, 'confirm'); };
  const pay = (id: string, reference = 'DEMO-001') => {
    store.orderAction(id, 'payment');
    const payment = store.state().payments.find(p => p.orderId === id)!;
    store.verifyPayment(payment.id, reference);
    return payment.id;
  };

  it('reserves first and deducts only when shipping, once', () => {
    const id = create();
    expect(store.available('p1', 'w1')).toBe(120);
    confirm(id);
    expect(store.available('p1', 'w1')).toBe(118);
    expect(store.state().stocks.find(s => s.productId === 'p1')?.onHand).toBe(120);
    pay(id);
    store.orderAction(id, 'receipt');
    store.orderAction(id, 'prepare');
    store.orderAction(id, 'document');
    expect(store.state().stocks.find(s => s.productId === 'p1')?.onHand).toBe(120);
    store.orderAction(id, 'ship', 'DEMO-TRACK');
    expect(store.order(id)?.status).toBe('Completed');
    expect(store.state().stocks.find(s => s.productId === 'p1')).toMatchObject({ onHand: 118, reserved: 0 });
    expect(store.state().transactions.filter(t => t.type === 'Dispatch')).toHaveLength(1);
    expect(() => store.orderAction(id, 'ship')).toThrow();
    expect(store.state().transactions.filter(t => t.type === 'Dispatch')).toHaveLength(1);
    expect(store.state().deliveries[0].tracking).toBe('DEMO-TRACK');
  });

  it('rechecks availability at confirmation after another order reserves stock', () => {
    const first = create(100); const second = create(100);
    store.orderAction(first, 'check'); store.orderAction(second, 'check');
    store.orderAction(first, 'confirm');
    expect(() => store.orderAction(second, 'confirm')).toThrow('ไม่เพียงพอ');
    expect(store.order(second)?.status).toBe('StockChecked');
    expect(store.available('p1', 'w1')).toBe(20);
  });

  it('does not reserve part of an order when one line is unavailable', () => {
    const id = store.createOrder({ warehouseId: 'w1', customer, discount: 0, items: [{ productId: 'p1', quantity: 1 }, { productId: 'p4', quantity: 999 }] });
    const before = JSON.stringify(store.state());
    expect(() => store.orderAction(id, 'check')).toThrow();
    expect(JSON.stringify(store.state())).toBe(before);
  });

  it('cancels an unpaid order and releases reservations and pending payment', () => {
    const id = create(3); confirm(id); store.orderAction(id, 'payment');
    store.orderAction(id, 'cancel');
    expect(store.available('p1', 'w1')).toBe(120);
    expect(store.state().payments[0].status).toBe('Cancelled');
    expect(() => store.verifyPayment(store.state().payments[0].id, 'DEMO-CANCEL')).toThrow();
  });

  it('rejects payment reference reuse, duplicate verification and paid cancellation', () => {
    const first = create(); confirm(first); const paymentId = pay(first);
    expect(() => store.verifyPayment(paymentId, 'DEMO-002')).toThrow();
    expect(() => store.orderAction(first, 'cancel')).toThrow();
    const second = create(); confirm(second); store.orderAction(second, 'payment');
    const secondPayment = store.state().payments.find(p => p.orderId === second)!;
    expect(() => store.verifyPayment(secondPayment.id, 'demo-001')).toThrow('ถูกใช้แล้ว');
    expect(secondPayment.status).toBe('Pending');
  });

  it('keeps document snapshots after product changes and prevents duplicate receipts', () => {
    const id = create(); confirm(id); pay(id); store.orderAction(id, 'receipt');
    const original = store.state().receipts[0].items[0];
    const product = store.product('p1')!;
    store.saveProduct({ ...product, name: 'ชื่อใหม่', price: 999 }, 'p1');
    expect(store.state().receipts[0].items[0]).toEqual(original);
    expect(() => store.orderAction(id, 'receipt')).toThrow();
    expect(store.state().receipts).toHaveLength(1);
  });

  it('does not issue receipts or shipping documents before required steps', () => {
    const id = create();
    for (const action of ['receipt', 'prepare', 'document', 'ship'] as const) {
      expect(() => store.orderAction(id, action)).toThrow();
    }
    expect(store.state().receipts).toHaveLength(0);
    expect(store.state().deliveries).toHaveLength(0);
  });

  it('validates SKU, quantities, duplicate order lines and discount', () => {
    const product = store.product('p1')!;
    expect(() => store.saveProduct({ ...product, sku: ' off-001 ' })).toThrow('มีอยู่แล้ว');
    expect(() => store.receive('p1', 'w1', -1, 'test')).toThrow();
    expect(() => store.receive('p1', 'w1', NaN, 'test')).toThrow();
    expect(() => store.createOrder({ warehouseId: 'w1', customer, items: [{ productId: 'p1', quantity: 1 }], discount: 126 })).toThrow();
    expect(() => store.createOrder({ warehouseId: 'w1', customer, items: [{ productId: 'p1', quantity: 1 }, { productId: 'p1', quantity: 2 }], discount: 0 })).toThrow('สินค้าซ้ำ');
  });

  it('records receipts in the selected warehouse without changing another warehouse', () => {
    store.receive('p1', 'w2', 2.5, 'test');
    expect(store.available('p1', 'w2')).toBe(2.5);
    expect(store.available('p1', 'w1')).toBe(120);
    expect(store.state().transactions.at(-1)).toMatchObject({ warehouseId: 'w2', quantity: 2.5 });
  });

  it('keeps the in-memory state unchanged if local persistence fails', () => {
    const before = JSON.stringify(store.state());
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => store.receive('p1', 'w1', 1, 'test')).toThrow('บันทึกข้อมูล');
    expect(JSON.stringify(store.state())).toBe(before);
  });

  it('persists completed actions and refuses to overwrite a newer revision', () => {
    const id = create();
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY)!);
    expect(saved.orders[0].id).toBe(id);
    saved.revision += 1;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(saved));
    expect(() => store.receive('p1', 'w1', 1, 'test')).toThrow('แท็บอื่น');
    expect(store.available('p1', 'w1')).toBe(120);
  });
});
