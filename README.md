# CSMJU Interactive Map

ระบบแผนที่ Next.js + NestJS + Prisma/PostgreSQL สำหรับ CSMJU2030 ใช้มาตรฐาน v1.8.4 และ SSO ของ Core Hub เท่านั้น สถานะปัจจุบันเป็น **เตรียมลงทะเบียน ยังไม่ได้รับรอง conformance L3 บน server จริง** ดูผลจริงใน [REPORT.md](REPORT.md) และ [คู่มือลงทะเบียน](docs/core-hub-integration.md)

Frontend ใช้ Next.js และ eslint-config-next 16.3.6 พร้อม UI template 1.3.2 จาก tag v1.7.4. ปุ่ม “กลับ CSMJU Portal” ใน sidebar อ่าน `CORE_HUB_WEB_URL` จาก environment ของ frontend; รองรับ `NEXT_PUBLIC_CORE_HUB_WEB_URL` เดิมเมื่อยังไม่ได้ตั้งค่าใหม่.

## สถาปัตยกรรมและข้อมูล

Browser → Next.js `localhost:3216` → proxy `/api/*`, `/auth/*` → NestJS `localhost:4202` → ฐานข้อมูลเฉพาะระบบ พอร์ตทั้งสองเป็นค่าชั่วคราว ต้องยืนยันกับผู้ดูแลก่อนลงทะเบียน

- REST JSON ใช้ camelCase, คอลัมน์ฐานข้อมูลใช้ snake_case ผ่าน Prisma mapping
- เข้าระบบที่ `/auth/login`; callback ตรวจ state และ RS256/JWKS; logout ส่งต่อ Core Hub
- JWT และ state อยู่ใน HttpOnly cookie ไม่มี local login, refresh token หรือข้อมูล token ใน browser storage
- ห้องเก็บเฉพาะ `roomCode` และรูปทรงบนแผนที่ ชื่อห้องอ่านจาก Core Hub; จุดที่ระบบเป็นเจ้าของเก็บ `landmarkLabel` ได้
- บุคลากรเก็บเฉพาะ `personCode`, `coreUserId`, `placeId`; ชื่อและข้อมูลติดต่ออ่านจาก Core Hub ทุกครั้งโดยไม่ cache
- หน้า `/personnel` อ่านรายชื่อบุคลากร ACTIVE จาก Core Hub ผ่าน `/api/v1/lecturers/directory` แม้ยังไม่ได้กำหนดห้องในระบบนี้; จำกัดสาขาด้วย `PERSONNEL_DEPARTMENT_CODE` (ค่าเริ่มต้น `CS`) พร้อมค้นหาและกรองคณาจารย์/เจ้าหน้าที่ อีเมลแสดงเฉพาะเมื่อ Core Hub ส่งกลับตามสิทธิ์ผู้ใช้
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

### คืนผัง local ตามภาพเดิม

ถ้าเว็บขึ้น “โหลดข้อมูลไม่สำเร็จ” ให้ตรวจ PostgreSQL ก่อน: `pnpm dev` เปิดเฉพาะ frontend/backend และไม่ได้เปิดฐานข้อมูล preview. เครื่องนี้ใช้ฐานข้อมูล `csmju_map_preview_20261004` ที่พอร์ต `55442`; เปิด cluster เดิมด้วยคำสั่งนี้ก่อนรันเว็บ:

```powershell
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D "$env:TEMP/csmju-map-v171-audit-pg" status
# รันบรรทัดต่อไปเฉพาะเมื่อ status บอกว่า no server running
& 'C:/Program Files/PostgreSQL/18/bin/pg_ctl.exe' -D "$env:TEMP/csmju-map-v171-audit-pg" -l "$env:LOCALAPPDATA/csmju-map/postgres-preview.log" -o '-p 55442 -h 127.0.0.1' start -w
```

ตรวจวันที่ 5 ตุลาคม 2026: ข้อมูล 14 จุดและผังทางเดินยังอยู่ครบ; เปิดฐานข้อมูลเดิมแล้วกด “ลองอีกครั้ง” ก็กลับมาแสดง ไม่ต้องรัน seed หรือสคริปต์คืนผังเมื่อฐานข้อมูลแค่หยุดทำงาน.

`backend/prisma/restore-reference-layout.ts` คืนตำแหน่ง 14 จุดตามภาพวันที่ 1 ตุลาคม 2026 เฉพาะฐานข้อมูล local `csmju_map_preview_20261004`: ห้อง 8 ห้องใช้รหัส Core Hub ที่มีจริง และอีก 6 จุดเป็นป้ายบนแผนที่ของระบบ โดยช่องเดิม LECT-07 ใช้ LABCOM-5 และช่องเดิม LECT-05 ใช้ LAB-NETWORK ตามที่ผู้ใช้กำหนด สคริปต์สำรองข้อมูลเดิมไว้ใน `%LOCALAPPDATA%/csmju-map/backups` ก่อนอัปเดต ไม่ลบข้อมูลอื่น และรันซ้ำได้โดยไม่เพิ่มรายการซ้ำ

```powershell
pnpm --filter @csmju-interactive-map/backend exec ts-node prisma/restore-reference-layout.ts
```

ชื่อห้องยังอ่านจาก Core Hub และแก้ไขตำแหน่งต่อได้ในหน้า `/admin` สคริปต์นี้แยกจาก seed ปกติและไม่รันใน production

## ทดสอบด้วย Docker

รัน `docker compose up -d --build` แล้วเปิด `http://localhost:3216` โดยใช้ service `web` (3000) ส่งต่อไป `api` (4000) ตาม standards 1.8.4; API ไม่เปิดพอร์ตออกสู่ host ส่วนการรัน `pnpm dev` ยังใช้พอร์ต 3216/4202 ตามเดิม

Dockerfile ฝั่งเว็บฝัง `BACKEND_INTERNAL_URL=http://api:4000` ตอน build การเปลี่ยนปลายทางต้อง build image ใหม่ ฐานข้อมูลจำกัด connection ด้วย `DATABASE_POOL_MAX` (ค่าเริ่มต้น 5) Compose นี้ใช้ฐานข้อมูล local และคุกกี้สำหรับ HTTP; ค่าของ production ให้ตั้งตาม `standards/docs/deployment.md`

ผลตรวจการอัปเดต: [standards-v184.md](docs/verification/standards-v184.md)

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
