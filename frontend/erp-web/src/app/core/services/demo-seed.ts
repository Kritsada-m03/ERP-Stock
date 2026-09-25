import { DemoState } from '../../shared/models/erp.models';

export function createDemoState(): DemoState {
  const date = new Date().toISOString();
  const products = [
    { id: 'p1', sku: 'OFF-001', name: 'กระดาษ A4 80 แกรม', categoryId: 'c1', unit: 'รีม', price: 125, reorderPoint: 20, active: true },
    { id: 'p2', sku: 'OFF-002', name: 'ปากกาลูกลื่นสีน้ำเงิน', categoryId: 'c1', unit: 'กล่อง', price: 85, reorderPoint: 10, active: true },
    { id: 'p3', sku: 'PKG-001', name: 'กล่องพัสดุ ขนาด M', categoryId: 'c2', unit: 'ใบ', price: 18, reorderPoint: 50, active: true },
    { id: 'p4', sku: 'PKG-002', name: 'เทปใสปิดกล่อง 2 นิ้ว', categoryId: 'c2', unit: 'ม้วน', price: 35, reorderPoint: 15, active: true },
    { id: 'p5', sku: 'OFF-003', name: 'แฟ้มเอกสาร A4', categoryId: 'c1', unit: 'เล่ม', price: 45, reorderPoint: 10, active: true },
    { id: 'p6', sku: 'CLN-001', name: 'น้ำยาทำความสะอาด 1 ลิตร', categoryId: 'c3', unit: 'ขวด', price: 79, reorderPoint: 12, active: true },
  ];
  const quantities = [120, 38, 240, 8, 64, 6];
  return {
    version: 1, revision: 0,
    categories: [{ id: 'c1', name: 'เครื่องเขียน' }, { id: 'c2', name: 'บรรจุภัณฑ์' }, { id: 'c3', name: 'ของใช้ทั่วไป' }],
    warehouses: [{ id: 'w1', code: 'MAIN', name: 'คลังหลัก' }, { id: 'w2', code: 'BRANCH', name: 'คลังสาขา' }],
    products,
    stocks: products.map((p, i) => ({ productId: p.id, warehouseId: 'w1', onHand: quantities[i], reserved: 0 })),
    transactions: products.map((p, i) => ({ id: 'seed-' + p.id, date, productId: p.id, warehouseId: 'w1', type: 'Receive', quantity: quantities[i], reference: 'OPENING', note: 'ยอดเริ่มต้นสำหรับทดลอง' })),
    orders: [], payments: [], receipts: [], deliveries: [],
  };
}
