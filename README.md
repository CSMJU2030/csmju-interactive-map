# CSMJU Interactive Map

ระบบแผนที่ Next.js + NestJS + Prisma/PostgreSQL สำหรับ CSMJU2030 ใช้มาตรฐาน v1.7.0 และ SSO ของ Core Hub เท่านั้น สถานะปัจจุบันเป็น **เตรียมลงทะเบียน ยังไม่ได้รับรอง conformance L3 บน server จริง** ดูผลจริงใน [REPORT.md](REPORT.md) และ [คู่มือลงทะเบียน](docs/core-hub-integration.md)

## สถาปัตยกรรมและข้อมูล

Browser → Next.js `localhost:3202` → proxy `/api/*`, `/auth/*` → NestJS `localhost:4202` → ฐานข้อมูลเฉพาะระบบ พอร์ตทั้งสองเป็นค่าชั่วคราว ต้องยืนยันกับผู้ดูแลก่อนลงทะเบียน

- REST JSON ใช้ camelCase, คอลัมน์ฐานข้อมูลใช้ snake_case ผ่าน Prisma mapping
- เข้าระบบที่ `/auth/login`; callback ตรวจ state และ RS256/JWKS; logout ส่งต่อ Core Hub
- JWT และ state อยู่ใน HttpOnly cookie ไม่มี local login, refresh token หรือข้อมูล token ใน browser storage
- ห้องเก็บเฉพาะ `roomCode` และรูปทรงบนแผนที่ ชื่อห้องอ่านจาก Core Hub; จุดที่ระบบเป็นเจ้าของเก็บ `landmarkLabel` ได้
- บุคลากรเก็บเฉพาะ `personCode`, `coreUserId`, `placeId`; ชื่อและข้อมูลติดต่ออ่านจาก Core Hub ทุกครั้งโดยไม่ cache
- student/alumni อ่านแผนที่; staff/lecturer จัดการแผนที่และการกำหนดห้อง; admin ลบได้ ข้อมูลบุคลากรจำกัด staff/admin
- Seed สร้างเฉพาะโครงทางเดินตัวอย่าง ไม่มีห้องหรือบุคลากรปลอม

## เริ่มในเครื่อง

ใช้ Node.js 22, pnpm ตาม packageManager และ PostgreSQL ฐานข้อมูลเฉพาะระบบ:

```powershell
git submodule update --init standards
pnpm install --frozen-lockfile
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
# แก้ DATABASE_URL และค่าพอร์ตในไฟล์ส่วนตัวก่อนรัน
pnpm prisma:generate
pnpm --filter @csmju-interactive-map/backend exec prisma migrate deploy
pnpm seed
pnpm dev
```

ถ้ามี `.env` อยู่แล้วให้ปรับค่าตาม example แทนการทับไฟล์ อ่านขั้นตอนย้ายข้อมูลเดิมในคู่มือก่อนใช้ migration: ข้อมูลชื่อห้องและบุคลากรเดิมจะถูกแทนด้วย reference ของ Core Hub จึงต้องสำรองและจับคู่ personCode ก่อน

## ตรวจงาน

```powershell
pnpm generate:openapi
pnpm --filter @csmju-interactive-map/frontend generate:api
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

รัน `bash standards/scripts/run-all-checks.sh .` ใน Linux/WSL ที่มี Node 22, pnpm และ jq; Git Bash บน Windows อาจใช้เวลานานเพราะ pnpm junctions. OpenAPI ที่ generate ต้องอยู่ใน PR เดียวกับโค้ด backend

สคริปต์ local ไม่แทน GitHub CI หรือ L3 จริง ต้องลงทะเบียน Core Hub ให้ APPROVED/ACTIVE และรัน conformance โดยใช้บัญชีนอก repo ให้ได้ 0 FAIL และ 0 SKIP
