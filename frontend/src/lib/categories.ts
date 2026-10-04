import type { PlaceCategory } from "@/types/api";

export const categoryLabels: Record<PlaceCategory, string> = {
  CLASSROOM: "ห้องเรียน",
  COMPUTER_LAB: "ห้องปฏิบัติการ",
  LECTURER_OFFICE: "ห้องพักอาจารย์",
  DEPARTMENT_OFFICE: "สำนักงาน",
  MEETING_ROOM: "ห้องประชุม",
  RESTROOM: "ห้องน้ำ",
  ENTRANCE: "ทางเข้า",
  FACILITY: "ลิฟต์ / สิ่งอำนวยความสะดวก",
  STUDENT_CLUB: "ห้องชมรม",
  STORAGE: "ห้องเก็บของ",
  OTHER: "อื่น ๆ",
};

export const categoryColors: Record<
  PlaceCategory,
  { fill: string; stroke: string }
> = {
  CLASSROOM: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  COMPUTER_LAB: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  LECTURER_OFFICE: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  DEPARTMENT_OFFICE: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  MEETING_ROOM: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  RESTROOM: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  ENTRANCE: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  FACILITY: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  STUDENT_CLUB: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  STORAGE: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  OTHER: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
};
