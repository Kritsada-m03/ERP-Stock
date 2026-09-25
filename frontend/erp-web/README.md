# ERP Web

Angular 21.2.24 ใช้ Node.js 24.21.0 / npm 11.19.0 พร้อม standalone components, SCSS และ lazy routes
workspace ย้ายมาอยู่ frontend/erp-web ตามโครงสร้างใหม่ โดยเก็บ dependencies และ lockfile เดิมไว้

```powershell
# จาก repository root
cd frontend/erp-web
npm.cmd ci
npm.cmd start
```

เปิด http://localhost:4200; ใช้ Ctrl+C หยุด server
ถ้า Node ยังเป็นรุ่น 16 ให้ใช้ nvm use 24.21.0 แล้วเปิด terminal ใหม่
CLI ติดตั้งใน project ใช้ npx.cmd ng version ไม่ต้องติดตั้ง global

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
```

build output อยู่ที่ dist/erp-web
/api ผ่าน proxy.conf.json ไป http://localhost:5080; run backend แยกอีก terminal
main-layout, sidebar และ navbar อยู่ใน layouts; หน้าของแต่ละงานอยู่ใน features
core เก็บ auth/guards/interceptors/services และ shared เก็บ components/models/pipes/directives

หน้าจอปัจจุบันเป็น placeholder ที่บอกสถานะระหว่างพัฒนา ไม่มีการส่งข้อมูลจริง และยังไม่มีระบบ login
ดู [flow](../../docs/flow/main-flow.md) และ [คู่มือพัฒนา](../../docs/requirements/local-development.md)
