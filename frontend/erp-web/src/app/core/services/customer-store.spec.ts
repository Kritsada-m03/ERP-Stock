import { TestBed } from '@angular/core/testing';
import { DEMO_STORAGE_KEY, DemoStore } from './demo-store';
import { createDemoState } from './demo-seed';

describe('Customer directory', () => {
  let store: DemoStore;
  const input = { code: ' cus-001 ', name: 'ลูกค้าทดลอง', contactName: 'ผู้ติดต่อ', phone: '0812345678',
    email: 'demo@example.com', address: '99 ถนนทดลอง กรุงเทพฯ 10000', taxId: '', notes: 'จัดส่งวันทำการ', active: true };
  beforeEach(() => { localStorage.clear(); TestBed.configureTestingModule({}); store = TestBed.inject(DemoStore); });

  it('persists customers and rejects duplicate codes without overwriting data', () => {
    const id = store.saveCustomer(input);
    expect(store.customer(id)?.code).toBe('CUS-001');
    expect(JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY)!).customers[0].address).toBe(input.address);
    expect(() => store.saveCustomer({ ...input, code: 'CUS-001' })).toThrow('มีอยู่แล้ว');
    expect(store.customers()).toHaveLength(1);
    TestBed.resetTestingModule();
    expect(TestBed.inject(DemoStore).customer(id)?.name).toBe(input.name);
  });

  it('validates required fields, contact formats and maximum lengths', () => {
    for (const change of [{ code: ' ' }, { name: ' ' }, { address: ' ' }, { email: 'wrong' },
      { taxId: '123' }, { phone: '0'.repeat(31) }, { phone: '081234567' }, { email: 'demo@localhost' }, { notes: 'a'.repeat(1001) }]) {
      expect(() => store.saveCustomer({ ...input, ...change })).toThrow();
    }
    expect(store.customers()).toHaveLength(0);
    expect(() => store.createOrder({ customer: { ...input, phone: 'invalid' }, warehouseId: 'w1', discount: 0, items: [{ productId: 'p1', quantity: 1 }] })).toThrow('เบอร์ไทย');
    expect(store.orders()).toHaveLength(0);
  });

  it('keeps order and receipt snapshots when a customer is edited or deactivated', () => {
    const customerId = store.saveCustomer(input);
    const id = store.createOrder({ customerId, customer: input, warehouseId: 'w1', discount: 0, items: [{ productId: 'p1', quantity: 1 }] });
    store.orderAction(id, 'check'); store.orderAction(id, 'confirm'); store.orderAction(id, 'payment');
    store.verifyPayment(store.state().payments[0].id, 'CUSTOMER-TEST'); store.orderAction(id, 'receipt');
    store.saveCustomer({ ...input, name: 'ชื่อใหม่', address: 'ที่อยู่ใหม่', active: false }, customerId);
    expect(store.order(id)?.customer).toMatchObject({ name: input.name, address: input.address });
    expect(store.state().receipts[0].customer.address).toBe(input.address);
    expect(store.order(id)?.customerId).toBe(customerId);
    expect(() => store.createOrder({ customerId, customer: input, warehouseId: 'w1', discount: 0, items: [{ productId: 'p1', quantity: 1 }] })).toThrow('ปิดใช้งาน');
  });

  it('loads older saved demos without discarding orders or stocks', () => {
    const id = store.createOrder({ customer: input, warehouseId: 'w1', discount: 0, items: [{ productId: 'p1', quantity: 1 }] });
    const saved = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY)!);
    delete saved.customers;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(saved));
    TestBed.resetTestingModule();
    const reloaded = TestBed.inject(DemoStore);
    expect(reloaded.storageWarning()).toBe('');
    expect(reloaded.customers()).toEqual([]);
    expect(reloaded.order(id)?.customer.name).toBe(input.name);
    reloaded.saveCustomer(input);
    expect(reloaded.state().stocks).toEqual(createDemoState().stocks);
    expect(reloaded.order(id)).toBeDefined();
  });
});
