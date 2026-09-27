# ERP Backoffice

ระบบสำหรับเจ้าหน้าที่ ใช้ C# / .NET 10, Angular 21 และ SQL Server โดยใช้ DBeaver ตรวจสอบข้อมูล
โครงสร้างภายในใช้ชื่อ erp-backoffice ตามแบบ; โฟลเดอร์ Git บนเครื่องยังชื่อ ERP-Stock

## สถานะปัจจุบัน

- backend: 4 application projects และโปรเจกต์ทดสอบ, Entities 12 ตัว, EF Core mappings, Repository และ UnitOfWork
- API: มี GET /api/system/health และ API ค้นหา/เพิ่ม/แก้ไขลูกค้า /api/customers; ยังไม่มี authentication
- frontend: Angular 21 พร้อมหน้าลูกค้า สินค้า สต็อก ออเดอร์ รับเงินจำลอง ใบเสร็จและจัดส่ง โดยใช้ข้อมูลทดลองใน localStorage ยังไม่เชื่อม API/SQL Server
- database: มี InitialCreate และ AddCustomerContactDetails migrations พร้อม SQL export และ ERD; ยังไม่ได้เชื่อมต่อหรือสร้างฐานข้อมูลบน SQL Server
- ไม่รวม Docker หรือ deployment ในรอบนี้

## โครงสร้าง

```text
ERP-Stock/
├── backend/ERP.Backend/
│   ├── ERP.Backend.slnx
│   ├── ERP.API/
│   ├── ERP.Application/
│   ├── ERP.Domain/
│   └── ERP.Infrastructure/
├── frontend/erp-web/
├── database/
│   ├── scripts/
│   ├── migrations/
│   ├── seed/
│   └── diagrams/
├── docs/
│   ├── api/
│   ├── database/
│   ├── flow/
│   └── requirements/
└── .config/dotnet-tools.json
```

## รันบนเครื่องพัฒนา

Backend จาก root ของ repository:

```powershell
dotnet restore backend/ERP.Backend/ERP.Backend.slnx
dotnet run --project backend/ERP.Backend/ERP.API
```

ตรวจที่ http://localhost:5080/api/system/health (ตรวจว่า API ทำงาน ไม่ได้ตรวจฐานข้อมูล)

Frontend เปิดอีก terminal ใช้ Node.js 24.21.0:

```powershell
cd frontend/erp-web
npm.cmd ci
npm.cmd start
```

เปิด http://localhost:4200; dev proxy ส่ง /api ไป backend ที่ port 5080
คำสั่ง build/test และวิธีตั้ง connection string อยู่ใน [คู่มือพัฒนา](docs/requirements/local-development.md)

## เอกสาร

- [Flow หลัก](docs/flow/main-flow.md)
- [สถาปัตยกรรมและ dependency](docs/requirements/architecture.md)
- [ขอบเขตและงานที่ยังต้องทำ](docs/requirements/scope.md)
- [แบบฐานข้อมูล](docs/database/schema.md)
- [API ที่มีจริงและ API ที่วางแผน](docs/api/README.md)
- [คู่มือ backend](backend/README.md)
- [คู่มือ frontend](frontend/erp-web/README.md)
