import type { Metadata } from "next";
import { LocationsView } from "@/features/locations/locations-view";

export const metadata: Metadata = {
  title: "สถานที่ทั้งหมด",
  description:
    "รายชื่อห้องและจุดสำคัญที่เปิดแสดงบนแผนที่สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้",
};

export default function LocationsPage() {
  return <LocationsView />;
}
