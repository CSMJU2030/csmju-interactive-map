# เตรียมลงทะเบียน Core Hub — Interactive Map

ตรวจตาม standards v1.7.4 วันที่ 5 ตุลาคม 2026 โดยยังไม่มีทะเบียน/บัญชี conformance/พอร์ตที่ผู้ดูแลจัดสรรให้ จึงยังไม่รับรอง L3

## รายการลงทะเบียน

| ช่อง | ค่าที่เตรียมไว้ |
|---|---|
| System ID / ชื่อระบบ | `csmju-interactive-map` ต้องตรงกับ SUBSYSTEM_ID และ subsystem.yaml |
| Display name | CSMJU Interactive Map |
| Core API / เว็บ | https://csmju2030.jowave.com |
| Frontend / Backend ในเครื่อง | `3216` / `4202` เป็นค่าชั่วคราว ต้องยืนยันพอร์ตกับผู้ดูแล |
| Callback URL | `http://localhost:3216/auth/callback` เมื่อได้รับพอร์ตนี้จริง |
| Base URL ในทะเบียนช่วงทดสอบ localhost | เว้นว่าง ตาม connect-core-hub.md ข้อ 3 |
| Base URL สำหรับ runner ใน subsystem.yaml | `http://localhost:3216` |
| Core role → subsystem role | student→STUDENT, alumni→ALUMNI, guest→ALUMNI, staff→STAFF, lecturer→STAFF, admin→ADMIN |

คนลงทะเบียนด้วยบัญชีเจ้าของระบบในหลังบ้าน Core Hub แล้วให้ admin ระบบกลางอนุมัติและเปิด ACTIVE. หากพอร์ตเปลี่ยน ให้แก้ frontend scripts, backend PORT/CORS_ORIGIN, BACKEND_INTERNAL_URL, compose และ subsystem.yaml ให้ตรงกันก่อนส่งทะเบียน. callback ใช้ frontend และ hostname localhost

เริ่ม sign-in จาก `http://localhost:3216/auth/login` เท่านั้น ไม่ส่ง token ในแชต ไม่สร้างบัญชีหรือทะเบียนแทนคน

## Environment

ใช้ค่าจาก backend/.env.example และ frontend/.env.example. Core issuer=`core-hub`, audience=`csmju2030`, JWKS=`https://csmju2030.jowave.com/api/v1/.well-known/jwks.json`. ฐานข้อมูลต้องแยกจาก Core Hub ใช้ PostgreSQL ของทีมเอง. Production ต้องใช้ HTTPS และตั้งค่า Core Hub ชัดเจน

ไฟล์ .env เดิมในเครื่องไม่ได้ถูกแก้โดยการตรวจครั้งนี้ จึงต้องตรวจพอร์ตและ Core URL ในไฟล์ส่วนตัวก่อนเริ่มเว็บ

## ย้ายฐานข้อมูลเดิม

1. สำรองฐานข้อมูลและตรวจรายการ lecturer/roomCode เดิมก่อน deploy. ใช้ staging database ที่เป็นสำเนาก่อนฐานข้อมูลจริง
2. ตรวจ roomCode กับ Core Hub. migration จะลบชื่อห้องที่เคยเก็บซ้ำ แต่เก็บ geometry, description และ keywords
3. หากตาราง lecturers มีข้อมูล เพิ่มคอลัมน์ `person_code TEXT` และ `core_user_id VARCHAR(64)` แล้วจับคู่บุคลากรกับ Core Hub ที่ถูกต้องทุกแถว. ห้ามใช้เลขสุ่มหรือชื่อเป็น identifier. ตรวจ personCode ไม่ซ้ำ
4. จึงรัน `pnpm --filter @csmju-interactive-map/backend exec prisma migrate deploy`. migration ที่ย้าย reference มี transaction และจะหยุดเมื่อยังมี person_code ว่าง; ไม่มีการลบบุคลากรทิ้งเพื่อให้ผ่าน
5. ตารางใหม่ `personnel_assignments` เก็บ identifiers/room assignment เท่านั้น คอลัมน์ชื่อ อีเมล โทรศัพท์และข้อมูลส่วนบุคคลเดิมถูกลบตามนโยบาย Core Hub. ตาราง role_overrides เดิมถูกลบเพราะบทบาทมาจาก JWT/Core mapping

การตรวจครั้งนี้ใช้ PostgreSQL ชั่วคราวพอร์ต 55442 ไม่ได้แก้ฐานข้อมูลเดิมของผู้ใช้

## รัน conformance หลังทะเบียนพร้อม

ให้ทีมจัดไฟล์บัญชีจริงในโฟลเดอร์ **นอก repo** เช่น `$env:USERPROFILE\.csmju\conformance-accounts.json`. รูปแบบอยู่ใน standards/conformance/lib/accounts.js: mapping role/owner ไปยัง email/password. ต้องมี role ที่เคสทดสอบใช้ครบ ไม่ใส่บัญชีใน subsystem.yaml หรือ Git

```powershell
$env:CONFORMANCE_ACCOUNTS_FILE = Join-Path $env:USERPROFILE '.csmju/conformance-accounts.json'
node standards/conformance/run.js --manifest ./subsystem.yaml --level L1
node standards/conformance/run.js --manifest ./subsystem.yaml --level L2
node standards/conformance/run.js --manifest ./subsystem.yaml --level L3
```

เว็บ frontend/backend ต้องรันอยู่และเชื่อมฐานข้อมูลได้. ใช้ฐานข้อมูลทดสอบเฉพาะ เพราะ runner มี create probe. ผ่านเมื่อ 0 FAIL และ 0 SKIP เท่านั้น ชุด SSO e2e ภายในเครื่องใช้ fake Core เพื่อทดสอบ protocol ไม่ใช่หลักฐานว่าเชื่อมทะเบียนจริงผ่านแล้ว

## งานที่ต้องให้ส่วนกลางจัดการ

- **CI/Repo:** repo ทางการคือ https://github.com/CSMJU2030/csmju-interactive-map. โฟลเดอร์สำหรับส่ง PR clone จาก main ที่มี CI reusable @v1.5.2 และ CODEOWNERS แล้ว; ให้ commit/push branch แล้วรอผล CI และรีวิว PL. ผล static เดิมที่ข้าม Git checks มาจาก checkout ต้นฉบับก่อนผูก repo. ไม่แก้ไฟล์ CI ที่ป้องกันเอง ตาม standards/docs/github-workflow.md และ standards/docs/standards-versioning.md ข้อ 4
- **UI ส่วนกลาง:** ต้องใช้ `templates/csmju-subsystem-web` จาก csmju-core-hub ตาม standards/docs/ui-design-system.md ข้อ 17.0. GitHub API ตอบ 404 แต่ตรวจซ้ำผ่าน Git credentials แล้วอ่าน repo ได้; ตรวจเฉพาะ template โดย sparse checkout (ไม่ checkout ข้อมูลนักศึกษา) และไม่พบโฟลเดอร์นี้ทั้ง main และ develop จึงต้องให้ PM ส่งออก template ที่ใช้งานจริงหรือระบุ ref/path ที่ถูกต้อง. AppShell ปัจจุบันยังเป็นของระบบและต้องแทนที่; UI-01 สีผ่านไม่ได้ยืนยัน UI ทุกข้อ. ไม่ติดตั้ง public design-system package แทน เพราะเอกสารยังห้ามและ implementation ที่พบใช้ auth รุ่นเก่า
- **Docker:** ต้องเปิด Docker Desktop แล้วทดสอบ `docker compose build backend` และ migration/startup ใน staging ก่อนรับรอง image
- **Production:** หลังทดสอบ localhost ต้องให้ admin เปลี่ยน callback/Base URL เป็น HTTPS ของ host จริง

## แหล่งอ้างอิง

- Standards: https://github.com/CSMJU2030/csmju2030-standards/tree/v1.7.4 — commit 00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c
- Auth/common/core-hub reference: demo-student-subsystem — commit 6724d707dcb05fd212e19d01d29514e9ad866847
- เอกสารใน submodule: connect-core-hub.md, auth-contract.md, reference-data.md, conformance.md, ui-design-system.md และ github-workflow.md
