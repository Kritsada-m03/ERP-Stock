# Repositories

- Repository<TEntity>: GetByIdAsync, ListAsync แบบแบ่งหน้า และ AddAsync
- ProductRepository: ค้นสินค้าด้วย SKU
- SalesOrderRepository: โหลดออเดอร์พร้อม Items
- StockRepository: โหลด Stock ตาม ProductId และ WarehouseId

interfaces อยู่ใน ERP.Application/Interfaces
query ที่ใช้แก้ข้อมูลมี tracking; ListAsync ใช้ AsNoTracking
ทุก repo รับ ErpDbContext ผ่าน DI แบบ scoped และไม่มี SaveChanges ของตัวเอง
ใช้ IUnitOfWork.SaveChangesAsync หรือ ExecuteInTransactionAsync ใน Application service เพื่อกำหนดขอบเขตการบันทึก

นี่เป็น data-access foundation ยังไม่มีคำสั่งจอง/ตัดสต็อก ยืนยันเงิน หรือออกเอกสาร
การเรียก GetByProductAsync อย่างเดียวไม่ป้องกันการจองพร้อมกัน; handler ต้องตรวจยอดใน transaction และรับมือ DbUpdateConcurrencyException จาก RowVersion
ห้ามเพิ่ม generic Delete ให้ใบเสร็จและประวัติสต็อกที่ออกแล้ว
