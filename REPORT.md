## ล่าสุด: อัปเดต standards v1.8.4 — 8 ตุลาคม 2026

อัปเดต .standards-version และ submodule จาก 1.7.4 เป็น 1.8.4 พร้อม Dockerfile เว็บ, Next.js standalone, .dockerignore, compose web/api และ connection pool ตามข้อกำหนดใหม่. DEP-01..04, compose config, lint, typecheck, build และ unit tests 258/258 ผ่าน. ยังไม่ได้ทดสอบ Docker runtime (Engine ไม่เปิด), full compliance/CI หรือ conformance รอบนี้; ยังไม่ได้ commit/push. รายละเอียดและข้อจำกัด: [standards-v184.md](docs/verification/standards-v184.md).

## รายชื่อคณาจารย์และเจ้าหน้าที่จาก Core Hub — 5 ตุลาคม 2026

หน้า `/personnel` ใช้ directory ของบุคลากร ACTIVE สาขา CS จาก Core Hub แทนรายการกำหนดห้องในฐานข้อมูลระบบย่อย จึงแสดงคนที่ยังไม่ได้กำหนดห้องด้วย. เพิ่ม API `/api/v1/lecturers/directory` ที่ใช้ JWT ของผู้เรียกและสิทธิ์ lecturer:read; ไม่ cache หรือบันทึกชื่อ/ข้อมูลติดต่อ. อ่านครบทุกหน้า Core ก่อนกรองประเภทและแบ่งหน้าในเว็บ; รองรับค้นหาชื่อ/รหัส. เปลี่ยนสาขาได้ด้วย PERSONNEL_DEPARTMENT_CODE.

ตรวจ browser จริงล่าสุดได้ 15 คน (คณาจารย์ 10, เจ้าหน้าที่ 5), ตัวกรองและค้นหาพบหนึ่งรายการตามชื่อที่ระบุ. Anonymous API ตอบ 401; tests ครอบคลุม Core ปฏิเสธ 401/403, pagination และข้อมูลติดต่อที่ไม่ส่งกลับ. Lint/typecheck/build ผ่าน และ tests 258/258 (backend 251, frontend 7). หลักฐาน: [personnel-core-20261005.jpg](docs/verification/personnel-core-20261005.jpg).

## ล่าสุด: กรอบห้องแบบมินิมอล — 5 ตุลาคม 2026

ปรับ InteractiveSvgMap ตามภาพผู้ใช้: ตัด native SVG outline ที่ขยายหนาจนเป็นวงดำ, กรอบชั้นใน และ drop shadow. ใช้กรอบเดี่ยวมุมมนเล็ก เส้น 1.2px/เลือก 2px แบบ non-scaling-stroke พร้อมสี token อ่อน; keyboard focus ใช้เส้น primary 2px. ตำแหน่งและข้อมูลผังไม่เปลี่ยน. ตรวจ browser จริง LAB-3 ได้ outline=none, rect เดียว, selected stroke=2 และ non-scaling-stroke; Tab ไป LAB-4 แสดง focus primary 2px และ Space เลือกห้องได้. Frontend lint/typecheck และ git diff --check ผ่าน.

ภาพยืนยัน: [map-minimal-20261005.jpg](docs/verification/map-minimal-20261005.jpg).

## ล่าสุด: แผนที่กลับมาแสดงครบ — 5 ตุลาคม 2026

สาเหตุที่เว็บแสดง 0 จุดพร้อม “โหลดข้อมูลไม่สำเร็จ”: PostgreSQL preview ที่ 127.0.0.1:55442 ไม่ได้รัน (`ECONNREFUSED` และ `pg_ctl status: no server running`). เปิด cluster เดิม `csmju-map-v171-audit-pg` ด้วย pg_ctl โดยไม่แก้ DATABASE_URL และไม่รัน seed/restore/migration. ตรวจ SQL แบบอ่านอย่างเดียวพบ places 14 รายการ active ครบ 14 และ map_layouts/main corridor_width 4.50. กด “ลองอีกครั้ง” ในหน้า localhost:3216/map แล้วแสดงครบ 14 จุด รวม LABCOM-5 และ LAB-NETWORK; ไม่มีข้อความโหลดล้มเหลว. เพิ่มขั้นเปิดฐานข้อมูลเดิมใน README เพราะ pnpm dev เปิดแค่ frontend/backend.

ภาพยืนยัน: [map-restored-20261005.jpg](docs/verification/map-restored-20261005.jpg).

## ล่าสุด: อัปเดต standards v1.7.4 — 5 ตุลาคม 2026

อัปเดต `.standards-version` และ submodule เป็น v1.7.4 (`00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c`), manifest ใช้ UI 1.3.2, Next.js/eslint-config-next 16.3.6 และ lockfile ใหม่. เพิ่มปุ่ม “กลับ CSMJU Portal” ใน sidebar จาก env; คง min-w-0 แก้ overflow เดิม. สีหมวดหมู่แผนที่ปรับเป็น token กลาง และปรับการอ่าน browser URL/รีเซ็ต state ให้ผ่านกฎ React ของ Next.js 16.

เพิ่มเติม: Core Hub ส่ง callback มาที่ frontend http://localhost:3216 จึงปรับ dev/start, manifest, CORS และคู่มือจาก 3202 เป็น 3216; backend ยังใช้ 4202. ตรวจผ่าน proxy: health 200, login 302 ไป Core Hub พร้อม state cookie, callback ที่ไม่มี token ตอบ 400. เปิดขั้นตอน login ใหม่ให้ผู้ใช้; ยังไม่ได้ยืนยันผล authenticated session หรือ L3.

ผล Node 22: lint/typecheck/build ผ่าน, tests **252/252**, OpenAPI sync และ UI-01 ผ่าน. Standards orchestrator ผ่าน 18/19; GH-04 ผ่านเมื่อตรวจซ้ำหลัง local commit `b1dc1c9` เฉพาะไฟล์เวอร์ชันกับ gitlink จึงมีผลตรวจ PASS ครบทั้ง 19 ข้อ. รายละเอียด: [standards-v174.md](docs/verification/standards-v174.md).

**ยังไม่รับรอง GitHub CI, conformance L1–L3 หรือ production ของชุดนี้.** ยังไม่มีบัญชี conformance/ทะเบียนที่เปิดใช้งานยืนยันได้; ข้อจำกัด full UI audit เดิมยังอยู่. Commit ยังไม่ได้ push และโค้ด/เอกสารรอบนี้ยังอยู่ใน working tree ให้ review. ข้อมูลด้านล่างเป็นประวัติรอบก่อน.

## ล่าสุด: นำชุด UI กลางเข้าเว็บและเตรียมลงทะเบียน — 4 ตุลาคม 2026

**ยังไม่ผ่านทุกข้อ / ยังไม่พร้อม merge หรือ production.** นำ shared template UI1.3.1 จาก standards main เข้าโดยคง standards1.7.0 ตามทีมสั่ง; ไม่แก้ source กลาง. แก้ Tailwindv4/next-font/shell/logo/forms/pagination/feedback/focusและkeyboardalternative แล้ว. ดู [audit รายหมวด0–20](docs/ui-design-system-audit.md) และ [provenance/ปัญหาที่ต้องแก้ส่วนกลาง](docs/ui-template-provenance.md).

ผล local: backend245tests, frontend7tests, lint/typecheck/build และ standards19checksผ่าน. Browserabout5ขนาดและmobilemenukeyboardผ่านเฉพาะขอบเขตที่ตรวจ. ยังขาดLighthouse/axe/เครื่องจริง/PLreview และL3บนCoreจริง. ผู้ใช้ยังไม่ได้รับอนุมัติและเลือกยื่นเอง; เตรียม [ข้อมูลกรอกลงทะเบียน](docs/core-hub-registration.md) แล้ว. พอร์ต3202ต้องยืนยันกับทีมก่อนยื่น.

ส่วนด้านล่างเป็นประวัติการตรวจรอบก่อน ไม่ใช้แทนสถานะล่าสุดนี้.

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
