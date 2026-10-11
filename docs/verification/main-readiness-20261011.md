# ตรวจตัวหลัก — 11 ตุลาคม 2026

## ตรวจซ้ำหลังนำโหมด Local ออก

ลบ local-preview entry point, guard, policy และ tests เฉพาะโหมดนี้ รวมถึงคำสั่ง dev:local/start:local และ UI ผู้ดูแลทดสอบ ย้ายตัวอย่างตั้งค่า Production ไป deployment/backend.env.example และ deployment/frontend.env.example พร้อมปรับคู่มือ

- Static checks v1.8.4 ผ่าน 18/18 กลุ่ม รวม SEC-01/02 ที่เคยไม่ผ่าน
- Lint/typecheck ผ่าน; tests backend 269 + frontend 12 = 281 ผ่านทั้งหมด
- Production build ผ่าน หลังหยุด standalone server ที่ล็อกโฟลเดอร์ build บน Windows แล้วสร้างใหม่ ไม่มีการแก้โค้ดเพื่อหลบข้อผิดพลาดนี้
- docker compose config --quiet ผ่านด้วยไฟล์ตัวอย่าง ไม่มีการใส่ credentials จริง
- เปิด backend main และ frontend standalone ใหม่ด้วย NODE_ENV=production; map/health 200, me/admin-list ไม่มี session ตอบ 401
- ไม่มี migration/seed/restore, push หรือ deploy; ฐานข้อมูลที่เปิดดูยังอยู่ในเครื่อง ต้องเตรียมฐานถาวรบนเซิร์ฟเวอร์จริง
- Docker runtime และ SSO/conformance บนเซิร์ฟเวอร์จริงยังไม่ได้ทดสอบ จึงยังไม่รับรอง production readiness ครบวงจร

หลักฐานตรวจซ้ำ: %TEMP%/csmju-main-removal-static-20261011.log, csmju-main-removal-qa-20261011.log และ csmju-main-removal-build-20261011.log

## ผลตรวจเดิมก่อนนำโหมด Local ออก

ผลรวม: **ยังไม่ผ่านมาตรฐานสำหรับเผยแพร่** ไม่มีการแก้ข้อที่ตรวจไม่ผ่าน ไม่มี push/deploy หรือ migration/seed ในการตรวจนี้

## ตัวที่เปิดให้ดู

รันด้วย Node 22.22.0, NODE_ENV=production, backend dist/main.js และ frontend standalone server.js ที่ http://localhost:3216/map ใช้ AUTH_MODE=gateway และ Core Hub SSO จริง ไม่มี LocalPreviewGuard ฐานข้อมูลยังเป็นฐานเดิมในเครื่อง ไม่ใช่ฐาน Production บนเซิร์ฟเวอร์

ตรวจ HTTP: map/health/places 200, places รวม 14, me/admin-list ไม่มี session ตอบ 401, auth/login ตอบ 302 ไป csmju2030.jowave.com ยังไม่ได้ยืนยันการเข้าสู่ระบบครบวงจรด้วยบัญชีจริง

## ผลตรวจ

- standards v1.8.4: static checks 17/18 ผ่าน ตรวจสำเนาของไฟล์ปัจจุบันรวมงานที่ยังไม่ commit โดยไม่คัดลอก private env/node_modules/build output
- ไม่ผ่าน check-no-secrets.sh: SEC-01 พบ connection string ตัวอย่าง user:pass ใน backend/src/local-preview-policy.spec.ts บรรทัด 7, 15, 20, 21 ตัวตรวจไม่ยกเว้นไฟล์ทดสอบ
- ไม่ผ่าน SEC-02: backend/.env.production.example และ frontend/.env.production.example ไม่ตรงชื่อที่ตัวตรวจยกเว้น (.env.example) การแจ้งนี้ไม่ใช่หลักฐานว่ามี credential จริงรั่ว
- lint, typecheck, tests, production build ผ่าน: backend 273 และ frontend 12 รวม 285 tests
- สร้าง OpenAPI และ frontend types ลงโฟลเดอร์ชั่วคราวแล้วเทียบ hash: ตรงกับไฟล์ปัจจุบันทั้งสองไฟล์ ไม่เขียนทับ source
- git diff --check ผ่าน (มีคำเตือน CRLF จาก Git)

## ยังตรวจยืนยันไม่ได้

- Docker build/run: Docker Desktop Linux Engine ไม่ทำงาน
- conformance L1–L3, SSO callback/logout ด้วยบัญชีจริง, HTTPS/reverse proxy และการคงข้อมูลหลัง restart บนเซิร์ฟเวอร์
- Git history checks ตรวจประวัติที่มีอยู่ งานที่ยังไม่ commit ต้องตรวจ CI อีกครั้งเมื่อเตรียม PR

หลักฐานรอบนี้: %TEMP%/csmju-main-static-20261011.log และ %TEMP%/csmju-main-qa-20261011.log
