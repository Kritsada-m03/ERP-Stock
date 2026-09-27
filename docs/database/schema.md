# ฐานข้อมูล

Entity จริงอยู่ใน backend/ERP.Backend/ERP.Domain/Entities และ Fluent mappings อยู่ใน ERP.Infrastructure/Configurations
ใช้ EF Core migrations ใน ERP.Infrastructure/Migrations เป็นแหล่งกำหนด schema หลัก
database/migrations ใช้เก็บ SQL ที่ export จาก EF เพื่อเปิดตรวจใน DBeaver ไม่ดูแล CREATE TABLE อีกชุดด้วยมือ

## ตารางปัจจุบัน

| ตาราง | ข้อมูลหลัก |
| --- | --- |
| Products | SKU, ชื่อ, หมวดหมู่, UnitName, ราคาขาย, จุดสั่งซื้อ, IsActive |
| ProductCategories | หมวดหมู่สินค้า |
| Warehouses | รหัสและชื่อคลัง |
| Stocks | ProductId + WarehouseId แบบ unique, OnHandQuantity, ReservedQuantity |
| StockTransactions | StockId, ประเภทรายการ, QuantityDelta, Order/Delivery, ผู้ทำ, เหตุผล, OperationKey unique |
| Customers | รหัส ชื่อ/บริษัท ผู้ติดต่อ โทรศัพท์ อีเมล ที่อยู่ เลขผู้เสียภาษี หมายเหตุ และ IsActive |
| SalesOrders | เลข order, ลูกค้า, คลัง, ผู้สร้าง, สถานะ, snapshot, ยอดเงิน |
| SalesOrderItems | order, สินค้า, snapshot ชื่อ/หน่วย/ราคา, จำนวน, จำนวนจอง, ส่วนลด, ยอดรายการ |
| Payments | order, เลขชำระ, ยอด THB, QR/reference, สถานะและผู้ตรวจรับเงิน |
| Receipts | order/payment, เลขใบเสร็จ, ผู้/วันออก, ยอด, JSON snapshot |
| Deliveries | order, เลขใบส่งของ, ผู้รับ/ที่อยู่, สถานะเตรียม/ส่ง, วันออกเอกสาร/ส่ง/ตัดสต็อก, JSON snapshot |
| Users | ชื่อบัญชี ชื่อเจ้าหน้าที่ email และ IsActive; ยังไม่มี credentials หรือระบบ login |

ตารางธุรกิจใช้ Guid เป็น key มี CreatedAtUtc, UpdatedAtUtc และ SQL Server rowversion จาก base Entity
เวลาเหตุการณ์เก็บ UTC; วันเอกสารใช้ DateOnly ตามวันธุรกิจที่กำหนดตอนออก
เงินใช้ decimal(18,2), จำนวนใช้ decimal(18,3) และข้อความภาษาไทยใช้ nvarchar
รุ่นนี้เก็บชื่อหน่วยใน Product และ snapshot ใน order item ตามชุด Entity 12 ตัวที่กำหนด

Customers ใช้กับลูกค้าที่ซื้อสินค้า ส่วน Users ใช้กับเจ้าหน้าที่ผู้สร้างรายการ
ที่อยู่ลูกค้าเก็บเป็นข้อความหนึ่งที่อยู่ใน Address (สูงสุด 1,000 ตัวอักษร); API บังคับกรอก แต่คอลัมน์ยัง nullable เพื่อรองรับข้อมูลเดิม
ContactName (200), TaxId (13) และ Notes (1,000) เพิ่มด้วย AddCustomerContactDetails และเป็นข้อมูลไม่บังคับ
เลขผู้เสียภาษีตรวจรูปแบบตัวเลข 13 หลัก ไม่ได้ตรวจสอบทะเบียนภาษีภายนอก

## เงื่อนไขที่มีใน mapping

- SKU, รหัสคลัง/ลูกค้า, UserName และเลขเอกสารต้องไม่ซ้ำ
- สต็อกต้องไม่ติดลบ และ Reserved อยู่ระหว่างศูนย์กับ OnHand
- Order item ต้องมีจำนวนมากกว่าศูนย์ และจำนวนจองไม่เกินจำนวนสั่ง
- Payment ยอดมากกว่าศูนย์และสกุลเงิน THB
- Payment ที่ Verified มีได้หนึ่งรายการต่อ order; bank transaction reference ห้ามใช้ซ้ำ
- Receipt มีได้หนึ่งใบต่อ order และ PaymentId ต้องเป็นของ order เดียวกันผ่าน composite FK
- Delivery มีได้หนึ่งใบต่อ order ในรุ่นส่งครบครั้งเดียว
- Snapshot เป็น JSON ที่ถูกต้อง และทุก FK ใช้ restrict เพื่อไม่ลบประวัติตามกัน
- StockTransaction ป้องกัน OperationKey ซ้ำและ QuantityDelta เป็นศูนย์

## กฎที่ยังต้องทำใน services

Mapping ไม่ได้ทำให้ flow ใช้งานได้ทันที: ต้องบังคับลำดับสถานะ ความสอดคล้องของยอด จำนวนส่ง และยอดจองใน Application
Subtotal เท่ากับผลรวม LineTotal; LineTotal = Round(Quantity × UnitPrice, 2, AwayFromZero) - DiscountAmount
TotalAmount = Subtotal - ส่วนลดท้าย order; ห้ามเชื่อยอดจาก frontend
Repository อ่านสต็อกอย่างเดียวไม่ป้องกัน overselling ต้อง update พร้อมตรวจ RowVersion/available ภายใน transaction
ต้องเพิ่มระบบ audit, เลขเอกสาร, idempotency ของทั้ง request และ authentication ก่อนเปิด endpoint ธุรกิจ
ยังไม่มีการเรียก database update หรือทดสอบกับ SQL Server จริง

ดู [ERD](../../database/diagrams/erp.mmd), [flow](../flow/main-flow.md) และ [คำสั่ง migrations](../requirements/local-development.md)
