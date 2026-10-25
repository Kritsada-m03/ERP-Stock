# API รับ–ส่งธนาคารแบบจำลอง

โมดูล: [ERP.BankIntegration](../../backend/ERP.Backend/ERP.BankIntegration/README.md)
เปิดเฉพาะ Development ค่าเริ่มต้น Mock; ไม่ต้องเปิด SQL Server เพื่อทดลอง endpoints เหล่านี้
เป็นสัญญา API ของระบบทดลอง ไม่ใช่สเปกธนาคารจริง

| Method | Endpoint | ผู้เรียก / หน้าที่ |
| --- | --- | --- |
| POST | /api/banking/payments | เว็บไซต์ส่งคำขอใหม่ไปตัวเชื่อม |
| GET | /api/banking/payments/{requestId} | เว็บไซต์อ่านคำขอและรายการ callback ที่รับไว้ |
| POST | /api/banking/callbacks | ฝั่งจำลองธนาคารส่งผลกลับ; API ตอบ acknowledgement |

## ทดลองจาก PowerShell

ตั้ง `BankIntegration:CallbackKey` ผ่าน User Secrets หรือ environment แล้วเปิด API ใน Development
ในตัวอย่างนี้เลือก key ทดลองเองอย่างน้อย 32 ตัวอักษรและตั้งเฉพาะเครื่องพัฒนา:

```powershell
# Terminal 1 (รันจาก repository root)
$bankDemoKey = Read-Host 'ตั้ง key ทดลองอย่างน้อย 32 ตัวอักษร'
$env:BankIntegration__CallbackKey = $bankDemoKey
dotnet run --project backend/ERP.Backend/ERP.API
```

```powershell
# Terminal 2 ใส่ key เดียวกับ terminal 1 (ไม่ใส่ลง Angular)
$bankDemoKey = Read-Host 'key ทดลองเดียวกับ API'
$api = 'http://localhost:5080'
$payment = Invoke-RestMethod -Method Post -Uri "$api/api/banking/payments" -ContentType 'application/json' -Body (@{
    orderReference = 'SO-DEMO-001'; amount = 125.00; currency = 'THB'
} | ConvertTo-Json)
$payment

$callback = @{
    eventId = [guid]::NewGuid().ToString('N')
    requestId = $payment.requestId
    bankReference = $payment.bankReference
    amount = $payment.amount
    currency = 'THB'
    status = 'Paid'
} | ConvertTo-Json
$headers = @{ 'X-Bank-Callback-Key' = $bankDemoKey }
Invoke-RestMethod -Method Post -Uri "$api/api/banking/callbacks" -Headers $headers -ContentType 'application/json' -Body $callback
# ส่งเดิมซ้ำ: duplicate=true และไม่เพิ่ม event ซ้ำ
Invoke-RestMethod -Method Post -Uri "$api/api/banking/callbacks" -Headers $headers -ContentType 'application/json' -Body $callback
Invoke-RestMethod -Uri "$api/api/banking/payments/$($payment.requestId)" | ConvertTo-Json -Depth 6
```

POST payments คืน 201 พร้อม Location และข้อมูล:

```json
{
  "requestId": "<generated-guid>",
  "orderReference": "SO-DEMO-001",
  "amount": 125.00,
  "currency": "THB",
  "bankReference": "MOCK-<generated-id>",
  "providerStatus": "Pending",
  "mode": "Mock",
  "createdAtUtc": "<UTC timestamp>"
}
```

callback ที่รับสำเร็จคืน HTTP 200:

```json
{ "eventId": "<event-id>", "received": true, "duplicate": false }
```

GET คืน `{ request, callbacks }` แต่ละ callback มี `{ payload, receivedAtUtc }`
`providerStatus` ใน request เป็นคำตอบตอนสร้าง request ไม่ถูกเขียนทับด้วย callback
ไม่ควรใช้ received หรือ providerStatus ไปออกใบเสร็จอัตโนมัติในขั้นนี้

| HTTP | ความหมาย |
| --- | --- |
| 400 | ข้อมูลไม่ครบ/ผิดรูปแบบ ยอดเงินผิด หรือทศนิยมเกิน 2 ตำแหน่ง |
| 401 | callback key ไม่ถูกต้อง/ไม่ได้ส่ง |
| 404 | ไม่พบ request หรือโมดูลปิดใช้งาน/ไม่ใช่ Development |
| 409 | reference/ยอดไม่ตรง หรือใช้ EventId เดิมกับข้อมูลต่างกัน |
| 502 | ตัวเชื่อม HTTP ไม่สำเร็จ รวม timeout หรือ response ผิดรูปแบบ |
| 503 | ยังไม่ตั้ง callback key ที่ยาวอย่างน้อย 32 ตัวอักษร |

## SandboxHttp (สำหรับ test server ของเราเท่านั้น)

ตั้ง server-side options ต่อไปนี้ผ่าน environment/User Secrets:

```text
BankIntegration:Mode = SandboxHttp
BankIntegration:SandboxBaseUrl = http://localhost:5099/
BankIntegration:SandboxApiKey = <optional-test-key>
BankIntegration:CallbackKey = <test-callback-key-at-least-32-characters>
BankIntegration:TimeoutSeconds = 15
```

BaseUrl ต้องลงท้าย `/`, ใช้ HTTPS หรือ HTTP เฉพาะ localhost, ไม่ใส่ username/password/query/fragment
ส่ง `POST {SandboxBaseUrl}payments` ด้วย JSON `{ requestId, orderReference, amount, currency }`
ถ้าตั้ง SandboxApiKey จะส่ง header `X-Sandbox-Api-Key`; response ของ test server ต้องเป็น
`{ "bankReference": "TEST-001", "status": "Pending" }` (สถานะที่รับได้ Pending/Paid/Failed/Cancelled)
test server ต้องตั้ง URL callback ของเราเอง โมดูลไม่ได้ส่ง URL callback ที่ผู้ใช้กำหนดใน request
ไม่มี sandbox server ของธนาคารจริงให้ใช้อัตโนมัติ; default Mock ใช้ได้โดยไม่ตั้ง server นี้

การใช้งานหน้าบ้าน: เรียก POST/GET ผ่าน `/api/banking/...` ได้ผ่าน dev proxy เดิม
callback key เป็นข้อมูลระหว่าง backend กับตัวจำลองธนาคารเท่านั้น ไม่ใส่ในโค้ดหน้าบ้าน
Angular เดิมยังคงใช้ DemoStore; งานนี้เพิ่มเฉพาะ Backend ตามขอบเขตที่ขอ
