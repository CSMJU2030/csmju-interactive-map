# Environment สำหรับเซิร์ฟเวอร์ Interactive Map

ไฟล์ใน ZIP ใช้สำหรับ Docker services `api` และ `web` ที่ DevOps จัดการบนเซิร์ฟเวอร์:

- `backend.env`: กรอก `DATABASE_URL` ของฐานข้อมูลเฉพาะระบบนี้ก่อนเปิดบริการ เช่นรูปแบบ `postgresql://USER:PASSWORD@DB_HOST:5432/DB_NAME?schema=public`. ใช้ hostname ที่ container api เข้าถึงได้ และ URL-encode อักขระพิเศษในรหัสผ่าน.
- `frontend.env`: ตั้งค่าพร้อมสำหรับ service api ที่ `http://api:4000` และโดเมน `https://csmju-interactive-map.jowave.com`.

ให้ production compose ใช้ `env_file: ./backend.env` ใน service `api` และ `env_file: ./frontend.env` ใน service `web`. ถ้ามี `environment:` กำหนดค่าเดียวกันอยู่ ค่าใน environment จะทับ env_file จึงต้องปรับให้ตรงกัน โดยเฉพาะ NODE_ENV, DATABASE_URL, CORS_ORIGIN และ FRONTEND_URL.

docker-compose.yml ใน repo เป็นตัวอย่าง local: กำหนด NODE_ENV=development และ DATABASE_URL แบบ local ไว้โดยตรง. การวางไฟล์ .env อย่างเดียวจะไม่เปลี่ยนค่าทั้งสองนี้. ใช้ `docker-compose.production.yml` แบบแยกไฟล์ พร้อมฐานข้อมูลถาวรและ reverse proxy HTTPS ตาม [คู่มือ Production](production-ready.md) หรือ compose ของ DevOps ที่ตั้งค่าเทียบเท่ากัน.

Callback ใน Core Hub ต้องเป็น `https://csmju-interactive-map.jowave.com/auth/callback`. Backend ใช้ทะเบียนของ Core Hub ไม่ต้องสร้าง CALLBACK_URL หรือใส่ JWT private key/client secret ใน env.

หลังเชื่อม env เข้ากับ production compose ให้ recreate services ด้วยขั้นตอน deploy ของ DevOps แล้วตรวจ container logs และ `https://csmju-interactive-map.jowave.com/api/health` ให้ตอบ 200. การเปลี่ยนค่า env อย่างเดียวไม่ยืนยันว่าปัญหา Apache 503 หายแล้ว.

ไฟล์นี้ไม่มีข้อมูลลับจริง. เมื่อกรอก DATABASE_URL แล้วให้เก็บ backend.env บนเซิร์ฟเวอร์และไม่ commit หรือแชร์สู่สาธารณะ.
