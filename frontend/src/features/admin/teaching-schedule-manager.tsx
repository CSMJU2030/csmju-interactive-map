"use client";
import { useState, type FormEvent } from "react";
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  MenuBookIcon,
} from "@/csmju";
import { apiRequest, fieldError } from "@/lib/api";
import { SuccessToast } from "@/components/common/ui-feedback";
import type { Place } from "@/types/api";
import {
  TeachingScheduleEditor,
  type ScheduleInput,
} from "./teaching-schedule-editor";

function scheduleInputs(place?: Place): ScheduleInput[] {
  return (place?.teachingSchedule ?? []).map(
    ({
      lecturerId,
      dayOfWeek,
      startTime,
      endTime,
      validFrom,
      validUntil,
      courseName,
    }) => ({
      lecturerId,
      dayOfWeek,
      startTime,
      endTime,
      validFrom,
      validUntil,
      courseName,
    }),
  );
}

function RoomScheduleForm({
  place,
  places,
  onSelect,
  onSaved,
}: {
  place?: Place;
  places: Place[];
  onSelect: (id: string) => void;
  onSaved: () => Promise<void>;
}) {
  const original = scheduleInputs(place);
  const [rows, setRows] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const dirty = JSON.stringify(rows) !== JSON.stringify(original);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!place || saving) return;
    if (
      rows.some(
        (row) =>
          !row.lecturerId ||
          !row.courseName.trim() ||
          !row.validFrom ||
          !row.validUntil ||
          row.validFrom > row.validUntil ||
          row.startTime >= row.endTime,
      )
    ) {
      setError("กรุณาตรวจอาจารย์ วิชา วันและเวลาของตารางสอนให้ครบถ้วน");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiRequest<Place>("/api/v1/places/" + place.id, {
        method: "PATCH",
        body: JSON.stringify({ teachingSchedule: rows }),
      });
      await onSaved();
    } catch (caught) {
      setError(fieldError(caught).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4 p-5">
      <label className="block max-w-xl text-label-md">
        เลือกห้องสำหรับจัดการตารางสอน
        <select
          value={place?.id ?? ""}
          onChange={(event) => onSelect(event.target.value)}
          disabled={saving || dirty}
          className={`${inputClass} mt-2 disabled:opacity-60`}
        >
          <option value="">เลือกห้องบนแผนที่</option>
          {places.map((room) => (
            <option key={room.id} value={room.id}>
              {room.roomCode
                ? `${room.roomCode} · ${room.nameTh}`
                : room.nameTh}
              {!room.isActive ? " (ปิดใช้งาน)" : ""}
            </option>
          ))}
        </select>
      </label>
      {dirty && (
        <p className="text-caption text-on-surface-variant">
          บันทึกหรือยกเลิกการแก้ไขก่อนเปลี่ยนห้อง
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-error-container p-3 text-on-error-container"
        >
          {error}
        </p>
      )}
      {place ? (
        <>
          <fieldset
            disabled={saving}
            className="min-w-0 border-0 p-0 disabled:opacity-60"
          >
            <TeachingScheduleEditor value={rows} onChange={setRows} />
          </fieldset>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || !dirty}
              className={`${primaryButtonClass} disabled:opacity-50`}
            >
              {saving ? "กำลังบันทึก…" : "บันทึกตารางสอน"}
            </button>
            <button
              type="button"
              disabled={saving || !dirty}
              onClick={() => {
                setRows(original);
                setError("");
              }}
              className={`${secondaryButtonClass} disabled:opacity-50`}
            >
              ยกเลิกการแก้ไข
            </button>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-surface p-4 text-body-md text-on-surface-variant">
          เลือกห้องเพื่อดูตารางเดิม ดึงข้อมูลจากทะเบียน หรือเพิ่มช่วงสอนเอง
        </p>
      )}
    </form>
  );
}

export function TeachingScheduleManager({
  places,
  onSaved,
}: {
  places: Place[];
  onSaved: () => Promise<void>;
}) {
  const [selectedId, setSelectedId] = useState("");
  const [toast, setToast] = useState("");
  const place = places.find((room) => room.id === selectedId);
  return (
    <section id="manage-teaching-schedule" className={cardClass}>
      <div className="border-b border-outline-variant/40 p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <MenuBookIcon width={20} height={20} />
          จัดการตารางสอนประจำห้อง
        </h2>
        <p className="mt-1 text-label-md text-on-surface-variant">
          เลือกห้องและบันทึกตารางสอน เพื่อแสดงอาจารย์ที่กำลังสอนตามเวลาไทย
        </p>
      </div>
      <RoomScheduleForm
        key={`${place?.id ?? ""}:${place?.updatedAt ?? ""}`}
        place={place}
        places={places}
        onSelect={setSelectedId}
        onSaved={async () => {
          await onSaved();
          setToast(
            "บันทึกตารางสอนสำเร็จ " +
              new Date().toLocaleTimeString("th-TH", {
                timeZone: "Asia/Bangkok",
              }),
          );
        }}
      />
      {toast && <SuccessToast key={toast} message={toast} />}
    </section>
  );
}
