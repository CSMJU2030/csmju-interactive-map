import type { Metadata } from 'next';
import { PersonnelView } from '@/features/personnel/personnel-view';

export const metadata: Metadata = {
  title: 'คณาจารย์และเจ้าหน้าที่ · ระบบแผนที่สาขาแบบ Interactive · CSMJU',
  description: 'ข้อมูลคณาจารย์และบุคลากร สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้',
};

export default function PersonnelPage() {
  return <PersonnelView />;
}
