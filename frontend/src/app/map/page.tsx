import type { Metadata } from "next";
import { MapExplorer } from "@/features/map/map-explorer";
import { QrMapCard } from "@/components/map/qr-map-card";

export const metadata: Metadata = {
  title: "แผนที่ Interactive",
  description:
    "ค้นหาห้อง สถานที่ และห้องพักอาจารย์ภายในสาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้",
};

export default function MapPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-label-md font-semibold text-primary-container">
          CSMJU INTERACTIVE MAP
        </p>
        <h1 className="mt-1 font-display text-headline-md text-on-surface md:text-headline-lg">
          แผนที่สาขาวิทยาการคอมพิวเตอร์
        </h1>
        <p className="mt-2 max-w-2xl text-on-surface-variant">
          ค้นหาห้อง สถานที่ และห้องพักอาจารย์ภายในสาขา
        </p>
      </header>
      <MapExplorer />
      <div className="max-w-md">
        <QrMapCard />
      </div>
    </div>
  );
}
