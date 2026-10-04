import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "จัดการแผนที่",
  description:
    "แผงควบคุมผู้ดูแลระบบแผนที่สาขาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
