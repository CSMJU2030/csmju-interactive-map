# ข้อมูลยื่นลงทะเบียน Core Hub

ผู้ใช้ยืนยัน URL/Callback production วันที่ 8 ตุลาคม 2026. ยังไม่ได้ตรวจสถานะ APPROVED/ACTIVE ใน Core Hub; เอกสารนี้ไม่ใช่หลักฐานการอนุมัติหรือผล L3.

เปิด [แบบฟอร์มลงทะเบียน](https://csmju2030.jowave.com/backoffice/subsystems/new) ด้วยบัญชีเจ้าของระบบ role `staff` หรือ `lecturer` ที่ทีมจัดให้. บัญชี `student` ยื่นไม่ได้. ไม่ต้องส่งรหัสผ่านหรือ token ในแชตหรือ commit ลง Git.

| ช่อง | ค่าที่กรอก |
|---|---|
| ชื่อระบบ (`name`) | `csmju-interactive-map` |
| ชื่อแสดง (`displayName`) | `CSMJU Interactive Map` |
| Repository | `github.com/CSMJU2030/csmju-interactive-map` |
| Callback URL | `https://csmju-interactive-map.jowave.com/auth/callback` |
| Base URL | `https://csmju-interactive-map.jowave.com` |
| Standards version ในฟอร์ม | คู่มือ v1.7.4 ระบุว่าฟอร์มมีตัวเลือก `1.0` เป็นข้อมูลประกอบ; ถ้าฟอร์มมีตัวเลือกใหม่ ให้เลือกตามคำแนะนำทีมกลาง |
| รุ่น standards จริงของโค้ด | `1.8.4` ใน `.standards-version`, `subsystem.yaml` และ submodule |
| สิทธิ์พิเศษ (`requestedExceptions`) | ไม่มี |

พอร์ตที่ repo ตั้งไว้ปัจจุบันคือ frontend **3216**, backend **4202**. Callback ต้องใช้พอร์ต frontend และ path `/auth/callback`. อย่าใช้ `/auth/login` หรือพอร์ต backend. ถ้าทีมจัดสรรพอร์ตอื่น ต้องแก้ค่า frontend/callback ใน environment และ manifest ให้ตรงกันก่อนยื่น.

Role mapping ที่ต้องกรอกให้ตรงกับระบบ:

```json
{
  "student": "STUDENT",
  "alumni": "ALUMNI",
  "staff": "STAFF",
  "lecturer": "STAFF",
  "guest": "ALUMNI",
  "admin": "ADMIN"
}
```

หากทะเบียนยังไม่ APPROVED/ACTIVE ให้เจ้าของระบบประสาน PL/admin ระบบกลางเพื่ออนุมัติและเปิดใช้งานระบบ `csmju-interactive-map`; callback production คือ `https://csmju-interactive-map.jowave.com/auth/callback`. การอนุมัติและเปิดใช้งานเป็นสิทธิ์ของ admin ระบบกลาง.

เมื่อบริการบน server พร้อมและทะเบียนได้รับอนุมัติแล้ว เปิดเว็บด้วย `https://csmju-interactive-map.jowave.com`, ทดสอบเข้า/ออกระบบ แล้วรัน L3 ด้วยบัญชีทดสอบของทีมทุก role. เก็บไฟล์บัญชี conformance ไว้นอก repo. ยังห้ามสรุปว่า L3 ผ่านก่อนมีผลจากระบบจริง.

ให้ PL/admin ตรวจ callback/Base URL ในทะเบียนให้ตรงกับตารางด้านบน. การรันในเครื่องที่ `http://localhost:3216` ใช้คนละ origin; หากทะเบียนมีเพียง callback production การเข้าสู่ระบบจะกลับไปยังโดเมน production.

อ้างอิง: [Subsystem Registry v1.7.4](https://github.com/CSMJU2030/csmju2030-standards/blob/v1.7.4/docs/subsystem-registry.md), [คู่มือเชื่อมต่อ Core Hub](https://github.com/CSMJU2030/csmju2030-standards/blob/v1.7.4/docs/connect-core-hub.md).
