# UI design system audit — 4 ตุลาคม 2026

**ผลรวม: ยังไม่ผ่าน UI design system ทั้งฉบับ และยังไม่พร้อมรับรอง production.** CI ที่ผ่านก่อนหน้านี้ไม่ได้ตรวจทุกข้อของเอกสาร UI.

## แหล่งอ้างอิงและขอบเขต

- อ่านเอกสาร [ui-design-system.md บน main](https://github.com/CSMJU2030/csmju2030-standards/blob/main/docs/ui-design-system.md) ทุกหมวด 0–20 จาก commit `02ed4503d15b80103efcecf67c99a3e4621d36f7`: เอกสาร UI **1.3.1**, standards main **1.7.2**.
- ระบบนี้ยังเลือก standards **1.7.0** ตามที่ทีมสั่ง; ไม่ได้เลื่อนเวอร์ชันในการ audit นี้. ตัวเลขรุ่นเอกสาร UI กับรุ่น standards เป็นคนละรายการ.
- ตรวจ source frontend/backend, workflow, manifest, และหน้า `/about` ใน browser จริงแบบ anonymous. ไม่ได้ใช้ mock identity เพื่อข้าม SSO.
- `templates/csmju-subsystem-web` มีแล้วบน standards main แต่ **ไม่มีใน tag v1.7.0**. รายงานเดิมที่บอกว่าหา template ไม่พบเป็นประวัติของรอบก่อน; ข้อมูลล่าสุดแก้ปัญหาตำแหน่ง template แล้ว แต่ระบบยังไม่ได้นำเข้าชุดกลาง.
- การตรวจแบบ source ให้หลักฐานว่าข้อใดผิดได้ แต่ไม่ใช้แทน Lighthouse, axe, keyboard, screen reader หรือการทดสอบเครื่องจริง.

## ผลตรวจทุกหมวด

| หมวด | ผล | หลักฐาน / งานที่ยังขาด |
|---|---|---|
| 0 — กฎภาพรวม | ไม่ผ่าน | สี ฟอนต์ shell และสถานะหน้าจอยังมีข้อผิดตามรายการด้านล่าง |
| 1 — ขอบเขตส่วนกลาง | ไม่ผ่าน | ใช้ `AppShell`, ปุ่ม, field และ badge ของระบบเอง; ไม่ได้ใช้ชุดกลาง |
| 2 — แนวทางภาพรวม | บางส่วน | ภาษาไทยและ flow แผนที่มีงานหลักชัดเจน; identity ยังต่างจากส่วนกลาง และ header ใช้ blur บนพื้นสว่าง |
| 3 — Tokens | ไม่ผ่าน | `globals.css:9` สีหลัก `rgb(0 76 153)` ไม่ตรง palette ปัจจุบัน; radius การ์ด 16px / input 12px; ไม่มี token/type scale กลาง; `.card` ไม่มี shadow-sm. reduced-motion มีแล้ว |
| 4 — Typography | ไม่ผ่าน | `globals.css:35–36` ใช้ system-ui; layout ไม่มี next/font หรือ Plus Jakarta Sans/Noto Sans Thai. body line-height 1.7 ผ่านเฉพาะค่าเริ่มต้น; ไม่มี tabular-nums ในสถิติ |
| 5 — App Shell / layout | ไม่ผ่าน | `layout.tsx:17` เรียก shell ของระบบเอง. Sidebar สีขาว ใช้ไอคอนอาคารแทนโลโก้; ไม่มี user/role badge, footer, skip link และ aria-current. Container 1600px, desktop padding 28px |
| 6 — Responsive / touch | บางส่วน | `/about` ไม่ overflow ทั้ง 5 ขนาดที่ตรวจ แต่ sidebar ยังซ่อนที่ 768px (ใช้ lg). ปุ่มไอคอนบางตัวต่ำกว่า 44px. ยังไม่ได้ตรวจทุกหน้า, tablet แนวนอน, 200% zoom และอุปกรณ์ iOS/Android จริง |
| 7 — Components | ไม่ผ่าน | ไม่มี `src/csmju/` และ class จาก ui.ts. ปุ่มไม่มี active/loading/aria-busy ครบ; StatusBadge ไม่มีจุดสถานะ; component กลางที่มีอยู่ถูกสร้างเอง |
| 8 — Forms / table / dialog / feedback | ไม่ผ่าน | ฟอร์ม validate เมื่อ submit; ไม่มี aria-required/aria-describedby, focus error แรก หรือประกาศจำนวน error. PlaceForm เป็น modal ยาว max-w-3xl ไม่มี aria-labelledby/focus trap/คืน focus. Personnel delete ใช้ window.confirm; รายการสถานที่ admin โหลด limit=100 ไม่มี pagination; ไม่มี toast บันทึกสำเร็จ 4 วินาที |
| 9 — Screen states / error mapping | ไม่ผ่าน | LocationsView ไม่มี loading/error handler ของ request และ empty มีเพียงข้อความ. Personnel loading เป็นข้อความ. api.ts ตัด error.details ทิ้งและแสดง message ทั่วไป ไม่ map แต่ละ code เป็น UI. Skeleton route มีบางส่วน แต่ไม่มีเกณฑ์หน่วง 300ms/ข้อความเมื่อเกิน 3s |
| 10 — Permission UI | บางส่วน | ซ่อน admin/staff actions และบังคับที่ backend แล้ว; ไม่มี RoleBadge, disabledReason/tooltip ครบ และหน้า 403 ไม่ครบข้อความ/ทางออกมาตรฐาน. ยังไม่ทดสอบจริงทุก role |
| 11 — ภาษา / รูปแบบข้อมูล | ไม่ผ่าน | ข้อความหลักเป็นไทย แต่ util ส่วนกลางยังไม่ใช้; browser ยืนยัน title ซ้ำชื่อระบบสองรอบจาก title ของหน้าร่วมกับ template ใน root layout |
| 12 — Accessibility | ไม่ผ่าน / ยังไม่วัด | `interactive-svg-map.tsx:248–249` ลบ outline ของจุดกดได้โดยไม่มี focus ring ทดแทน. ไม่มี main id สำหรับ skip link/footer; modal และ field association ยังขาด. มี global focus-visible/reduced-motion แต่ยังไม่มี Lighthouse≥95, axe 0 serious/critical, screen-reader และ keyboard audit ครบ |
| 13 — Dark mode | ไม่ใช่ข้อขัดข้อง | เลือก light mode ซึ่งเป็นทางเลือกที่อนุญาต; ไม่ได้ใช้ invert |
| 14 — Icons / images / logo | ไม่ผ่าน | lucide-react อนุญาต แต่ใช้หลายขนาดนอก 16/20/24 และไม่ได้กำหนด strokeWidth=1.8 ทั้งระบบ; มี SVG ไอคอนเขียนเองใน error/not-found. ไม่มี CsmjuLogo. Personnel ใช้ next/image พร้อม dimensions แล้ว |
| 15 — Performance | ยังไม่ยืนยัน | build ผ่านเดิม แต่ยังไม่มี mobile/4G LCP, CLS, INP, Lighthouse หรือการวัด gzip/font budget ตามเกณฑ์. การ build สำเร็จไม่ใช่ performance audit |
| 16 — Stack / structure / API | ไม่ผ่านบางข้อ | Next App Router, TypeScript, NestJS, PostgreSQL, pnpm และ backend proxy ถูกต้อง. Styling ยัง Tailwind **3.4.17** แทน v4. ขาด csmju และ route error/not-found เฉพาะ segment. backend validation ยังส่งข้อความอังกฤษและ details เป็น array แทน details.field |
| 17 — Template / review / CI | ไม่ผ่าน / ยังไม่ครบ | template กลางบน main มีแล้ว แต่ยังไม่ใช้; local_components ใน manifest ยังว่าง. CI v1.7.0 ตรวจ UI-01 เป็นหลัก ส่วน UI-02..04 เป็น warnings; ไม่ได้รัน Lighthouse/axe. ไม่มีหลักฐาน G0–G4 approval ครบ |
| 18 — Definition of Done | ไม่ผ่าน | ยังมีข้อผิดและหลักฐาน responsive/accessibility/authenticated states ไม่ครบ จึงไม่ควรใช้ CI สีเขียวรับรอง DoD |
| 19 — ภาคผนวก | ตรวจแล้ว | ใช้เป็นตัวอย่าง/ประวัติ ไม่เป็นหลักฐานว่าแผนที่ผ่าน. manifest UI design_system_version ยัง 1.0.0; ต้องอัปเดตตามชุดกลางที่นำเข้าจริง ไม่ใช่เปลี่ยนเลขอย่างเดียว |
| 20 — Checklist / workflow | ไม่ผ่านรายการตรวจ | ตรวจ checklist ด้าน component, state, error, forms, keyboard, routing, fonts และ images ตามหมวดข้างต้นแล้ว. ยังไม่มีผล iPhone/Android หรือ PL review; คำสั่ง package ที่เอกสารระบุเป็นแผนอนาคตตาม 17.0 |

## หลักฐานจาก browser

ตรวจ `/about` โดยไม่เข้าสู่ระบบ:

| Viewport | document scrollWidth | ผลเฉพาะ horizontal overflow |
|---|---:|---|
| 360×640 | 360 | ไม่พบ |
| 390×844 | 390 | ไม่พบ |
| 768×1024 | 768 | ไม่พบ; sidebar display:none ซึ่งผิด breakpoint |
| 1280×800 | 1280 | ไม่พบ; main padding=28px |
| 1920×1080 | 1920 | ไม่พบ; main max-width=1600px |

DOM ยืนยัน font=`system-ui, sans-serif`, main.id ว่าง, ไม่มี footer และ title ซ้ำชื่อระบบ. ผลนี้ใช้กับหน้า `/about` เท่านั้น.

แท็บที่เปิด SSO แสดง `sso/error?code=not_found&subsystem=csmju-interactive-map` และข้อความว่าไม่พบระบบนี้ในทะเบียน Core Hub. จึงยังทดสอบหน้าแผนที่/บุคลากร/admin ด้วยบัญชีจริงไม่ได้. Backend preview health ตอบ 200; ฐานข้อมูล preview แยกจากฐานข้อมูลผู้ใช้.

## สิ่งที่นำออกจากงานเว็บ

- ลบ `scripts/generate_slides.js`, `scripts/slides.html`, `examples/interactive-map-demo.html`: เป็นเครื่องมือสไลด์และ demo แยก ไม่ถูกเรียกจาก scripts ใน package.json หรือ source เว็บ.
- `.dockerignore` ตัด standards, docs, REPORT.md, scripts, examples, .vscode, spec files และ backend/test ออกจาก Docker context.
- เก็บ standards, CI, migration, schema, lockfile, tests และหลักฐานใน Git ตามหน้าที่ของแต่ละไฟล์. ไม่ควรลบมาตรฐานหรือ migrations เพื่อทำ production ให้เล็กลง; Docker runtime คัดลอกเฉพาะไฟล์ที่ต้องใช้.

## งานถัดไปก่อนรับรอง UI

1. ให้ PL กำหนดวิธีใช้ template กลางล่าสุดขณะ repo ถูกกำหนดให้ pin standards 1.7.0; บันทึก provenance และห้ามเปลี่ยนกฎภายใน submodule.
2. ย้าย Tailwind v4, fonts, tokens, CsmjuAppShell, logo, shared components แล้วต่อ domain แผนที่เข้ากับชุดนั้น.
3. แก้ forms/dialogs/pagination, error mapping, loading/empty/success, permission feedback และ focus ของ SVG. สำหรับ API ที่คัดลอกจาก reference ให้แก้ upstream/reference หรือ adapter ที่อนุญาต ไม่ fork ตรรกะ auth/common เพื่อทำให้ผลตรวจเขียว.
4. ลงทะเบียน Core Hub ให้ APPROVED/ACTIVE แล้วตรวจจริงทุก role และทุกสถานะของหน้า.
5. ตรวจ responsive ทุกหน้า, keyboard, zoom, screen reader, Lighthouse, axe, mobile performance และอุปกรณ์จริง แล้วส่ง PL/PM sign-off.

รายงานนี้เป็น audit พร้อมรายการปัญหา ไม่ใช่การรับรองว่าข้อผิดด้าน UI ถูกแก้แล้ว.
