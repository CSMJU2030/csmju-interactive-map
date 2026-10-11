"use client";
import { useEffect, useState } from "react";
import { isTeachingNow } from "@/lib/teaching-schedule";
import {
  cardClass,
  PersonIcon,
  LocationIcon as MapPin,
  CloseIcon as X,
} from "@/csmju";
import { categoryLabels } from "@/lib/categories";
import type { Place } from "@/types/api";
import { StatusBadge } from "../common/status-badge";

const clockFormat = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const dateFormat = new Intl.DateTimeFormat("th-TH", {
  timeZone: "Asia/Bangkok",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function PlaceDetailPanel({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(timer);
    };
  }, []);
  const schedule = place.teachingSchedule ?? [];
  const current = now ? schedule.filter((row) => isTeachingNow(row, now)) : [];
  return (
    <aside className={`${cardClass} relative`} aria-label="รายละเอียดสถานที่">
      <div className="bg-gradient-to-br from-primary-container/10 via-primary-container/5 to-surface-container-lowest p-5">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-surface-container-lowest/80 p-2 text-on-surface-variant hover:bg-surface"
          aria-label="ปิดรายละเอียด"
        >
          <X width={20} height={20} />
        </button>
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-surface-container-lowest text-primary-container shadow-sm">
          <MapPin width={24} height={24} />
        </span>
        <div className="pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface">
              {place.roomCode ?? place.nameTh}
            </h2>
            <StatusBadge active={place.isActive} />
          </div>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {place.nameTh}
          </p>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="rounded-xl border border-outline-variant/40 bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-label-md text-on-surface-variant">
              เวลาปัจจุบัน · ประเทศไทย
            </p>
            <span className="flex items-center gap-1.5 text-caption text-on-surface-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-container" />
              อัปเดตอัตโนมัติ
            </span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-on-surface">
            {now ? clockFormat.format(now) : "--:--:--"}
          </p>
          <p className="mt-1 text-caption text-on-surface-variant">
            {now ? dateFormat.format(now) : "กำลังตรวจเวลา…"}
          </p>
        </div>
        <section aria-labelledby="current-teaching-title">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3
              id="current-teaching-title"
              className="text-body-md font-semibold text-on-surface"
            >
              อาจารย์ที่กำลังสอน
            </h3>
            {now && (
              <span
                className={`rounded-full px-2.5 py-1 text-caption font-medium ${current.length ? "bg-emerald-50 text-emerald-700" : "bg-surface text-on-surface-variant"}`}
              >
                {current.length ? "กำลังมีการสอน" : "ไม่มีคาบสอนขณะนี้"}
              </span>
            )}
          </div>
          {!now ? (
            <p className="text-body-md text-on-surface-variant">
              กำลังตรวจตารางสอน…
            </p>
          ) : current.length ? (
            <ul className="space-y-3">
              {current.map((row) => (
                <li
                  key={row.id}
                  className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <PersonIcon width={20} height={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-md font-semibold text-on-surface">
                        {row.lecturerName}
                      </p>
                      <p className="mt-1 text-caption font-medium text-emerald-700">
                        {row.startTime}–{row.endTime} น.
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 border-t border-emerald-200/70 pt-3 text-body-md leading-relaxed text-on-surface-variant">
                    {row.courseName}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-outline-variant bg-surface/50 px-4 py-5 text-center">
              <PersonIcon
                width={28}
                height={28}
                className="mx-auto mb-2 text-outline"
              />
              <p className="text-body-md font-medium text-on-surface">
                ยังไม่มีอาจารย์กำลังสอนตามตาราง
              </p>
              <p className="mt-1 text-caption leading-relaxed text-on-surface-variant">
                {schedule.length
                  ? "ชื่ออาจารย์จะแสดงเมื่อถึงวันและเวลาของคาบสอน"
                  : "ห้องนี้ยังไม่ได้บันทึกตารางสอน"}
              </p>
            </div>
          )}
          <p className="mt-2 text-caption text-on-surface-variant">
            อ้างอิงตารางสอนที่บันทึกไว้และเวลาของอุปกรณ์ (Asia/Bangkok)
          </p>
        </section>
        <dl className="grid grid-cols-2 gap-3 text-label-md">
          <div className="rounded-xl bg-surface p-3">
            <dt className="text-caption text-on-surface-variant">รหัสห้อง</dt>
            <dd className="mt-1 break-words font-semibold text-on-surface">
              {place.roomCode ?? "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-surface p-3">
            <dt className="text-caption text-on-surface-variant">ประเภท</dt>
            <dd className="mt-1 font-semibold text-on-surface">
              {categoryLabels[place.category]}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="mb-1 font-medium text-on-surface">
              รายละเอียดสถานที่
            </dt>
            <dd className="leading-relaxed text-on-surface-variant">
              {place.description ?? "ยังไม่มีรายละเอียด"}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
