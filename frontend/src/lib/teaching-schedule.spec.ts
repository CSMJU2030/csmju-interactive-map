import { describe, expect, it } from "vitest";
import { isTeachingNow } from "./teaching-schedule";

const slot = {
  dayOfWeek: 4,
  startTime: "09:00",
  endTime: "12:00",
  validFrom: "2026-06-01",
  validUntil: "2026-10-08",
};
describe("Current teaching time in Bangkok", () => {
  it("includes the start and excludes the end of a slot", () => {
    expect(isTeachingNow(slot, new Date("2026-10-08T02:00:00Z"))).toBe(true);
    expect(isTeachingNow(slot, new Date("2026-10-08T05:00:00Z"))).toBe(false);
  });
  it("rejects the wrong weekday and expired semesters", () => {
    expect(isTeachingNow(slot, new Date("2026-10-07T03:00:00Z"))).toBe(false);
    expect(isTeachingNow(slot, new Date("2026-10-15T03:00:00Z"))).toBe(false);
  });
  it("handles Thailand midnight regardless of the browser timezone", () => {
    expect(
      isTeachingNow(
        { ...slot, startTime: "00:00", endTime: "01:00" },
        new Date("2026-10-07T17:30:00Z"),
      ),
    ).toBe(true);
  });
});
