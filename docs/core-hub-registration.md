# ข้อมูลยื่นลงทะเบียน Core Hub

สถานะ: ผู้ใช้ยังไม่ได้รับอนุมัติ/เปิดใช้งานระบบใน Core Hub. เอกสารนี้เป็นข้อมูลเตรียมยื่น ไม่ใช่หลักฐานการอนุมัติหรือผล L3.

เปิด [แบบฟอร์มลงทะเบียน](https://csmju2030.jowave.com/backoffice/subsystems/new) ด้วยบัญชีเจ้าของระบบ role `staff` หรือ `lecturer` ที่ทีมจัดให้. บัญชี `student` ยื่นไม่ได้. ไม่ต้องส่งรหัสผ่านหรือ token ในแชตหรือ commit ลง Git.

| ช่อง | ค่าที่กรอก |
|---|---|
| ชื่อระบบ (`name`) | `csmju-interactive-map` |
| ชื่อแสดง (`displayName`) | `CSMJU Interactive Map` |
| Repository | `github.com/CSMJU2030/csmju-interactive-map` |
| Callback URL | `http://localhost:3216/auth/callback` — **ใช้ค่านี้เมื่อทีมยืนยันว่าได้รับพอร์ต frontend 3216 แล้วเท่านั้น** |
| Base URL | เว้นว่างขณะทดสอบบน localhost; server ของ Core Hub เข้าถึง localhost ของเครื่องนี้ไม่ได้ |
| Standards version ในฟอร์ม | คู่มือ v1.7.4 ระบุว่าฟอร์มมีตัวเลือก `1.0` เป็นข้อมูลประกอบ; ถ้าฟอร์มมีตัวเลือกใหม่ ให้เลือกตามคำแนะนำทีมกลาง |
| รุ่น standards จริงของโค้ด | `1.7.4` ใน `.standards-version`, `subsystem.yaml` และ submodule |
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

หลังส่งคำขอ ให้แจ้ง PL/admin ระบบกลางว่า: “ขออนุมัติระบบ `csmju-interactive-map` และเปิดใช้งานให้เป็น APPROVED/ACTIVE เพื่อทดสอบ SSO และ conformance L3; callback สำหรับพอร์ตที่ได้รับคือ `http://localhost:3216/auth/callback`.” เปลี่ยนพอร์ตในข้อความนี้หากทีมจัดสรรต่างออกไป. การอนุมัติและเปิดใช้งานเป็นสิทธิ์ของ admin ระบบกลาง.

เมื่อได้รับอนุมัติแล้ว เปิดเว็บด้วย `http://localhost:3216` ให้ตรง host ที่ลงทะเบียน (`127.0.0.1` เป็นคนละ host สำหรับคุกกี้), ทดสอบเข้า/ออกระบบ แล้วรัน L3 ด้วยบัญชีทดสอบของทีมทุก role. เก็บไฟล์บัญชี conformance ไว้นอก repo. ยังห้ามสรุปว่า L3 ผ่านก่อนมีผลจากระบบจริง.

เมื่อ deploy จริง ให้ PL/admin เปลี่ยน callback เป็น `https://<โดเมนจริง>/auth/callback` และ Base URL เป็น `https://<โดเมนจริง>` ก่อนเปิด production. ห้ามเดาโดเมนหรือพอร์ตที่ยังไม่ได้จัดสรร.

อ้างอิง: [Subsystem Registry v1.7.4](https://github.com/CSMJU2030/csmju2030-standards/blob/v1.7.4/docs/subsystem-registry.md), [คู่มือเชื่อมต่อ Core Hub](https://github.com/CSMJU2030/csmju2030-standards/blob/v1.7.4/docs/connect-core-hub.md).
