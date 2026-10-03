import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'เกี่ยวกับระบบ · ระบบแผนที่สาขาแบบ Interactive · CSMJU',
  description: 'เกี่ยวกับระบบ CSMJU Interactive Map ภายใต้ CSMJU2030 Unified Ecosystem',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">เกี่ยวกับระบบ</h1>
        <p className="mt-2 text-slate-500">CSMJU Interactive Map เป็นระบบย่อยภายใต้ CSMJU2030 Unified Ecosystem</p>
      </header>
      <section className="card space-y-4 p-6">
        <h2 className="text-lg font-bold text-slate-900">วิธีใช้งาน</h2>
        <ol className="list-decimal space-y-2 pl-5 text-slate-600">
          <li>ค้นหาด้วยชื่อห้อง รหัสห้อง ประเภท หรือชื่ออาจารย์</li>
          <li>เลือกผลลัพธ์เพื่อให้แผนที่โฟกัสและไฮไลต์ตำแหน่ง</li>
          <li>อ่านรายละเอียดห้องจากแผงข้อมูลด้านข้างหรือด้านล่าง</li>
        </ol>
      </section>
    </div>
  );
}
