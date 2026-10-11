# CSMJU Interactive Map

Next.js + NestJS + Prisma/PostgreSQL สำหรับแผนที่สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้

## ระบบที่ใช้งาน

- ผู้เยี่ยมชมดู `/map`, `/locations`, `/personnel`, `/about` ได้โดยไม่ต้องเข้าสู่ระบบ
- ผู้จัดการข้อมูลเข้าสู่ระบบผ่าน Core Hub SSO; API ตรวจ JWT และสิทธิ์สำหรับเพิ่ม แก้ไข และลบ
- ห้อง ชื่อ รหัส ตำแหน่ง และบุคลากรเก็บในฐานข้อมูลของระบบและแก้ไขได้ ไม่อ่านข้อมูลเก่าจาก Core Hub
- ดึงคณาจารย์และเจ้าหน้าที่จากเว็บสาขาได้ผ่านหน้าจัดการ โดยรักษาการกำหนดห้องเดิม
- ตารางสอนดึงเฉพาะวิทย์คอมจากทะเบียนมหาวิทยาลัย หรือกรอกเอง เลือกวันที่ภาคเรียนก่อนบันทึก
- แสดงอาจารย์ที่กำลังสอนตามวัน วันที่ และเวลาปัจจุบันในเขตเวลา Asia/Bangkok
- ฟอร์มแก้สถานที่อยู่ใต้ตารางสถานที่ ฟอร์มบุคลากรอยู่ใต้ตารางบุคลากร ตารางสอนมีส่วนจัดการแยก

ดู [คู่มือห้องและตารางสอน](docs/local-rooms-and-teaching-schedule.md), [ข้อมูลบุคลากร](docs/csmju-personnel-source.md), [หน้าสาธารณะ](docs/public-visitors.md)

## พัฒนาและทดสอบ Local

ใช้ Node.js 22, pnpm ตาม `packageManager` และ PostgreSQL ตั้งค่าไฟล์ส่วนตัวจาก `backend/.env.example` และ `frontend/.env.example` โดยไม่ทับไฟล์ที่มีอยู่

```powershell
git submodule update --init standards
pnpm install --frozen-lockfile
pnpm prisma:generate
pnpm --filter @csmju-interactive-map/backend exec prisma migrate deploy
pnpm dev
```

`pnpm dev` ใช้ Core Hub SSO จริง ไม่มีทางเข้าอัตโนมัติสำหรับผู้ดูแลทดสอบ Production ใช้ backend `dist/main.js` และ frontend standalone ตามคู่มือ Production

ข้อมูลที่แก้ใน Local อยู่ในฐานข้อมูล Local การ push โค้ดไม่ย้ายข้อมูลไปเซิร์ฟเวอร์

## Production

ใช้ [คู่มือ Production](docs/production-ready.md) และ `docker-compose.production.yml` พร้อมฐาน PostgreSQL ถาวรของระบบ ไม่ใช้ `docker-compose.yml` ที่เป็นตัวอย่างพัฒนา

หน้าเว็บจริงเป้าหมาย: https://csmju-interactive-map.jowave.com และ SSO callback `/auth/callback` การเตรียมโค้ดไม่ได้หมายความว่า deploy หรือผ่าน conformance บนเซิร์ฟเวอร์แล้ว ดูหลักฐานเดิมใน [REPORT.md](REPORT.md)

## ตรวจโค้ดก่อน push

```powershell
pnpm generate:openapi
pnpm --filter @csmju-interactive-map/frontend generate:api
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

CI และ L3 บนเซิร์ฟเวอร์ต้องตรวจแยกตาม [คู่มือ Core Hub](docs/core-hub-integration.md) ต้องมีการลงทะเบียนสิทธิ์จริงก่อนใช้งานหน้าจัดการ
