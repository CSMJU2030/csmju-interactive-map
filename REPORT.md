# REPORT — csmju-interactive-map

## ล่าสุด: cleanup และ UI audit — 4 ตุลาคม 2026

**ยังไม่ผ่าน UI design system ทั้งฉบับ.** อ่านเอกสาร main ฉบับ UI 1.3.1 ทุกหมวดและตรวจ source/browser แล้ว พบข้อผิดจริงใน tokens/fonts/AppShell/forms/dialogs/states/error mapping/accessibility. รายละเอียดและหลักฐานรายหมวด: [ui-design-system-audit.md](docs/ui-design-system-audit.md).

ลบไฟล์สไลด์ใน scripts และ demo ใน examples รวม 3 ไฟล์; ไม่พบ runtime reference. ตัดเอกสาร มาตรฐาน และ tests ออกจาก Docker build context โดยเก็บไว้ใน Git ตามหน้าที่. `pnpm build` หลัง cleanup ผ่านทั้ง NestJS/Next.js บน Node 22.22.0. ยังไม่ได้ build Docker image.

Template กลางมีแล้วใน `csmju2030-standards/templates/csmju-subsystem-web` บน main standards 1.7.2 (ไม่อยู่ใน tag 1.7.0); ข้อมูลเรื่อง template ในรายงานวันที่ 3 ตุลาคมด้านล่างเป็นประวัติ. รอบนี้ยัง pin standards 1.7.0 ตามทีมสั่ง และยังไม่ได้นำ template เข้าเว็บ.

เปิด frontend preview `http://localhost:3202` และ backend `4202`; health 200, migrations/seed ผ่านในฐานข้อมูล preview แยก. หน้า about ไม่มี overflow ที่ 360/390/768/1280/1920px แต่พบ breakpoint/layout/font/title ไม่ตรงมาตรฐาน. Core Hub แสดง not_found สำหรับทะเบียน csmju-interactive-map จึงยังตรวจหน้าที่ต้องเข้าสู่ระบบจริงและ L3 ไม่ได้.

วันที่ตรวจ: 3 ตุลาคม 2026. **สถานะ: แก้โค้ดและตรวจในเครื่องแล้ว ยังไม่รับรองผ่านทุกมาตรฐานหรือ L3** เพราะทะเบียน Core Hub ยังไม่สร้าง, ไม่มีบัญชี conformance บน server จริง, template UI กลางที่เอกสารกำหนดยังหาไม่พบใน repo

## อัปเดต standards v1.7.0 — 4 ตุลาคม 2026

- รวม upstream main `1bc5dd8` และปัก `.standards-version` / gitlink / `subsystem.yaml` / README / คู่มือตรงกับ v1.7.0 (`88c4ce86271df943da1ffd1fde80633dfdd16a47`). ไฟล์ CI และ CODEOWNERS ตรงกับ upstream
- Push เข้า PR #5: https://github.com/CSMJU2030/csmju-interactive-map/pull/5
- **GitHub CI ผ่านครบ 8/8 jobs** ที่ commit `74b00d1de19602802e98ba5abe5e2cb53c4db62d`: https://github.com/CSMJU2030/csmju-interactive-map/actions/runs/37197742871
- Local lint / typecheck / test / production build ผ่าน; tests 246/246 (backend 245, frontend 1). รอบ PowerShell ใช้ Node 26.7.0 จึงมี engine warning; GitHub CI ตรวจซ้ำด้วย Node 22 ตามมาตรฐานและผ่าน
- run-all-checks.sh ของ v1.7.0 รันใน WSL ด้วย Node 22 adapter: **All 19 checks passed**, exit 0; ไม่มี skip ใน GH-02/03/04 รอบนี้. QA ตรวจ lint/typecheck/test/build ซ้ำด้วย Node 22 และผ่าน. ผลท้ายสคริปต์: [compliance-v170-summary.log](docs/verification/compliance-v170-summary.log)
- ยังไม่รับรอง live-server conformance L3: ต้องลงทะเบียน APPROVED/ACTIVE และมีบัญชีทดสอบจริงก่อน

## มาตรฐานและ reference

- `.standards-version`: **1.7.0** — เวอร์ชันที่ทีมกำหนดและตรงกับ upstream main วันที่ 4 ตุลาคม 2026
- `standards` เป็น submodule จริง: commit `88c4ce86271df943da1ffd1fde80633dfdd16a47` ตรง tag v1.7.0; gitlink commit แล้ว
- auth/common/core-hub คัดลอก reference demo commit `6724d707dcb05fd212e19d01d29514e9ad866847`. ปรับ permission เฉพาะโดเมนและ imports ให้ตรง Prisma ของระบบ
- Core Hub จริง health และ JWKS ตอบได้; ยังไม่ทดสอบ authenticated Core API ด้วยบัญชีจริง

## ผลตรวจเดิมวันที่ 3 ตุลาคม 2026 (standards v1.7.1)

| รายการ | ผล |
|---|---|
| สคริปต์ standards run-all-checks.sh | exit 0, รายงาน PASS 19/19 กลุ่ม; มี skip/partial ด้าน Git ตามด้านล่าง |
| lint และ typecheck | ผ่าน frontend/backend; Next typegen + tsc |
| Unit + SSO e2e | **246 tests ผ่าน**: backend 245, frontend 1 ไม่มีเคส fail/skip ในชุดนี้ |
| Production build | NestJS + Next.js ผ่าน บน Node 22.22.0 |
| OpenAPI sync / generated frontend types | ผ่าน; generated files อยู่ใน index |
| Database migration ใหม่ | ทั้ง 8 migrations และ seed ผ่านใน PostgreSQL 18 ฐานข้อมูลชั่วคราว; migrate diff ไม่มีความต่าง |
| ย้ายข้อมูลเดิม | personCode ว่างทำให้ rollback ทั้ง transaction, ชื่อ/ข้อมูลเดิมยังอยู่; เมื่อจับคู่แล้วเก็บ assignment และ geometry ครบ พร้อมลบข้อมูลส่วนบุคคลซ้ำ |
| DB landmark constraint | ปฏิเสธจุดที่ไม่มีทั้ง roomCode และ landmarkLabel |
| HTTP smoke จาก backend build จริง | health 200, anonymous /api/v1/me 401 standard JSON, /auth/login 302 ไป Core web พร้อม HttpOnly state cookie |
| Live conformance L3 | ยังไม่มีทะเบียน/บัญชีจริง จึงยังไม่ผ่าน; **local Core main ผ่าน 71/71** ตามรายงานเพิ่มเติม |
| Docker image | ยังไม่รัน เพราะ Docker Desktop daemon ไม่เปิด |
| Accessibility / Performance แบบ browser | ยังไม่มี Lighthouse/axe audit จึงไม่รับรองคะแนน UI ทั้งหมด |

ผลสคริปต์เต็ม: [compliance-local.log](docs/verification/compliance-local.log). รัน Bash ใน WSL โดยใช้ Node/pnpm Windows ผ่าน adapter นอก repo พร้อม jq. แก้เฉพาะการแปลง path/CRLF/stdin ของเครื่องมือ ไม่แก้ไฟล์กฎมาตรฐาน

**ข้อจำกัดของ PASS 19/19:** GH-02 ข้ามเพราะ commit เดียวไม่มี HEAD~1; GH-03 ข้ามเพราะไม่มี origin/main; GH-04 เทียบ version ผ่านแต่ HEAD ยังไม่มี gitlink ใหม่จึงข้าม pointer ใน commit. ตรวจ pointer ที่ staged เทียบกับ tag แล้วตรงกัน ต้อง commit/เปิด PR ใน repo จริงจึงตรวจ history/CI/pointer ได้ครบ. UI-01 เป็น static color check; UI-02..04 ไม่ได้พิสูจน์ด้วยการรันนี้

## สิ่งที่แก้

- SSO 1.1: login/state/callback/logout, JWKS/kid/token claims 10 ขั้น, HttpOnly cookies, /me, response/error contracts และ log callback ที่ไม่เปิดเผย token
- API JSON camelCase, pagination และ Swagger schemas; frontend types generate จาก OpenAPI
- ใช้ Core rooms/people เป็นเจ้าของข้อมูลกลาง, ตรวจ active reference ก่อนเขียน, เก็บเฉพาะ identifiers/geometry/assignment และไม่ cache บุคลากร
- จำกัดสิทธิ์บุคลากร staff/admin; ปุ่มลบเฉพาะ admin; frontend ทำ silent re-SSO ด้วย top-level navigation และป้องกัน loop
- Migration แบบ transaction พร้อมหยุดก่อนทำลายข้อมูลเดิมเมื่อยังจับคู่ personCode ไม่ครบ, timestamp default ตรง schema, seed ไม่สร้างข้อมูลกลางซ้ำ
- Environment examples / proxy / Docker preparation และคู่มือลงทะเบียน. ไม่ทับ .env เดิมของผู้ใช้และไม่แก้ฐานข้อมูลผู้ใช้

## งานที่ยังต้องดำเนินการ

1. ยืนยันพอร์ต frontend/backend กับผู้ดูแล (3202/4202 เป็นค่าชั่วคราว) แล้วลงทะเบียน callback → APPROVED/ACTIVE
2. ให้ PM ระบุ template `csmju-core-hub/templates/csmju-subsystem-web` ที่เอกสาร UI ข้อ 17.0 กำหนด. Git API ตอบ 404 แต่ Git credentials อ่าน repo ได้; sparse tree ตรวจ main `a1df242e96545cf7941d976a3bbeeff673cd153e` และ develop `f425c24fe87def8f7df462a9a774fd275e678d3f` ไม่พบ templates นี้. AppShell ปัจจุบันยังเป็นของระบบ ต้องนำเข้าของกลางจึงผ่านข้อ UI นี้
3. Repo สำหรับส่ง PR คือ CSMJU2030/csmju-interactive-map. ตรวจ main จริงพบ CI reusable workflow @v1.5.2 และ CODEOWNERS ทางการติดตั้งแล้ว และเก็บไฟล์เหล่านั้นจาก main โดยไม่มีการแก้; ต้องรอ GitHub CI ของ PR ยืนยันผล
4. ตั้งบัญชีทุก role ที่ runner ใช้ในไฟล์นอก repo แล้วรัน L1 → L2 → L3 ให้ได้ **0 FAIL / 0 SKIP**
5. เปิด Docker Desktop ตรวจ image/startup และตรวจ accessibility/performance บนเว็บที่เข้าสู่ระบบจริง

ขั้นตอนและค่าที่ต้องกรอก: [core-hub-integration.md](docs/core-hub-integration.md). ไม่มีการ commit/push ไป GitHub ในการตรวจนี้ และเก็บการเปลี่ยนแปลงเดิมของผู้ใช้ไว้

## เพิ่มเติม: ทดสอบ Core Hub/main จริงในเครื่อง

L3 ผ่าน 71 PASS / 0 FAIL / 0 SKIP; Core build/typecheck/lint และ unit 35 tests ผ่าน. แต่ main ไม่มี rooms/people API ทำให้ domain ห้อง/บุคลากรตอบ 503. อ่าน [ผลและข้อจำกัดทั้งหมด](docs/core-hub-test-results.md) ก่อนสรุปพร้อมใช้งานจริง.

## Checkout สำหรับส่ง PR

โฟลเดอร์ csmju-interactive-map-publish clone จาก main 4282bd51ce75fb246c27b20bb6751faab8df918c และใช้ branch feature/interactive-map/compliance-fixes; นำ source/generated contracts/tests/report เข้ามาและเก็บ .github จาก upstream. standards gitlink ปรับเป็น v1.7.0 ตาม upstream main; ผล secret scan ของรอบก่อนผ่าน. ส่งงานผ่าน feature branch เพื่อเปิด PR; ผล GitHub CI และ conformance บน server จริงต้องตรวจเพิ่มเติมก่อน merge/deploy.
