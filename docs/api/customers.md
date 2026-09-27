# ข้อมูลลูกค้า

ใช้ตาราง `Customers` สำหรับผู้ซื้อ ส่วน `Users` เป็นบัญชีเจ้าหน้าที่ ไม่ใช่ทะเบียนลูกค้า
Customer มีหนึ่งที่อยู่หลักเป็นข้อความ (บ้านเลขที่ ถนน แขวง/ตำบล เขต/อำเภอ จังหวัด รหัสไปรษณีย์)
ชื่อ รหัส และที่อยู่เป็นข้อมูลจำเป็นเมื่อเพิ่มหรือแก้ไขผ่าน API; ข้อมูลติดต่ออื่นเป็นตัวเลือก
ContactName, TaxId และ Notes เพิ่มด้วย migration AddCustomerContactDetails โดยข้อมูลเก่าไม่ถูกลบ

## Endpoint

| Method | Path | ผลลัพธ์ |
| --- | --- | --- |
| GET | /api/customers?search=คำค้น&isActive=true&page=1&pageSize=20 | `{ items, total, page, pageSize }` |
| GET | /api/customers/{id} | ข้อมูลลูกค้า หรือ 404 |
| POST | /api/customers | เพิ่มลูกค้า คืน 201 และ Location |
| PUT | /api/customers/{id} | แก้ไขข้อมูลทั้งหมด คืน 200 หรือ 404 |

page เริ่ม 1, สูงสุด 1,000,000; pageSize 1–100; search ยาวไม่เกิน 200 ตัวอักษร
ค้นหารหัส ชื่อ โทรศัพท์ และอีเมล; ไม่ส่ง isActive จะค้นทุกสถานะ
ไม่เปิดลบลูกค้า ใช้ PUT พร้อม isActive=false เพื่อรักษาประวัติและ FK ของออเดอร์

ตัวอย่าง POST:

```json
{
  "code": "CUS-001",
  "name": "ลูกค้าทดลอง",
  "contactName": "ผู้ติดต่อ",
  "phone": "0812345678",
  "email": "demo@example.com",
  "address": "99 ถนนทดลอง แขวงตัวอย่าง เขตตัวอย่าง กรุงเทพฯ 10000",
  "taxId": null,
  "notes": "จัดส่งวันทำการ",
  "isActive": true
}
```

รหัสไม่ซ้ำและจัดเก็บตัวพิมพ์ใหญ่ ใช้ A–Z, 0–9, `-`, `_` ไม่เกิน 30 ตัวอักษร; ชื่อ/ผู้ติดต่อไม่เกิน 200;
ที่อยู่/หมายเหตุไม่เกิน 1,000; เลขผู้เสียภาษีถ้ามีต้องเป็นตัวเลข 13 หลัก (ตรวจรูปแบบ ไม่ได้ตรวจทะเบียนภายนอก)
ตรวจค่าหลังตัดช่องว่างหัวท้าย; รหัส ชื่อ และที่อยู่ที่เป็นช่องว่างล้วนไม่ผ่าน ส่วนช่องอื่นไม่บังคับ
กฎเบอร์โทรของรุ่นนี้รองรับเบอร์ไทย: มือถือ 10 หลักขึ้นต้น 06/08/09 หรือโทรศัพท์พื้นฐาน 9 หลักขึ้นต้น 02/03/04/05/07
ใช้ `+66` แทน 0 ตัวแรกได้ เช่น `+66 81 234 5678`; อนุญาตช่องว่างและขีดกลางในการแบ่งตัวเลข ความยาวรวมไม่เกิน 30 ตัวอักษร
ยังไม่รองรับเบอร์ต่างประเทศหรือเลขต่อภายใน; ไม่ตรวจว่าเบอร์เปิดใช้งานจริง
อีเมลไม่เกิน 254 ตัวอักษรและส่วนก่อน @ ไม่เกิน 64 ใช้รูปแบบ ASCII `name@example.com` รองรับ `+tag` และ subdomain
ไม่รับช่องว่างภายใน อักษร @ ซ้ำ จุดติดกัน หรือ domain ที่ไม่มีส่วนท้าย; การตรวจรูปแบบไม่ได้ยืนยันว่า mailbox มีอยู่จริง
ฟอร์มลูกค้า DemoStore และ API ใช้กฎเดียวกัน; หน้าออเดอร์ตรวจชื่อ โทรศัพท์ และที่อยู่ด้วยกฎชุดนี้
PUT ส่งฟิลด์ทั้งหมดพร้อม `rowVersion` ที่ได้จาก GET ล่าสุด หากข้อมูลเปลี่ยนแล้วจะคืน 409
รหัสซ้ำคืน 409; ข้อมูลไม่ผ่าน validation คืน 400
ผลลัพธ์มี `id`, `createdAtUtc`, `updatedAtUtc`, `rowVersion` เพิ่มจากข้อมูลด้านบน

## การใช้ SQL Server

ตั้งค่า ConnectionStrings:DefaultConnection ตาม [คู่มือพัฒนา](../requirements/local-development.md) แล้วรันจาก repository root:

```powershell
dotnet ef database update --project backend/ERP.Backend/ERP.Infrastructure --startup-project backend/ERP.Backend/ERP.API
dotnet run --project backend/ERP.Backend/ERP.API
```

หรือ review/run SQL idempotent ใน `database/migrations/schema.sql` ด้วย DBeaver ตามกระบวนการของเครื่องพัฒนา
งานนี้สร้าง migration และ SQL export แต่ยังไม่ได้ apply หรือทดสอบ CRUD กับ SQL Server จริง
API ยังไม่มี login/authorization ตามสถานะระบบ dev ปัจจุบัน

## หน้าบ้าน

เมนูลูกค้า `/customers` ใช้ DemoStore/localStorage เช่นเดียวกับหน้า ERP อื่นในตอนนี้ ยังไม่ได้เรียก API นี้
ลูกค้าทดลองกับข้อมูล SQL Server เป็นคนละชุด และไม่มีการ sync ให้อัตโนมัติ
เลือกลูกค้าที่เปิดใช้งานเพื่อสร้างออเดอร์ได้ และปรับที่อยู่เฉพาะออเดอร์ได้
ออเดอร์เก็บ customerId และ snapshot ของชื่อ โทรศัพท์ ที่อยู่; การแก้ข้อมูลหลักไม่เปลี่ยนเอกสารเดิม

Tests: `dotnet test backend/ERP.Backend/ERP.Backend.slnx` ตรวจ service validation, รหัสซ้ำ และ row version
ส่วน Angular tests ตรวจ persistence, ข้อมูลทดลองเก่า, snapshots, สถานะลูกค้า และ flow หน้าฟอร์ม
