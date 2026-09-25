# Database

- scripts/: query สำหรับพัฒนาและตรวจข้อมูล
- migrations/: SQL ที่ export จาก EF migrations เพื่อ review หรือเปิดใน DBeaver
- seed/: พื้นที่สำหรับข้อมูลทดสอบที่ไม่มีข้อมูลจริง
- diagrams/: ERD ของ Entities ปัจจุบัน

schema source อยู่ที่ backend/ERP.Backend/ERP.Infrastructure/Configurations และ Migrations
ดู [แบบฐานข้อมูล](../docs/database/schema.md) และ [วิธีใช้ EF tools](../docs/requirements/local-development.md)
ยังไม่ได้สร้างหรือเปลี่ยนฐานข้อมูล SQL Server จริง
