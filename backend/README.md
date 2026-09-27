# Backend

solution อยู่ที่ [ERP.Backend/ERP.Backend.slnx](ERP.Backend/ERP.Backend.slnx) ใช้ .NET 10

```text
ERP.Backend/
├── ERP.API/
│   ├── Controllers/
│   ├── Middleware/
│   ├── Filters/
│   ├── Extensions/
│   ├── Program.cs
│   └── appsettings.json
├── ERP.Application/
│   ├── DTOs/
│   ├── Interfaces/
│   ├── Services/
│   ├── Validators/
│   └── Mappings/
├── ERP.Domain/
│   ├── Entities/
│   ├── Enums/
│   ├── Constants/
│   └── Common/
└── ERP.Infrastructure/
    ├── Data/
    ├── Repositories/
    ├── Configurations/
    ├── Migrations/
    └── Services/
```

Entity หนึ่งไฟล์ต่อหนึ่งตาราง รวมไว้ใน [Domain/Entities](ERP.Backend/ERP.Domain/Entities/README.md)
interface ของ repo อยู่ใน Application/Interfaces ส่วน implementation อยู่ใน [Infrastructure/Repositories](ERP.Backend/ERP.Infrastructure/Repositories/README.md)
DbContext และ UnitOfWork อยู่ใน Infrastructure/Data; mappings อยู่ใน Configurations

ตัวอย่างที่มีโค้ดแล้ว: ProductService → IProductRepository → ProductRepository → ErpDbContext
มี IRepository<TEntity> สำหรับอ่าน/เพิ่ม และ repositories เฉพาะลูกค้า สินค้า ออเดอร์ และสต็อก โดยยังไม่มี generic delete
CustomersController → CustomerService → CustomerRepository รองรับค้นหา เพิ่ม และแก้ไขลูกค้ารวมที่อยู่ ดู [API ลูกค้า](../docs/api/customers.md)
การปิดใช้งานใช้ IsActive=false แทนการลบ เพื่อรักษาข้อมูลอ้างอิงจากออเดอร์; การแก้ไขต้องส่ง RowVersion ล่าสุด
UnitOfWork รองรับ transaction ร่วมกับ DbContext เดียวกัน แต่ handlers ของ flow ธุรกิจยังไม่ได้พัฒนา

dependency: API → Application → Domain และ Infrastructure → Application/Domain
API อ้างอิง Infrastructure เพิ่มเฉพาะสำหรับประกอบ DI ใน Extensions; Application และ Domain ไม่อ้างกลับ Infrastructure

รันจาก repository root:
```powershell
dotnet build backend/ERP.Backend/ERP.Backend.slnx
dotnet test backend/ERP.Backend/ERP.Backend.slnx
dotnet run --project backend/ERP.Backend/ERP.API
```

ดู [การตั้งค่าเครื่องและฐานข้อมูล](../docs/requirements/local-development.md)
