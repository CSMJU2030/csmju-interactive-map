export const dayLabels = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];
export type TeachingSlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  validFrom: string;
  validUntil: string;
};
export function isTeachingNow(slot: TeachingSlot, now: Date): boolean {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  const time = `${get("hour")}:${get("minute")}`;
  return (
    date >= slot.validFrom &&
    date <= slot.validUntil &&
    new Date(date + "T00:00:00Z").getUTCDay() === slot.dayOfWeek &&
    time >= slot.startTime &&
    time < slot.endTime
  );
}
