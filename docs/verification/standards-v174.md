# Standards v1.7.4 — 5 ตุลาคม 2026

- Upstream tag: `v1.7.4`, commit `00fedda3855e7bd4c6ab419c48333bfcd0bf7e6c`.
- `.standards-version`, submodule checkout และ `subsystem.yaml` ตรงกับ 1.7.4.
- Next.js / eslint-config-next: 16.3.6; UI document: 1.3.2.
- Node 22.22.0, pnpm 11.19.0 ตาม packageManager ของโปรเจกต์.
- `pnpm install` ผ่าน และ Prisma Client 7.9.1 generate ผ่าน. เพิ่ม fetch timeout เฉพาะคำสั่งติดตั้งเพื่อดาวน์โหลดแพ็กเกจขนาดใหญ่ ไม่เปลี่ยน global config.

## ผลตรวจ source ปัจจุบัน

| รายการ | ผล |
|---|---|
| Lint frontend / backend | PASS ไม่มี warning ในรอบสุดท้าย |
| Typecheck frontend / backend | PASS |
| Unit tests | PASS: backend 245 + frontend 7 = 252 |
| Production build Next.js / NestJS | PASS |
| OpenAPI sync | PASS |
| UI-01 | PASS: สีหมวดหมู่ใช้ token และ color-mix จาก palette กลาง |
| Standards checks | 18/19 PASS ใน orchestrator; GH-04 PASS เมื่อตรวจซ้ำหลัง commit เวอร์ชัน จึงตรวจครบทั้ง 19 ข้อแล้ว |
| Static `/about` HTML | มี “กลับ CSMJU Portal”, ไม่มีลิงก์ซ้ำใน body, lang=th |
| Core Hub health จริง | HTTP 200 |
| Git diff whitespace | PASS |

หลักฐาน local: `compliance-v174.log`, `submodule-v174.log`, `frontend-lint-v174.log` ในโฟลเดอร์นี้ (ไฟล์ log ถูก ignore ตามกฎ repo).

GH-04 อ่าน gitlink จาก HEAD: รอบ orchestrator ยังอ่าน commit ของ 1.7.0 จึง FAIL. หลัง local commit `b1dc1c9` เฉพาะ `.standards-version` กับ gitlink แล้วตรวจ GH-04 ซ้ำ ได้ `standards version ตรงกัน: 1.7.4 · submodule ชี้ v1.7.4`. ไม่รัน QA ซ้ำเพราะ source ไม่เปลี่ยนหลังผ่านแล้ว. ชุดตรวจใช้สำเนา tag v1.7.4 แบบ LF นอก repo เพื่อรันใน WSL พร้อม adapters Node/pnpm/jq ของ Windows; ไม่แก้สคริปต์มาตรฐาน.

## ขอบเขตที่ยังไม่รับรอง

ยังไม่ได้รัน GitHub CI ของการเปลี่ยนแปลงชุดนี้หรือ conformance L1–L3 บน Core Hub จริง เพราะไม่มีบัญชี conformance/ทะเบียน APPROVED–ACTIVE ที่ยืนยันได้. ผล local ไม่แทนการรับรอง production หรือ full UI audit.

คงการแก้ผัง/overflow ที่มีอยู่ก่อนเริ่มงาน รวมทั้งสคริปต์คืนผัง local. Shared shell ตรงกับ template v1.7.4 ยกเว้น `min-w-0` ที่มีอยู่เดิม. โค้ดและเอกสารรอบนี้ยังเป็น working changes เพื่อ review; commit เวอร์ชันยังไม่ได้ push.
