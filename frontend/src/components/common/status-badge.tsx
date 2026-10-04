import { StatusBadge as SharedStatusBadge } from "@/csmju";

export function StatusBadge({ active }: { active: boolean }) {
  return (
    <SharedStatusBadge
      tone={active ? "success" : "neutral"}
      label={active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
    />
  );
}
