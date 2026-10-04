import { cardClass } from "@/csmju";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เกี่ยวกับระบบ",
  description:
    "เกี่ยวกับระบบ CSMJU Interactive Map ภายใต้ CSMJU2030 Unified Ecosystem",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-headline-md text-on-surface md:text-headline-lg">
          เกี่ยวกับระบบ
        </h1>
        <p className="mt-2 text-on-surface-variant">
          CSMJU Interactive Map เป็นระบบย่อยภายใต้ CSMJU2030 Unified Ecosystem
        </p>
      </header>
      <section className={`${cardClass} space-y-4 p-6`}>
        <h2 className="text-lg font-bold text-on-surface">วิธีใช้งาน</h2>
        <ol className="list-decimal space-y-2 pl-5 text-on-surface-variant">
          <li>ค้นหาด้วยชื่อห้อง รหัสห้อง ประเภท หรือชื่ออาจารย์</li>
          <li>เลือกผลลัพธ์เพื่อให้แผนที่โฟกัสและไฮไลต์ตำแหน่ง</li>
          <li>อ่านรายละเอียดห้องจากแผงข้อมูลด้านข้างหรือด้านล่าง</li>
        </ol>
      </section>
    </div>
  );
}
