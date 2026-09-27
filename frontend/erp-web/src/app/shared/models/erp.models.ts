export type OrderStatus = 'Draft' | 'StockChecked' | 'Confirmed' | 'AwaitingPayment' | 'Paid' | 'Receipted' | 'Preparing' | 'ReadyToShip' | 'Completed' | 'Cancelled';
export type OrderAction = 'check' | 'confirm' | 'payment' | 'receipt' | 'prepare' | 'document' | 'ship' | 'cancel';
export interface Category { id: string; name: string; }
export interface Warehouse { id: string; code: string; name: string; }
export interface Product { id: string; sku: string; name: string; categoryId: string; unit: string; price: number; reorderPoint: number; active: boolean; }
export interface Stock { productId: string; warehouseId: string; onHand: number; reserved: number; }
export interface StockTransaction { id: string; date: string; productId: string; warehouseId: string; type: 'Receive' | 'Dispatch'; quantity: number; reference: string; note: string; }
export interface Customer { name: string; phone: string; address: string; }
export interface CustomerRecord extends Customer { id: string; code: string; contactName: string; email: string; taxId: string; notes: string; active: boolean; createdAt: string; updatedAt?: string; }
export interface OrderItem { productId: string; sku: string; name: string; unit: string; quantity: number; price: number; total: number; }
export interface TimelineEntry { date: string; label: string; }
export interface SalesOrder { id: string; number: string; createdAt: string; warehouseId: string; customerId?: string; customer: Customer; items: OrderItem[]; subtotal: number; discount: number; total: number; status: OrderStatus; timeline: TimelineEntry[]; }
export interface Payment { id: string; number: string; orderId: string; amount: number; status: 'Pending' | 'Verified' | 'Cancelled'; createdAt: string; verifiedAt?: string; bankReference?: string; }
export interface Receipt { id: string; number: string; orderId: string; issuedAt: string; customer: Customer; items: OrderItem[]; subtotal: number; discount: number; total: number; }
export interface Delivery { id: string; number: string; orderId: string; status: 'Preparing' | 'ReadyToShip' | 'Completed'; preparedAt: string; issuedAt?: string; shippedAt?: string; tracking?: string; customer: Customer; items: OrderItem[]; }
export interface DemoState { version: 1; revision: number; customers: CustomerRecord[]; categories: Category[]; warehouses: Warehouse[]; products: Product[]; stocks: Stock[]; transactions: StockTransaction[]; orders: SalesOrder[]; payments: Payment[]; receipts: Receipt[]; deliveries: Delivery[]; }
export interface OrderDraft { warehouseId: string; customerId?: string; customer: Customer; items: { productId: string; quantity: number }[]; discount: number; }
export const STATUS_LABELS: Record<OrderStatus, string> = {
  Draft: 'ร่าง', StockChecked: 'ตรวจสินค้าแล้ว', Confirmed: 'ยืนยันออเดอร์แล้ว',
  AwaitingPayment: 'รอชำระเงิน', Paid: 'รับเงินแล้ว', Receipted: 'ออกใบเสร็จแล้ว',
  Preparing: 'กำลังเตรียมสินค้า', ReadyToShip: 'พร้อมส่ง', Completed: 'จัดส่งสำเร็จ', Cancelled: 'ยกเลิก',
};
export const FLOW: { status: OrderStatus; label: string }[] = [
  { status: 'Draft', label: 'สร้างออเดอร์' }, { status: 'StockChecked', label: 'ตรวจสินค้า' },
  { status: 'Confirmed', label: 'ยืนยัน' }, { status: 'AwaitingPayment', label: 'แจ้งชำระ' },
  { status: 'Paid', label: 'รับเงิน' }, { status: 'Receipted', label: 'ใบเสร็จ' },
  { status: 'Preparing', label: 'เตรียมสินค้า' }, { status: 'ReadyToShip', label: 'ใบส่งของ' },
  { status: 'Completed', label: 'ส่งและตัดสต็อก' },
];
