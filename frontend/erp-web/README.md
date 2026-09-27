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

ถ้าขึ้น `'ng' is not recognized` ให้ตรวจว่า terminal อยู่ที่ `frontend/erp-web` แล้วรัน `npm.cmd ci` ก่อน `npm.cmd start`
โฟลเดอร์ node_modules ไม่ถูกเก็บใน Git จึงต้องติดตั้ง dependencies ใหม่หลัง clone หรือเมื่อโฟลเดอร์นี้ถูกลบ
การพิมพ์ `ng serve` โดยตรงต้องมี CLI ใน PATH; คำสั่ง `npm.cmd start` จะใช้ CLI ของโปรเจกต์ให้อัตโนมัติ

```powershell
npm.cmd run build
npm.cmd test -- --watch=false
```

build output อยู่ที่ dist/erp-web
/api ผ่าน proxy.conf.json ไป http://localhost:5080; run backend แยกอีก terminal
main-layout, sidebar และ navbar อยู่ใน layouts; หน้าของแต่ละงานอยู่ใน features
core เก็บ auth/guards/interceptors/services และ shared เก็บ components/models/pipes/directives

หน้าจอปัจจุบันเพิ่ม/แก้ไขสินค้า รับสินค้าเข้า สร้างออเดอร์ จองสต็อก จำลองรับเงิน ออกเอกสาร และยืนยันส่งพร้อมตัดสต็อกได้ด้วยข้อมูลทดลอง
ข้อมูลเก็บใน localStorage ของเบราว์เซอร์ ภายใต้ key erp-backoffice.demo.v1 ยังไม่ได้ส่งข้อมูลไป API หรือ SQL Server
ยังไม่มีระบบ login และไม่มี QR ที่ใช้จ่ายเงินจริง เอกสารพิมพ์ระบุชัดว่าเป็นเอกสารทดลอง
กด "เริ่มข้อมูลทดลองใหม่" เพื่อคืนข้อมูลเริ่มต้น โดยระบบจะขอยืนยันก่อนลบข้อมูลทดลองในเบราว์เซอร์
ดู [flow](../../docs/flow/main-flow.md) และ [คู่มือพัฒนา](../../docs/requirements/local-development.md)
