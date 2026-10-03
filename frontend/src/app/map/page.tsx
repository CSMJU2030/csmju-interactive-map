import type { Metadata } from 'next';
import { MapExplorer } from '@/features/map/map-explorer';
import { QrMapCard } from '@/components/map/qr-map-card';

export const metadata: Metadata = {
  title: 'แผนที่ Interactive · ระบบแผนที่สาขาแบบ Interactive · CSMJU',
  description: 'ค้นหาห้อง สถานที่ และห้องพักอาจารย์ภายในสาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้',
};

export default function MapPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold text-brand-700">CSMJU INTERACTIVE MAP</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">แผนที่สาขาวิทยาการคอมพิวเตอร์</h1>
        <p className="mt-2 max-w-2xl text-slate-500">ค้นหาห้อง สถานที่ และห้องพักอาจารย์ภายในสาขา</p>
      </header>
      <MapExplorer />
      <div className="max-w-md">
        <QrMapCard />
      </div>
    </div>
  );
}
