# เตรียมใช้งานจริงและ push

Production เริ่มด้วย `dist/main.js` และ Core Hub SSO เท่านั้น ไม่มีทางเข้าอัตโนมัติสำหรับผู้ดูแลทดสอบ ผู้เยี่ยมชมอ่านแผนที่และรายชื่อได้ ส่วน API แก้ไขยังตรวจสิทธิ์

## ตั้งค่าบนเซิร์ฟเวอร์

1. สำรองฐานข้อมูล Production ก่อนเปลี่ยนรุ่น โดยเฉพาะเมื่อย้ายจากโครงสร้าง Core Hub reference เดิม
2. คัดลอก `deployment/backend.env.example` เป็น `backend.env` และ `deployment/frontend.env.example` เป็น `frontend.env` ที่ราก repo บนเซิร์ฟเวอร์ กรอก DATABASE_URL ของฐาน PostgreSQL ถาวรที่ container เข้าถึงได้
3. ยืนยันโดเมน HTTPS, CORS, Core Hub issuer/audience และ callback ที่ลงทะเบียน ตลอดจนสิทธิ์ staff/admin ของระบบ
4. รัน `docker compose -f docker-compose.production.yml up -d --build` โดยไม่รวม compose สำหรับพัฒนา Backend ใช้ `prisma migrate deploy` ก่อนเปิดบริการ ไม่ reset ฐานข้อมูล
5. ให้ reverse proxy HTTPS ของเซิร์ฟเวอร์ส่งต่อไป `127.0.0.1:3216` API อยู่ใน network ของ Docker และไม่เปิดพอร์ตภายนอก

DATABASE_URL ต้องใช้ hostname ที่ Docker เข้าถึงได้ ไม่ใช้ `localhost` เพื่ออ้าง PostgreSQL บน host ใช้ `host.docker.internal` หรือ hostname ของฐานข้อมูลตามการตั้งค่าเครือข่ายจริง

ค่าปลายทาง rewrite ของ frontend ฝังตอน build หากเปลี่ยนจาก `http://api:4000` ให้เปลี่ยน build args และ runtime ให้ตรงกันแล้ว build ใหม่

## ข้อมูลเมื่อเปิดใช้งาน

Migration เปลี่ยนโครงสร้าง แต่ไม่ย้ายข้อมูลทดสอบจาก Local อัตโนมัติ ห้องที่เคยเก็บเป็น reference จะมีชื่อเริ่มต้นจากรหัสห้อง บุคลากรเดิมมีชื่อเริ่มต้นจากรหัสบุคลากร ต้องตรวจชื่อและการจับคู่หลัง migration

ผู้จัดการข้อมูลเพิ่ม/แก้ห้องและผังใน `/admin` ดึงบุคลากรจากเว็บสาขา ตรวจการจับคู่และห้องทำงาน แล้วนำเข้าตารางสอนของภาคเรียนที่ต้องการ กำหนดช่วงวันที่และกดบันทึก ตารางที่นำเข้าต้องตรวจชื่อห้องจากทะเบียนกับรหัสบนแผนที่

ถ้าต้องการข้อมูลเหมือน Local ให้ย้ายข้อมูลผ่านกระบวนการสำรอง/คืนฐานข้อมูลที่ผู้ดูแลเซิร์ฟเวอร์ตรวจสอบแล้ว อย่าคืนทั้งฐานทดสอบทับฐานจริงที่มีข้อมูลอยู่ สคริปต์ `restore-reference-layout.ts` เป็นเครื่องมือทดสอบเก่า ไม่ใช้ตั้งข้อมูล Production รุ่นนี้

## ตรวจหลัง deploy

- `/api/health` ตอบ 200 และ migration สำเร็จ
- ผู้ไม่เข้าสู่ระบบเปิด map/locations/personnel ได้ และ API เพิ่ม/แก้ไข/ลบตอบ 401
- บัญชี SSO ที่มีสิทธิ์บันทึกห้อง บุคลากร และตารางสอนได้ ข้อมูลยังอยู่หลัง restart
- ชื่ออาจารย์ในห้องตรงกับวัน เวลาไทย และช่วงวันที่ภาคเรียน ไม่มีป้ายผู้ดูแลทดสอบ Local
- ตรวจ SSO callback/logout และ conformance ตามมาตรฐานของเซิร์ฟเวอร์

## ก่อน push

รัน lint, typecheck, test และ build ตาม README พร้อมสร้าง OpenAPI และ frontend types ให้ตรงกัน ไม่ commit `.env`, `backend.env`, `frontend.env`, ZIP environment, สำรองฐานข้อมูล หรือ credentials ไฟล์ตัวอย่างไม่มีรหัสผ่านจริงและ commit ได้

ชุดตั้งค่านี้ยังไม่ได้ deploy และผลทดสอบในเครื่องไม่แทนการรับรอง conformance หรือการทดสอบ Docker บนเซิร์ฟเวอร์
