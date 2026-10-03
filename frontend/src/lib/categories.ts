import type { PlaceCategory } from '@/types/api';

export const categoryLabels: Record<PlaceCategory, string> = {
  CLASSROOM: 'ห้องเรียน',
  COMPUTER_LAB: 'ห้องปฏิบัติการ',
  LECTURER_OFFICE: 'ห้องพักอาจารย์',
  DEPARTMENT_OFFICE: 'สำนักงาน',
  MEETING_ROOM: 'ห้องประชุม',
  RESTROOM: 'ห้องน้ำ',
  ENTRANCE: 'ทางเข้า',
  FACILITY: 'ลิฟต์ / สิ่งอำนวยความสะดวก',
  STUDENT_CLUB: 'ห้องชมรม',
  STORAGE: 'ห้องเก็บของ',
  OTHER: 'อื่น ๆ',
};

export const categoryColors: Record<PlaceCategory, { fill: string; stroke: string }> = {
  CLASSROOM: { fill: 'var(--color-cat-classroom-fill)', stroke: 'var(--color-cat-classroom-stroke)' },
  COMPUTER_LAB: { fill: 'var(--color-cat-lab-fill)', stroke: 'var(--color-cat-lab-stroke)' },
  LECTURER_OFFICE: { fill: 'var(--color-cat-office-fill)', stroke: 'var(--color-cat-office-stroke)' },
  DEPARTMENT_OFFICE: { fill: 'var(--color-cat-dept-fill)', stroke: 'var(--color-cat-dept-stroke)' },
  MEETING_ROOM: { fill: 'var(--color-cat-meeting-fill)', stroke: 'var(--color-cat-meeting-stroke)' },
  RESTROOM: { fill: 'var(--color-cat-restroom-fill)', stroke: 'var(--color-cat-restroom-stroke)' },
  ENTRANCE: { fill: 'var(--color-cat-entrance-fill)', stroke: 'var(--color-cat-entrance-stroke)' },
  FACILITY: { fill: 'var(--color-cat-facility-fill)', stroke: 'var(--color-cat-facility-stroke)' },
  STUDENT_CLUB: { fill: 'var(--color-cat-club-fill)', stroke: 'var(--color-cat-club-stroke)' },
  STORAGE: { fill: 'var(--color-cat-storage-fill)', stroke: 'var(--color-cat-storage-stroke)' },
  OTHER: { fill: 'var(--color-cat-other-fill)', stroke: 'var(--color-cat-other-stroke)' },
};
