# Standards v1.8.4 — 8 ตุลาคม 2026

อัปเดตจาก 1.7.4 เป็น tag ล่าสุด 1.8.4 หลัง fetch tags จาก CSMJU2030/csmju2030-standards. `.standards-version` ตรงกับ submodule checkout ที่ commit `94d74177659304ed7dcd0e1493a20b8d5b054189` และ VERSION ของ tag.

## การเปลี่ยนแปลง

- เพิ่ม frontend/Dockerfile จาก template v1.8.4 ปรับชื่อ package และใช้ BACKEND_INTERNAL_URL ตามโปรเจกต์; Next.js ใช้ standalone และ trace จาก workspace root.
- .dockerignore กัน **/.env*; backend image ไม่ใช้ --ignore-scripts เพื่อให้ Prisma engines พร้อมใช้งาน และล้าง pnpm store ใน layer ติดตั้ง.
- Entrypoint เรียก Prisma CLI ด้วย node โดยตรง เพื่อไม่ให้ user node ต้องดาวน์โหลด pnpm ผ่าน Corepack ตอนเริ่ม container; ปรับ shell script เป็น LF ระหว่าง build.
- Compose เพิ่ม web:3000 และ api:4000, เปิดเว็บที่ localhost:3216, จำกัด filesystem/capabilities/RAM และหมุน log. การรันนอก Docker ยังคงพอร์ตเดิม.
- เพิ่ม DATABASE_POOL_MAX ค่าเริ่มต้น 5 ตาม deployment.md ข้อ 4.1.

## ผลตรวจจริง

| รายการ | ผล |
|---|---|
| เวอร์ชันกับ submodule checkout/tag | PASS: 1.8.4 |
| check-deploy-ready.sh (DEP-01..04) จาก v1.8.4 | PASS |
| docker compose config --quiet | PASS |
| pnpm -r lint | PASS |
| pnpm -r typecheck | PASS |
| pnpm -r build | PASS; มี frontend/.next/standalone/frontend/server.js |
| pnpm -r test | PASS: backend 251 + frontend 7 = 258 |
| git diff --check | PASS |
| Static compliance v1.8.4 จำนวน 18 scripts | PASS: 0 FAIL; ตรวจ Git history/CI guard/submodule pointer หลังรวม origin/main |
| check-qa.sh ด้วย Node 22.22.0 / pnpm 11.19.0 | PASS: lint, typecheck, tests 258/258, build และ QA-05/06 |
| OpenAPI และ generated frontend types | PASS: generate ซ้ำแล้วไม่มี diff |

## ขอบเขตการตรวจ

ตรวจซ้ำก่อน push บน Windows ด้วย Node 22.22.0 / pnpm 11.19.0. Static checks 18 scripts รันบน clean Git clone ของ commit หลังรวม origin/main โดยใช้ scripts จาก standards v1.8.4 เดิมทั้งหมด และ fetch base ref ให้ตรงกับ upstream จริง เพื่อหลีกเลี่ยง find ที่ใช้เวลานานในการไล่ pnpm junctions บน Windows. check-qa.sh และ OpenAPI sync รันใน checkout จริงที่ติดตั้ง dependencies แล้ว; generated frontend types ตรงกับ contract. รวมเป็น checks ทั้ง 20 กลุ่มของ run-all-checks.sh โดยไม่ได้แก้หรือข้ามกฎ. UI-02..04 ยังเป็น warning/static coverage ตามสคริปต์ ไม่ใช่ผล browser accessibility/performance audit.

Dockerfile ใช้ Node 22 แต่ยังไม่ได้ build/run container เพราะ Docker Desktop Linux Engine ไม่พร้อมใช้งาน. ยังไม่ได้รัน conformance L1–L3 กับทะเบียนและบัญชีบน server จริง จึงไม่รับรอง production readiness. ส่งงานผ่าน feature branch และ PR #6; ตรวจผล GitHub CI ของ commit ล่าสุดแยกจากผล local นี้. GH-04 ผ่านหลัง commit ทั้ง .standards-version และ standards พร้อมกัน. รับ .github/workflows/images.yml จาก origin/main โดยไม่แก้ไฟล์ CI ของส่วนกลาง.
