# ผลทดสอบ Interactive Map กับ Core Hub/main จริง

วันที่ 3 ตุลาคม 2026. Source: [csmju-core-hub/main](https://github.com/CSMJU2030/csmju-core-hub/tree/main), commit `a1df242e96545cf7941d976a3bbeeff673cd153e`.

**SSO L3 ผ่านในสภาพแวดล้อมแยก: 71 PASS / 0 FAIL / 0 SKIP / 0 WARN. ยังไม่ใช่การรับรองระบบบน Core Hub จริง และ main ยังไม่มี API ห้อง/บุคลากรที่แผนที่ต้องใช้.**

## สิ่งที่รัน

- Core Hub เป็น NestJS backend ของ main จริง ไม่ใช้ fake Core. คัดออกเฉพาะ source/schema/migrations/test ด้วย sparse checkout ไม่มีการโหลดหรือรัน seed/CSV ข้อมูลนักศึกษาจริง
- Core Hub ติดตั้งตาม lockfileด้วย pnpm 12.3.4, Node 22.22.0. migrate deploy ทั้ง 4 migrations ผ่าน; build/typecheck/lint ผ่าน; unit tests เดิม **35/35 ผ่าน**
- ฐานข้อมูลแยก 2 ชุดบน PostgreSQL ชั่วคราวพอร์ต 55442: `csmju_core_main_integration_db` และ `csmju_map_core_main_integration_db`. ไม่แก้ฐานข้อมูลผู้ใช้หรือเซิร์ฟเวอร์จริง
- สร้าง RSA key ใหม่และบัญชีจำลอง 6 roles (student, alumni, staff, lecturer, guest, admin) กับทะเบียนจำลอง APPROVED/ACTIVE ในฐานข้อมูลทดสอบเท่านั้น. ไม่มีการลงทะเบียน/อนุมัติระบบบน server จริง
- Core API `localhost:3092`, backend แผนที่ `localhost:4292`, Next.js frontend proxy `localhost:3292`. ค่าพอร์ตตั้งเฉพาะ process ไม่แก้ .env ส่วนตัว
- Core web URL `localhost:3192` ใช้เทียบ redirect ตาม runner; ไม่รันเว็บ Core และไม่ได้ตรวจการกดเข้าสู่ระบบผ่าน browser/MJU SSO. Runner เรียก Core API จริงแทนเว็บตามวิธีทดสอบมาตรฐาน

## ผล runtime

| การทดสอบ | ผล |
|---|---|
| L1/L2/L3 จาก runner รวมกัน | 71 ผ่าน, 0 fail, 0 skip, 0 warning |
| JWKS, RS256 และ Core token | ผ่าน |
| mapping ทั้ง 6 roles และ API 401/403/400/404 | ผ่าน |
| sign-in/state, callback, HttpOnly session, session เรียก /me | ผ่าน |
| ปฏิเสธ token ปลอม, state ผิด/หาย, callback ปลอม, open redirect | ผ่าน |
| logout และลบ subsystem cookies | ผ่าน |
| GET แผนที่ `/api/v1/places` ผ่าน Next.js proxy | 200 |
| Core main `/api/v1/rooms` และ `/api/v1/people` | **404: ไม่มี endpoint ใน branch นี้** |
| Map `/api/v1/places/core-rooms` และ `/api/v1/lecturers/core-people` | **503 SERVICE_UNAVAILABLE** เพราะ Core main ขาด API กลาง |
| Core Hub จริง health/JWKS | 200; JWKS เป็น RFC 7517 ดิบ มี RS256 signing key |
| Core Hub จริง rooms/people โดยไม่มีบัญชี | 401; ยังไม่ยืนยันผลด้วย token ผู้ใช้จริง |

L3 runner ทดสอบ API contract และ SSO รวม create probe ที่สร้าง landmark ของระบบเอง จึงสามารถผ่านแม้ Core main ไม่มี rooms/people. การตรวจ domain เพิ่มเติมทำให้เห็นข้อจำกัดนี้. ไม่เพิ่มห้อง/บุคลากรปลอมหรือเขียน fallback local data เพื่อซ่อนปัญหา

ตัว runner แสดง protocol version **v1.2** ใน JSON/ข้อความ; ไฟล์ runner ที่ใช้มาจาก standards submodule **v1.7.1** (`cf297f01dac5b5a5120e424f7f3b4819be101556`), ไม่ได้ลดเวอร์ชันมาตรฐาน

## หลักฐาน

- [Conformance JSON](verification/core-main-conformance.json)
- [Conformance log](verification/core-main-conformance.log)
- [Domain / live unauthenticated probes](verification/core-main-domain-probes.json)
- [Core unit test log](verification/core-main-unit-tests.log)

ไม่มี password, access token หรือ private key ในไฟล์หลักฐาน. Credentials/key จำลองอยู่ในโฟลเดอร์ Temp นอก repo. หยุด process และ PostgreSQL ทดสอบหลังจบงาน

## ขั้นตอนถัดไปสำหรับ server จริง

ใช้ Core Hub ที่ deploy ตามมาตรฐานปัจจุบันและมี rooms/people API; metadata ของ develop มี modules เหล่านี้ แต่ยังไม่ได้รัน integration กับ develop. ไม่แก้ Core main เพื่อทำให้ผลทดสอบผ่าน และไม่มี commit/push ที่ Core repo

ลงทะเบียนและให้ Core admin อนุมัติ callback จริง แล้วใช้ไฟล์บัญชีทดสอบจริงนอก repo รัน L3 และ domain probes กับ `https://csmju2030.jowave.com`. ต้องมีทั้งผ่าน conformance และเลือกห้อง/บุคลากรได้จริงจึงพร้อมใช้งานครบ. ขั้นตอนอยู่ใน [คู่มือลงทะเบียน](core-hub-integration.md)
