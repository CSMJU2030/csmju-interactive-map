# ผลตรวจเตรียม Production

ตรวจใน workspace ด้วย Node.js 22 สำหรับรุ่นห้อง/บุคลากร/ตารางสอนและหน้าสาธารณะ

- pnpm lint: ผ่านทั้ง backend/frontend
- pnpm typecheck: ผ่านทั้ง backend/frontend
- pnpm test: backend 273 ข้อ และ frontend 12 ข้อ ผ่านทั้งหมด
- pnpm build: NestJS และ Next.js production build ผ่าน
- สร้าง backend OpenAPI และ frontend API types ใหม่
- หน้าสาธารณะและการปฏิเสธ API แก้ไขเมื่อไม่มีสิทธิ์ทดสอบผ่าน real NestJS guards ใน public-read.e2e.spec.ts
- Local preview ปฏิเสธ production environment และฐานข้อมูลที่ไม่ใช่ local preview/test ตาม local-preview-policy.spec.ts
- เพิ่ม compose Production ใช้ main entry point และ Core Hub gateway authentication พร้อม private env files; ไม่เปิดพอร์ต API สู่ host
- git ignore ป้องกัน private environment และ ZIP environment
- docker compose config --quiet: ผ่านโดยใช้ไฟล์ environment ตัวอย่าง

ยังไม่ได้ push/deploy หรือทดสอบ Docker image บนเซิร์ฟเวอร์ Docker engine ในเครื่องไม่ได้เปิด จึงยังสร้าง/รัน container ไม่ได้ ต้องตรวจ reverse proxy, SSO registration, การเชื่อมฐาน PostgreSQL และ conformance ในสภาพแวดล้อมจริงตาม production-ready.md
