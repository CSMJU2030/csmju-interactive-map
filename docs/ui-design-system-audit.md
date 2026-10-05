# UI design system audit — อัปเดตรุ่น 5 ตุลาคม 2026

**ยังรับรอง “ผ่านทุกข้อ” ไม่ได้ และยังไม่พร้อม merge/deploy production.** อ่าน UI document 1.3.2 ทุกหมวด 0–20; แก้โค้ดและทดสอบสิ่งที่ทำได้แล้ว แต่ Core Hub ยังไม่ APPROVED/ACTIVE และ review/runtime evidence ยังไม่ครบ.

## รุ่นและขอบเขต

Standards ปรับเป็น **1.7.4** พร้อม UI document **1.3.2** และ template commit `00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c`. เพิ่มปุ่มกลับ CSMJU Portal ใน sidebar โดยรับ URL จาก env; คง min-w-0 ที่แก้ overflow แผนที่ไว้. ดู [provenance และข้อจำกัดส่วนกลาง](ui-template-provenance.md). ผลตรวจวันที่ 4 ตุลาคมด้านล่างเป็นหลักฐานรอบก่อน.

รอบนี้แก้ Tailwind v4, next/font, tokens, shared shell/logo/buttons/badge, fields, pagination, feedback, route fallbacks, error mapping และ keyboard alternative สำหรับผัง. การตรวจ source ไม่ใช่ผลทดสอบหน้าที่ล็อกอินจริง.

## ผลรายหมวด

| หมวด | สถานะหลังแก้ | หลักฐาน / สิ่งที่ยังต้องทำ |
|---|---|---|
| 0 ภาพรวม | ยังไม่ครบ | นำชุดกลางและ state patterns เข้าแล้ว; ยังมีข้อจำกัดในหมวด 12/15/17/18 |
| 1 ขอบเขตส่วนกลาง | แก้แล้วใน source | src/csmju และ globals จาก upstream; domain components แยกและแจ้งใน manifest |
| 2 แนวทาง | บางส่วน | งานหลักไทย, search/map/details; ต้องให้ PL ตรวจ usability ของหน้าล็อกอิน |
| 3 Tokens | แก้แล้วใน source | สี/type scale/ปุ่ม/input/card จากชุดกลาง; แผนที่ใช้ CSS variables กลาง. ห้ามถือว่า contrast ผ่านโดยไม่วัด |
| 4 Typography | ตรวจได้บางส่วน | Noto Sans Thai/Plus Jakarta Sans ผ่าน next/font; browser about ยืนยัน body 16px/line-height 25.6px; ตัวเลขสถิติ tabular-nums. ยังต้องตรวจข้อความยาวและ 200% zoom ทุกหน้า |
| 5 Shell/layout | ตรวจได้บางส่วน | shared shell หนึ่งตัว, main id, skip link, footer/logo/aria-current. Browser about: sidebar 256px ที่ md, padding 16/48px, max-width 1280px. Header/footer actions บางส่วนยังเป็น placeholder กลาง |
| 6 Responsive/touch | ตรวจได้บางส่วน | about ไม่ overflow 360/390/768/1280/1920; local wrapper บังคับ button 44px. ยังไม่ได้ครบ authenticated routes หรือ iOS/Android จริง |
| 7 Components | แก้แล้วบางส่วน | ปุ่ม/input/card/status badge/ConfirmDeleteModal ใช้กลาง; local focus adapters. Header search/notifications/user-menu กลางยังไม่มี actions |
| 8 Forms/table/dialog/feedback | แก้แล้วบางส่วน | PlaceForm เป็น in-page form, labels/ARIA/Thai blur validation/error focus; admin/locations/personnel/lecturer list 20/page; confirmation dialog + focus trap/return/inert; toast 4s. Lecturer form ยังต้องตรวจ inline validation และ keyboard กับข้อมูล Core จริง; ตารางแนวนอนต้องตรวจมือถือจริง |
| 9 States/error mapping | แก้แล้วใน source | delayed skeleton 300ms/slow text 3s, empty/filter clear, retry, Thai error mapping/details.field/request id; route loading/error/not-found ทุก segment. ยังต้องทดสอบทั้งหมดกับเครือข่ายจริง |
| 10 Permissions | รอ Core Hub | nav/actions กรองตาม role จริง, backend guard คงเดิม, forbidden feedback. การทดสอบทุก role จริงยังทำไม่ได้ |
| 11 ภาษา/รูปแบบ | ตรวจได้บางส่วน | error messages ไทย; title ไม่ซ้ำชื่อระบบ; status/disabled reason บางส่วนมีแล้ว. ต้องตรวจข้อความ validation ทุกฟอร์มจริง |
| 12 Accessibility | ยังไม่ครบ | SVG focus ring, keyboard numeric layout controls, menu trap/Esc/focus restore/inert ผ่าน browser about. ยังไม่มี axe 0 serious/critical, Lighthouse Accessibility≥95 หรือ screen-reader ครบทุกหน้า; contrast ส่วนกลางยังไม่วัด |
| 13 Dark mode | ไม่เป็น blocker | เลือก light ตามที่อนุญาต |
| 14 Icons/images/logo | แก้แล้วใน source | ใช้ shared icons และ CsmjuLogo; ลบ lucide dependency ที่ไม่ได้ใช้; personnel ใช้ next/image/dimensions. ต้องตรวจรูปบุคลากรจริงเมื่อมีสิทธิ์ |
| 15 Performance | ยังไม่ยืนยัน | Next production build ผ่าน, First Load JS สูงสุดประมาณ 143kB (ค่าจาก Next build ไม่ใช่ผล mobile/4G); ยังไม่มี Lighthouse≥85/LCP/CLS/INP และ runtime font budget |
| 16 Stack/API/structure | ตรวจผ่านบางส่วน | Next/Nest/Prisma/PostgreSQL, Tailwind v4, route fallbacks; 19 standards checks ผ่าน. Validation คง HTTP400 ตาม API v1.7.0 แม้ UI checklist กล่าวถึง422 — ต้องทีมกลางตัดสินความขัดแย้ง |
| 17 Template/review/CI | ยังไม่ครบ | มี provenance และ local_components; CI source tests ไม่แทน G0–G4/PL review; shared placeholder actions ต้องแก้ upstream ตามกระบวนการ |
| 18 Definition of Done | ยังไม่ผ่าน | ขาดผล authenticated roles, a11y/performance, เครื่องจริงและ approval; ห้ามใช้ CI สีเขียวประกาศผ่านทั้งหมด |
| 19 ภาคผนวก | ตรวจแล้ว | ใช้เป็น reference; manifest design_system_version=1.3.2 ตามชุดที่นำเข้าจริง แยกจาก standards_version=1.7.4 |
| 20 Workflow/checklist | ยังไม่ครบ | ตรวจ source ทุกกลุ่ม; สิ่งที่ต้อง AIE ทดสอบบนเครื่องจริง/PL review ยังไม่เกิดขึ้น |

## ผลทดสอบที่ทำได้

- Backend: **245 tests / 18 suites** ผ่าน รวม SSO e2e; targeted SSO regression **56 tests** ผ่านหลังแก้ validation.
- Frontend: **7 tests / 2 files** ผ่าน (Thai category labels + validation field/request ID/safe messages/session renewal/network feedback).
- lint, typecheck และ Nest/Next production build ผ่านบน Node22.22.0.
- Standards v1.7.0 local orchestrator: **19/19 checks PASS**; UI-02..04 เป็น warnings และ shared src/csmju ถูกยกเว้นจาก raw-color scan. ผลนี้จึงไม่ครอบคลุม UI contract ทั้งฉบับ.
- Browser about anonymous: Noto Sans Thai, Thai title ไม่มีชื่อระบบซ้ำ, main id และ footerถูกต้อง; 360/390 padding16px, 768/1280/1920 padding48px, sidebar256px, containermax1280px; ไม่พบ horizontal overflow.
- Browser menu at360px: เมื่อปิด aside inert; เมื่อเปิด main inert, focus ไปปิดเมนู; Shift+Tab วนไปปุ่มออกจากระบบ; Escape ปิดและคืน focus ไปเปิดเมนู. ไม่ได้กดออกจากระบบหรือส่งคำขอ Core ในการตรวจนี้.
- ภาพหลักฐาน: [desktop](verification/ui-about-desktop.jpg), [mobile](verification/ui-about-mobile.jpg).

## Core Hub และการส่งงาน

ผู้ใช้ยืนยันว่ายังไม่ได้อนุมัติเข้า Core Hub และจะยื่นเอง. จัดข้อมูลที่ตรงกับ manifest/code ไว้ใน [core-hub-registration.md](core-hub-registration.md). พอร์ต3202/4202 เป็นค่าปัจจุบัน ต้องยืนยันพอร์ตที่ทีมจัดสรรก่อนยื่น. ต้อง APPROVED/ACTIVE และมีบัญชี conformance นอก repo จึงรัน L3จริงได้. ไม่ใช้ mock identity แทนผล Core จริง.

ไฟล์ scripts/slides/examples ที่ไม่ใช่ runtime ลบแล้วใน commitก่อน; Docker context ไม่รวม docs/standards/tests. เก็บ migrations/contracts/CI/tests ใน Git ตามหน้าที่.

## ก่อนรับรองผ่านทุกข้อ

1. ลงทะเบียน/อนุมัติ/เปิดใช้งาน Core Hub และตรวจจริงทุก role/หน้า/สถานะ พร้อม L1→L2→L3 0FAIL/0SKIP.
2. ให้ maintainers ของชุดกลางระบุ footer links และ header search/notifications/user-menu actions; resolve validation400/422 กับทีมมาตรฐาน.
3. ตรวจฟอร์มบุคลากร, table mobile, ทุก keyboard flow/200%zoom/screen reader, axe/Lighthouse และ mobile/4G budgets; แก้ตามผลที่พบ.
4. ทดสอบอุปกรณ์ iOS/Androidจริง, Docker startup, แล้วขอ PL/PM review gates ก่อน merge/deploy.
