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
    fill: "var(--color-sso-container)",
    stroke: "var(--color-sso)",
  },
  LECTURER_OFFICE: {
    fill: "color-mix(in srgb, var(--color-secondary) 12%, var(--color-surface-container-lowest))",
    stroke: "var(--color-secondary)",
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
    fill: "color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-container-lowest))",
    stroke: "var(--color-accent)",
  },
  ENTRANCE: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
  FACILITY: {
    fill: "color-mix(in srgb, var(--color-brand-amber) 18%, var(--color-surface-container-lowest))",
    stroke: "color-mix(in srgb, var(--color-brand-amber) 60%, var(--color-error))",
  },
  STUDENT_CLUB: {
    fill: "var(--color-error-container)",
    stroke: "var(--color-error)",
  },
  STORAGE: {
    fill: "color-mix(in srgb, var(--color-brand-amber) 12%, var(--color-surface-container-lowest))",
    stroke: "var(--color-brand-amber)",
  },
  OTHER: {
    fill: "var(--color-primary-fixed)",
    stroke: "var(--color-primary-container)",
  },
};
