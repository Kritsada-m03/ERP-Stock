import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { CustomerRecord, DemoState, OrderAction, OrderDraft, Product, SalesOrder, Stock } from '../../shared/models/erp.models';
import { createDemoState } from './demo-seed';
import { CustomerField, customerFieldError, customerFields } from '../../shared/validators/customer-validation';

export const DEMO_STORAGE_KEY = 'erp-backoffice.demo.v1';
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const money = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;
const qty = (value: number) => Math.round(value * 1000) / 1000;
const requireValue = (condition: unknown, message: string): void => { if (!condition) throw new Error(message); };

@Injectable({ providedIn: 'root' })
export class DemoStore {
  readonly storageWarning = signal('');
  private readonly data = signal<DemoState>(this.load());
  readonly state = this.data.asReadonly();
  readonly products = computed(() => this.data().products);
  readonly customers = computed(() => this.data().customers);
  readonly warehouses = computed(() => this.data().warehouses);
  readonly orders = computed(() => [...this.data().orders].reverse());

  constructor() {
    const listener = (event: StorageEvent) => {
      if (event.key === DEMO_STORAGE_KEY) this.data.set(this.load());
    };
    window.addEventListener('storage', listener);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', listener));
  }

  private load(): DemoState {
    try {
      const raw = localStorage.getItem(DEMO_STORAGE_KEY);
      if (!raw) return createDemoState();
      const data = JSON.parse(raw) as DemoState;
      const lists = ['categories', 'warehouses', 'products', 'stocks', 'transactions', 'orders', 'payments', 'receipts', 'deliveries'] as const;
      if (data.version !== 1 || !Number.isInteger(data.revision) || !lists.every(key => Array.isArray(data[key]))) throw new Error('format');
      // Older demos have order snapshots but no customer directory. Keep those orders intact.
      if (!Object.prototype.hasOwnProperty.call(data, 'customers')) data.customers = [];
      if (!Array.isArray(data.customers)) throw new Error('format');
      return data;
    } catch {
      this.storageWarning.set('อ่านข้อมูลทดลองเดิมไม่ได้ กรุณาใช้ปุ่มเริ่มข้อมูลทดลองใหม่ ข้อมูลเดิมยังไม่ถูกเขียนทับ');
      return createDemoState();
    }
  }

  private change<T>(operation: (state: DemoState) => T): T {
    requireValue(!this.storageWarning(), 'กรุณาแก้ปัญหาข้อมูลทดลองก่อนบันทึก');
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw && JSON.parse(raw).revision !== this.data().revision) {
      this.data.set(this.load());
      throw new Error('ข้อมูลถูกเปลี่ยนจากแท็บอื่นแล้ว กรุณาตรวจข้อมูลและทำรายการอีกครั้ง');
    }
    const next = clone(this.data());
    const result = operation(next);
    next.revision++;
    try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next)); }
    catch { throw new Error('บันทึกข้อมูลในเบราว์เซอร์ไม่ได้ กรุณาตรวจพื้นที่จัดเก็บหรือสิทธิ์ของเบราว์เซอร์'); }
    this.data.set(next);
    return result;
  }

  reset(): void {
    const next = createDemoState();
    next.revision = Date.now();
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(next));
    this.storageWarning.set('');
    this.data.set(next);
  }

  product(id: string) { return this.data().products.find(p => p.id === id); }
  customer(id: string) { return this.data().customers.find(c => c.id === id); }
  order(id: string) { return this.data().orders.find(o => o.id === id); }
  warehouseName(id: string) { return this.data().warehouses.find(w => w.id === id)?.name ?? 'ไม่พบคลัง'; }
  categoryName(id: string) { return this.data().categories.find(c => c.id === id)?.name ?? 'ไม่ระบุ'; }
  available(productId: string, warehouseId: string): number {
    const row = this.data().stocks.find(s => s.productId === productId && s.warehouseId === warehouseId);
    return row ? qty(row.onHand - row.reserved) : 0;
  }
  totalAvailable(productId: string) { return qty(this.data().stocks.filter(s => s.productId === productId).reduce((sum, s) => sum + s.onHand - s.reserved, 0)); }

  saveCustomer(input: Omit<CustomerRecord, 'id' | 'createdAt' | 'updatedAt'>, id?: string): string {
    return this.change(state => {
      const value = { ...input, code: input.code.trim().toUpperCase(), name: input.name.trim(),
        contactName: input.contactName.trim(), phone: input.phone.trim(), email: input.email.trim(),
        address: input.address.trim(), taxId: input.taxId.trim(), notes: input.notes.trim() };
      for (const field of Object.keys(customerFields) as CustomerField[]) {
        const error = customerFieldError(field, value[field]);
        requireValue(!error, error);
      }
      requireValue(!state.customers.some(c => c.id !== id && c.code.toUpperCase() === value.code), 'รหัสลูกค้านี้มีอยู่แล้ว');
      const now = new Date().toISOString();
      if (id) {
        const index = state.customers.findIndex(c => c.id === id);
        requireValue(index >= 0, 'ไม่พบลูกค้า');
        state.customers[index] = { ...state.customers[index], ...value, updatedAt: now };
        return id;
      }
      const newId = crypto.randomUUID();
      state.customers.push({ ...value, id: newId, createdAt: now });
      return newId;
    });
  }

  saveProduct(input: Omit<Product, 'id'>, id?: string): string {
    return this.change(state => {
      const product = { ...input, sku: input.sku.trim().toUpperCase(), name: input.name.trim(), unit: input.unit.trim(), price: money(input.price), reorderPoint: qty(input.reorderPoint) };
      requireValue(product.sku && product.name && product.unit, 'กรุณากรอกรหัส ชื่อสินค้า และหน่วยนับ');
      requireValue(product.sku.length <= 50 && product.name.length <= 200 && product.unit.length <= 50, 'ข้อมูลสินค้ายาวเกินกำหนด');
      requireValue(Number.isFinite(input.price) && input.price >= 0 && input.price <= 100000000, 'ราคาต้องอยู่ระหว่าง 0 ถึง 100,000,000');
      requireValue(Number.isFinite(input.reorderPoint) && input.reorderPoint >= 0 && input.reorderPoint <= 100000000, 'จุดเตือนสต็อกไม่ถูกต้อง');
      requireValue(state.categories.some(c => c.id === product.categoryId), 'กรุณาเลือกหมวดหมู่');
      requireValue(!state.products.some(p => p.id !== id && p.sku.toLowerCase() === product.sku.toLowerCase()), 'รหัสสินค้านี้มีอยู่แล้ว');
      if (id) {
        const index = state.products.findIndex(p => p.id === id);
        requireValue(index >= 0, 'ไม่พบสินค้า');
        state.products[index] = { ...product, id };
        return id;
      }
      const newId = crypto.randomUUID();
      state.products.push({ ...product, id: newId });
      return newId;
    });
  }

  setProductActive(id: string, active: boolean): void {
    this.change(state => {
      const product = state.products.find(p => p.id === id);
      requireValue(product, 'ไม่พบสินค้า');
      product!.active = active;
    });
  }

  addCategory(name: string): void {
    this.change(state => {
      const trimmed = name.trim();
      requireValue(trimmed && trimmed.length <= 150, 'กรอกชื่อหมวดหมู่ไม่เกิน 150 ตัวอักษร');
      requireValue(!state.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase()), 'หมวดหมู่นี้มีอยู่แล้ว');
      state.categories.push({ id: crypto.randomUUID(), name: trimmed });
    });
  }

  addWarehouse(code: string, name: string): void {
    this.change(state => {
      const normalized = code.trim().toUpperCase();
      requireValue(normalized && normalized.length <= 30 && name.trim() && name.trim().length <= 150, 'กรอกรหัสคลังและชื่อคลังให้ครบ');
      requireValue(!state.warehouses.some(w => w.code === normalized), 'รหัสคลังนี้มีอยู่แล้ว');
      state.warehouses.push({ id: crypto.randomUUID(), code: normalized, name: name.trim() });
    });
  }

  private stock(state: DemoState, productId: string, warehouseId: string): Stock {
    let stock = state.stocks.find(s => s.productId === productId && s.warehouseId === warehouseId);
    if (!stock) { stock = { productId, warehouseId, onHand: 0, reserved: 0 }; state.stocks.push(stock); }
    return stock;
  }

  receive(productId: string, warehouseId: string, quantity: number, note: string): void {
    this.change(state => {
      requireValue(state.products.some(p => p.id === productId && p.active), 'กรุณาเลือกสินค้าที่เปิดใช้งาน');
      requireValue(state.warehouses.some(w => w.id === warehouseId), 'กรุณาเลือกคลัง');
      requireValue(Number.isFinite(quantity) && qty(quantity) > 0 && quantity <= 1000000, 'จำนวนต้องมากกว่า 0 และไม่เกิน 1,000,000');
      requireValue(note.trim(), 'กรุณาระบุเหตุผลหรือเอกสารอ้างอิง');
      const stock = this.stock(state, productId, warehouseId);
      stock.onHand = qty(stock.onHand + qty(quantity));
      state.transactions.push({ id: crypto.randomUUID(), date: new Date().toISOString(), productId, warehouseId, type: 'Receive', quantity: qty(quantity), reference: 'RCV-' + String(state.transactions.length + 1).padStart(5, '0'), note: note.trim() });
    });
  }

  createOrder(draft: OrderDraft): string {
    return this.change(state => {
      requireValue(state.warehouses.some(w => w.id === draft.warehouseId), 'กรุณาเลือกคลัง');
      if (draft.customerId) requireValue(state.customers.some(c => c.id === draft.customerId && c.active), 'ไม่พบลูกค้าหรือลูกค้าถูกปิดใช้งาน');
      const customer = { name: draft.customer.name.trim(), phone: draft.customer.phone.trim(), address: draft.customer.address.trim() };
      for (const field of ['name', 'phone', 'address'] as const) {
        const error = customerFieldError(field, customer[field]);
        requireValue(!error, error);
      }
      requireValue(draft.items.length > 0 && draft.items.length <= 100, 'ออเดอร์ต้องมีสินค้า 1–100 รายการ');
      requireValue(new Set(draft.items.map(i => i.productId)).size === draft.items.length, 'สินค้าซ้ำ กรุณารวมจำนวนในรายการเดียว');
      const items = draft.items.map(item => {
        const product = state.products.find(p => p.id === item.productId && p.active);
        requireValue(product, 'ไม่พบสินค้าหรือสินค้าถูกปิดใช้งาน');
        requireValue(Number.isFinite(item.quantity) && qty(item.quantity) > 0 && item.quantity <= 1000000, 'จำนวนสินค้าไม่ถูกต้อง');
        return { productId: product!.id, sku: product!.sku, name: product!.name, unit: product!.unit, quantity: qty(item.quantity), price: product!.price, total: money(product!.price * qty(item.quantity)) };
      });
      const subtotal = money(items.reduce((sum, i) => sum + i.total, 0));
      requireValue(Number.isFinite(draft.discount) && draft.discount >= 0 && money(draft.discount) < subtotal, 'ส่วนลดต้องไม่ติดลบและยอดสุทธิต้องมากกว่า 0');
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      state.orders.push({ id, number: this.number('SO', state.orders.length + 1), createdAt: now, warehouseId: draft.warehouseId, customerId: draft.customerId || undefined, customer, items, subtotal, discount: money(draft.discount), total: money(subtotal - money(draft.discount)), status: 'Draft', timeline: [{ date: now, label: 'สร้างออเดอร์' }] });
      return id;
    });
  }

  private number(prefix: string, count: number): string {
    const date = new Date();
    return prefix + '-' + date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(count).padStart(5, '0');
  }

  private checkStock(state: DemoState, order: SalesOrder): void {
    for (const item of order.items) {
      requireValue(state.products.some(p => p.id === item.productId && p.active), item.name + ' ถูกปิดใช้งาน');
      const stock = this.stock(state, item.productId, order.warehouseId);
      requireValue(qty(stock.onHand - stock.reserved) >= item.quantity, item.name + ' มีพร้อมขายไม่เพียงพอ');
    }
  }

  orderAction(id: string, action: OrderAction, tracking = ''): void {
    this.change(state => {
      const order = state.orders.find(o => o.id === id);
      requireValue(order, 'ไม่พบออเดอร์');
      const o = order!;
      const now = new Date().toISOString();
      const expect = (status: SalesOrder['status']) => requireValue(o.status === status, 'สถานะออเดอร์เปลี่ยนแล้ว กรุณาตรวจสอบก่อนทำรายการ');
      let label = '';
      if (action === 'check') { expect('Draft'); this.checkStock(state, o); o.status = 'StockChecked'; label = 'ตรวจสอบสินค้าครบ'; }
      if (action === 'confirm') {
        expect('StockChecked'); this.checkStock(state, o);
        o.items.forEach(item => { const stock = this.stock(state, item.productId, o.warehouseId); stock.reserved = qty(stock.reserved + item.quantity); });
        o.status = 'Confirmed'; label = 'ยืนยันออเดอร์และจองสต็อก';
      }
      if (action === 'payment') {
        expect('Confirmed');
        state.payments.push({ id: crypto.randomUUID(), number: this.number('PAY', state.payments.length + 1), orderId: id, amount: o.total, status: 'Pending', createdAt: now });
        o.status = 'AwaitingPayment'; label = 'สร้างใบแจ้งชำระทดลอง (ยังไม่มี QR จริง)';
      }
      if (action === 'receipt') {
        expect('Paid');
        requireValue(state.payments.some(p => p.orderId === id && p.status === 'Verified'), 'ยังไม่ได้ยืนยันรับเงิน');
        requireValue(!state.receipts.some(r => r.orderId === id), 'ออกใบเสร็จแล้ว');
        state.receipts.push({ id: crypto.randomUUID(), number: this.number('RC', state.receipts.length + 1), orderId: id, issuedAt: now, customer: clone(o.customer), items: clone(o.items), subtotal: o.subtotal, discount: o.discount, total: o.total });
        o.status = 'Receipted'; label = 'ออกใบเสร็จทดลอง';
      }
      if (action === 'prepare') {
        expect('Receipted');
        state.deliveries.push({ id: crypto.randomUUID(), number: this.number('DN', state.deliveries.length + 1), orderId: id, status: 'Preparing', preparedAt: now, customer: clone(o.customer), items: clone(o.items) });
        o.status = 'Preparing'; label = 'เริ่มเตรียมสินค้า';
      }
      if (action === 'document') {
        expect('Preparing');
        const delivery = state.deliveries.find(d => d.orderId === id);
        requireValue(delivery, 'ไม่พบรายการจัดส่ง');
        delivery!.status = 'ReadyToShip'; delivery!.issuedAt = now;
        o.status = 'ReadyToShip'; label = 'ออกใบส่งของทดลอง';
      }
      if (action === 'ship') {
        expect('ReadyToShip');
        const delivery = state.deliveries.find(d => d.orderId === id);
        requireValue(delivery?.status === 'ReadyToShip', 'ยังไม่ออกใบส่งของ');
        for (const item of o.items) {
          const stock = this.stock(state, item.productId, o.warehouseId);
          requireValue(stock.onHand >= item.quantity && stock.reserved >= item.quantity, 'ยอดสต็อกหรือยอดจองไม่ถูกต้อง');
          stock.onHand = qty(stock.onHand - item.quantity); stock.reserved = qty(stock.reserved - item.quantity);
          state.transactions.push({ id: crypto.randomUUID(), date: now, productId: item.productId, warehouseId: o.warehouseId, type: 'Dispatch', quantity: -item.quantity, reference: delivery!.number, note: o.number });
        }
        delivery!.status = 'Completed'; delivery!.shippedAt = now; delivery!.tracking = tracking.trim();
        o.status = 'Completed'; label = 'ส่งสินค้าและตัดสต็อกครบ';
      }
      if (action === 'cancel') {
        requireValue(['Draft', 'StockChecked', 'Confirmed', 'AwaitingPayment'].includes(o.status), 'ยกเลิกได้เฉพาะก่อนรับเงิน');
        if (['Confirmed', 'AwaitingPayment'].includes(o.status)) {
          o.items.forEach(item => {
            const stock = this.stock(state, item.productId, o.warehouseId);
            requireValue(stock.reserved >= item.quantity, 'ยอดจองไม่ถูกต้อง');
            stock.reserved = qty(stock.reserved - item.quantity);
          });
        }
        state.payments.filter(p => p.orderId === id && p.status === 'Pending').forEach(p => p.status = 'Cancelled');
        o.status = 'Cancelled'; label = 'ยกเลิกออเดอร์และคืนยอดจอง';
      }
      requireValue(label, 'ไม่รู้จักคำสั่ง');
      o.timeline.push({ date: now, label });
    });
  }

  verifyPayment(id: string, reference: string): void {
    this.change(state => {
      const payment = state.payments.find(p => p.id === id);
      requireValue(payment?.status === 'Pending', 'รายการนี้ไม่อยู่ในสถานะรอรับเงิน');
      const order = state.orders.find(o => o.id === payment!.orderId);
      requireValue(order?.status === 'AwaitingPayment', 'ออเดอร์ไม่อยู่ในสถานะรอชำระ');
      const ref = reference.trim().toUpperCase();
      requireValue(ref && ref.length <= 200, 'กรุณากรอกเลขอ้างอิงทดลองไม่เกิน 200 ตัวอักษร');
      requireValue(!state.payments.some(p => p.bankReference === ref), 'เลขอ้างอิงนี้ถูกใช้แล้ว');
      requireValue(payment!.amount === order!.total, 'ยอดชำระไม่ตรงกับออเดอร์');
      payment!.status = 'Verified'; payment!.bankReference = ref; payment!.verifiedAt = new Date().toISOString();
      order!.status = 'Paid'; order!.timeline.push({ date: payment!.verifiedAt, label: 'จำลองยืนยันรับเงิน · ' + ref });
    });
  }
}
