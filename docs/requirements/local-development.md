# พัฒนาบนเครื่อง

ใช้ .NET SDK 10, EF Core 10.0.11, Angular/CLI 21.2.24, Node.js 24.21.0 และ npm 11.19.0
Node.js 24 อยู่ในรุ่นที่ [Angular 21 รองรับ](https://angular.dev/reference/versions)

## Backend

จาก repository root:

```powershell
dotnet restore backend/ERP.Backend/ERP.Backend.slnx
dotnet build backend/ERP.Backend/ERP.Backend.slnx
dotnet run --project backend/ERP.Backend/ERP.API
```

API ใช้ http://localhost:5080; GET /api/system/health ไม่เชื่อมต่อฐานข้อมูล
appsettings.json มีตัวอย่าง local SQL Server ที่ไม่มี password ใช้ ErpBackofficeDev
ถ้าต้องเปลี่ยน ให้ตั้ง User Secrets (เปลี่ยน placeholder เป็นค่าของ instance ของตนเอง):

```powershell
dotnet user-secrets set 'ConnectionStrings:DefaultConnection' '<your-local-connection-string>' --project backend/ERP.Backend/ERP.API
```

ห้ามใส่ secret ลง Git หรือ Angular
Integrated Security ใช้บัญชี Windows ปัจจุบัน; host/port และวิธี authentication ต้องตรงกับ SQL Server ของเครื่อง
TrustServerCertificate=True ในตัวอย่างใช้สำหรับ local development เท่านั้น

## Frontend

```powershell
nvm use 24.21.0
cd frontend/erp-web
npm.cmd ci
npm.cmd start
```

เปิด http://localhost:4200; proxy.conf.json ส่ง /api/** ไป http://localhost:5080
Build: npm.cmd run build
Tests: npm.cmd test -- --watch=false
ใช้ npm.cmd/npx.cmd บน PowerShell หาก execution policy ปิดกั้น .ps1

## EF migrations

[EF migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/) เป็นแหล่งควบคุม schema
ใช้ SQL Server provider ตาม [เอกสาร Microsoft](https://learn.microsoft.com/en-us/ef/core/providers/sql-server/)
มี InitialCreate และ model snapshot แล้ว ไม่ต้องสร้าง initial migration ซ้ำ
คำสั่งต่อไปนี้รันจาก repository root:

```powershell
dotnet tool restore
# เมื่อแก้ entities/mappings ในอนาคต ให้แทน DescribeChange ด้วยชื่อการเปลี่ยนแปลง
dotnet ef migrations add DescribeChange --project backend/ERP.Backend/ERP.Infrastructure --startup-project backend/ERP.Backend/ERP.API --output-dir Migrations
dotnet ef migrations script --idempotent --project backend/ERP.Backend/ERP.Infrastructure --startup-project backend/ERP.Backend/ERP.API --output database/migrations/schema.sql
```

ตรวจ SQL ก่อนใช้จริง ขั้น scaffold ไม่เรียก database update ให้อัตโนมัติ
เมื่อตั้งค่า dev instance แล้วจึงใช้:
```powershell
dotnet ef database update --project backend/ERP.Backend/ERP.Infrastructure --startup-project backend/ERP.Backend/ERP.API
```

## DBeaver

ต้องมี SQL Server instance แยกจาก DBeaver
สร้าง connection ชนิด SQL Server ใส่ host, port/instance, database ErpBackofficeDev และ credentials ให้ตรงกับ backend
ใช้ DBeaver ดูตารางและ query สำหรับตรวจสอบ ไม่แก้ schema ด้วยมือแยกจาก migrations
ยังไม่ได้ทดสอบเชื่อมต่อ SQL Server หรือรัน migration กับฐานข้อมูลในงานนี้
