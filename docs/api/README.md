# API

## Endpoint ที่เปิดอยู่

GET http://localhost:5080/api/system/health

```json
{"status":"ok","service":"ERP.API","databaseChecked":false}
```

ใช้ตรวจว่า process/API ทำงาน ไม่ใช่ SQL Server health check
มี API ลูกค้าสำหรับค้นหา/อ่าน/เพิ่ม/แก้ไขที่ `/api/customers` ดู [สัญญา API ลูกค้า](customers.md)
ยังไม่มี authentication; API ลูกค้าต้องตั้งค่า connection string และ apply migrations ก่อนใช้กับ SQL Server
Frontend dev proxy ส่ง /api ไป port 5080

มี [API รับ–ส่งธนาคารจำลอง](banking.md) แยกที่ `/api/banking/payments` และ `/api/banking/callbacks`
เปิดเฉพาะ Development ใช้ memory และไม่เปลี่ยนสถานะการชำระเงินของ ERP

## Endpoint ที่วางแผนไว้

| กลุ่ม | ตัวอย่างเส้นทางในอนาคต |
| --- | --- |
| สินค้า | /api/products, /api/product-categories |
| คลัง/สต็อก | /api/warehouses, /api/stocks, /api/stock-transactions |
| ออเดอร์ | /api/sales-orders และคำสั่ง check-stock / confirm |
| ชำระเงิน | /api/payments และคำสั่ง generate-qr / verify |
| ใบเสร็จ | /api/receipts |
| จัดส่ง | /api/deliveries และคำสั่ง prepare / issue-document / ship |

รายการนี้ยังไม่ได้ implement; ต้องเพิ่ม login/roles, validation, status transitions, concurrency และ idempotency ก่อนเปิดใช้งาน
ใช้ command endpoint เปลี่ยนสถานะ ไม่เปิด PATCH status อิสระ
Controller รับ/คืน DTO และเรียก Application services
