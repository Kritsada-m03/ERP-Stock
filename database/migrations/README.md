# SQL migration exports

เก็บ SQL ที่ generate จาก EF Core migrations เพื่อ review ใน DBeaver
schema.sql เป็น idempotent SQL export ของ InitialCreate สำหรับตารางธุรกิจ 12 ตาราง
ไฟล์ C# migration และ model snapshot อยู่ที่ backend/ERP.Backend/ERP.Infrastructure/Migrations
อย่าแก้ SQL export แทนการแก้ Entity/Configuration และสร้าง migration ใหม่

คำสั่งจาก repository root:
```powershell
dotnet ef migrations script --idempotent --project backend/ERP.Backend/ERP.Infrastructure --startup-project backend/ERP.Backend/ERP.API --output database/migrations/schema.sql
```

การ export ไม่ได้เชื่อมต่อหรือ apply กับฐานข้อมูลจริง
