# Entities

Entity ของทุกตารางรวมไว้ในโฟลเดอร์นี้ หนึ่ง class ต่อหนึ่งไฟล์
ชื่อ class ใช้เอกพจน์ ชื่อตารางเป็นพหูพจน์ กำหนดผ่าน Configuration ใน Infrastructure

| ไฟล์ | ตาราง |
| --- | --- |
| Product.cs | Products |
| ProductCategory.cs | ProductCategories |
| Warehouse.cs | Warehouses |
| Stock.cs | Stocks |
| StockTransaction.cs | StockTransactions |
| Customer.cs | Customers |
| SalesOrder.cs | SalesOrders |
| SalesOrderItem.cs | SalesOrderItems |
| Payment.cs | Payments |
| Receipt.cs | Receipts |
| Delivery.cs | Deliveries |
| User.cs | Users |

Entity base class อยู่ใน Common/Entity.cs: Id, CreatedAtUtc, UpdatedAtUtc และ RowVersion
CreatedAtUtc เริ่มต้นด้วย UTC เมื่อสร้าง object ส่วน UpdatedAtUtc ให้ service กำหนดตอนเปลี่ยนข้อมูล
AvailableQuantity ของ Stock เป็นค่าคำนวณและไม่เก็บซ้ำใน SQL
User เป็นข้อมูลเจ้าหน้าที่ ยังไม่มีระบบ credential, password หรือ login; ต้องออกแบบ authentication ก่อนเปิด endpoint ธุรกิจ
ดู [รายละเอียดฐานข้อมูล](../../../../docs/database/schema.md)
