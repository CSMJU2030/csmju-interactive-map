"use client";
import { useEffect, useState } from "react";
import { inputClass, secondaryButtonClass } from "@/csmju";
import { apiRequest } from "@/lib/api";
import { dayLabels } from "@/lib/teaching-schedule";
import { normalizePersonnelName as normalizeName } from "@/lib/personnel-name";
import type { Lecturer, Place } from "@/types/api";

export type ScheduleInput = Omit<
  Place["teachingSchedule"][number],
  "id" | "lecturerName"
>;
type RegistrarSlot = {
  courseCode: string;
  courseName: string;
  section: string;
  lecturerNames: string[];
  roomName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export function TeachingScheduleEditor({
  value,
  onChange,
}: {
  value: ScheduleInput[];
  onChange: (rows: ScheduleInput[]) => void;
}) {
  const [teachers, setTeachers] = useState<Lecturer[]>([]);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear() + 543);
  const [semester, setSemester] = useState(1);
  const [source, setSource] = useState<RegistrarSlot[]>([]);
  const [room, setRoom] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [from, setFrom] = useState("");
  const [until, setUntil] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      const all: Lecturer[] = [];
      for (let page = 1, total = 1; page <= total; page++) {
        const response = await apiRequest<Lecturer[]>(
          `/api/v1/lecturers?personnelType=TEACHER&limit=100&page=${page}`,
        );
        all.push(...response.data);
        total = response.meta?.totalPages ?? 1;
      }
      if (active) setTeachers(all);
    }
    void load().catch((caught: unknown) => {
      if (active)
        setError(
          caught instanceof Error ? caught.message : "โหลดอาจารย์ไม่สำเร็จ",
        );
    });
    return () => {
      active = false;
    };
  }, []);
  const update = (index: number, patch: Partial<ScheduleInput>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const fetchRegistrar = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    setSource([]);
    setRoom("");
    try {
      const response = await apiRequest<RegistrarSlot[]>(
        `/api/v1/places/registrar-timetable?academicYear=${year}&semester=${semester}`,
      );
      setSource(response.data);
      setNotice(
        response.data.length
          ? `พบ ${response.data.length} ช่วงสอน เลือกชื่อห้องจากทะเบียนเพื่อจับคู่กับห้องนี้`
          : "ไม่พบตารางรายวิชาวิทย์คอมในปีและภาคเรียนที่เลือก สามารถกรอกเองได้",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ดึงตารางไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  const importRoom = async () => {
    if (!from || !until || from > until) {
      setError("กรุณากำหนดวันเริ่มและสิ้นสุดภาคเรียนให้ถูกต้อง");
      return;
    }
    setBusy(true);
    setError("");
    const directory = [...teachers];
    try {
      const imported: ScheduleInput[] = [];
      for (const slot of source.filter((row) => row.roomName === room)) {
        for (const name of slot.lecturerNames) {
          let teacher = directory.find(
            (person) => normalizeName(person.nameTh) === normalizeName(name),
          );
          if (!teacher) {
            const hash = await crypto.subtle.digest(
              "SHA-256",
              new TextEncoder().encode(normalizeName(name)),
            );
            const code =
              "REG-CS-" +
              Array.from(new Uint8Array(hash))
                .slice(0, 12)
                .map((byte) => byte.toString(16).padStart(2, "0"))
                .join("");
            teacher = (
              await apiRequest<Lecturer>("/api/v1/lecturers", {
                method: "POST",
                body: JSON.stringify({
                  personCode: code,
                  nameTh: name,
                  personnelType: "TEACHER",
                }),
              })
            ).data;
            directory.push(teacher);
            setTeachers([...directory]);
          }
          imported.push({
            lecturerId: teacher.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            validFrom: from,
            validUntil: until,
            courseName: `${slot.courseCode} ${slot.courseName} (กลุ่ม ${slot.section})`,
          });
        }
      }
      const rows = [...value];
      for (const row of imported)
        if (
          !rows.some((existing) =>
            Object.keys(row).every(
              (key) =>
                existing[key as keyof ScheduleInput] ===
                row[key as keyof ScheduleInput],
            ),
          )
        )
          rows.push(row);
      onChange(rows);
      setNotice(
        "นำเข้าตารางแล้ว ตรวจรายการและกดบันทึกตารางสอน",
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "นำเข้าไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="space-y-4 rounded-xl border border-outline-variant/40 p-4"
      aria-label="จัดการตารางสอน"
    >
      <h3 className="font-bold">อาจารย์และตารางสอนประจำห้อง</h3>
      <p className="text-label-md text-on-surface-variant">
        แสดงอาจารย์ที่กำลังสอนตามเวลาไทย กำหนดช่วงวันที่ให้ตรงกับภาคเรียน
      </p>
      <div className="space-y-3 rounded-lg bg-surface p-3">
        <div className="flex flex-wrap items-end gap-3">
          <label>
            ปีการศึกษา (พ.ศ.)
            <input
              type="number"
              min={2563}
              max={2600}
              value={year}
              onChange={(event) => {
                setYear(Number(event.target.value));
                setSource([]);
                setRoom("");
              }}
              className={inputClass + " block w-28"}
            />
          </label>
          <label>
            ภาคเรียน
            <select
              value={semester}
              onChange={(event) => {
                setSemester(Number(event.target.value));
                setSource([]);
                setRoom("");
              }}
              className={inputClass + " block"}
            >
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={secondaryButtonClass}
            disabled={busy}
            onClick={() => void fetchRegistrar()}
          >
            {busy ? "กำลังดำเนินการ…" : "ดึงตารางสอนวิทย์คอมจากทะเบียน"}
          </button>
        </div>
        <p className="text-label-md">
          เฉพาะรายวิชา 10301 ของวิทย์คอม วิทยาเขตเชียงใหม่{" "}
          <a
            className="underline"
            href="https://reg.mju.ac.th/registrar/class_info.asp"
            target="_blank"
            rel="noreferrer"
          >
            ดูเว็บทะเบียน
          </a>
        </p>
        {source.length > 0 && (
          <>
            <label className="block">
              ชื่อห้องจากทะเบียน
              <select
                className={inputClass + " mt-1 w-full"}
                value={room}
                onChange={(event) => setRoom(event.target.value)}
              >
                <option value="">เลือกห้องที่จะนำเข้ามาห้องนี้</option>
                {[...new Set(source.map((row) => row.roomName))]
                  .sort()
                  .map((name) => (
                    <option key={name}>{name}</option>
                  ))}
              </select>
            </label>
            {room && (
              <ul className="space-y-1 text-label-md">
                {source
                  .filter((row) => row.roomName === room)
                  .map((row, index) => (
                    <li key={index}>
                      {dayLabels[row.dayOfWeek]} {row.startTime}–{row.endTime} ·{" "}
                      {row.courseCode} {row.courseName} ·{" "}
                      {row.lecturerNames.join(", ")}
                    </li>
                  ))}
              </ul>
            )}
            <div className="flex flex-wrap items-end gap-3">
              <label>
                เริ่มใช้ตาราง
                <input
                  type="date"
                  className={inputClass + " block"}
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                />
              </label>
              <label>
                สิ้นสุด
                <input
                  type="date"
                  className={inputClass + " block"}
                  value={until}
                  onChange={(event) => setUntil(event.target.value)}
                />
              </label>
              <button
                type="button"
                disabled={busy || !room}
                className={secondaryButtonClass}
                onClick={() => void importRoom()}
              >
                นำเข้าตารางของห้องที่เลือก
              </button>
            </div>
            <p className="text-label-md text-on-surface-variant">
              อาจารย์ที่ยังไม่มีในระบบจะถูกเพิ่มในรายชื่อบุคลากรเมื่อกดนำเข้า
            </p>
          </>
        )}
        {notice && (
          <p role="status" className="text-label-md">
            {notice}
          </p>
        )}
      </div>
      {error && (
        <p role="alert" className="text-error">
          {error}
        </p>
      )}
      {value.map((row, index) => (
        <div
          key={index}
          className="grid gap-3 rounded-lg border border-outline-variant/40 p-3 md:grid-cols-2"
        >
          <label>
            อาจารย์
            <select
              required
              className={inputClass + " block w-full"}
              value={row.lecturerId}
              onChange={(event) =>
                update(index, { lecturerId: event.target.value })
              }
            >
              <option value="">เลือกอาจารย์</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.nameTh}
                </option>
              ))}
            </select>
          </label>
          <label>
            วิชา
            <input
              required
              maxLength={150}
              className={inputClass + " block w-full"}
              value={row.courseName}
              onChange={(event) =>
                update(index, { courseName: event.target.value })
              }
            />
          </label>
          <label>
            วัน
            <select
              className={inputClass + " block w-full"}
              value={row.dayOfWeek}
              onChange={(event) =>
                update(index, { dayOfWeek: Number(event.target.value) })
              }
            >
              {dayLabels.map((name, day) => (
                <option key={day} value={day}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <label>
              เริ่ม
              <input
                required
                type="time"
                className={inputClass + " block w-full"}
                value={row.startTime}
                onChange={(event) =>
                  update(index, { startTime: event.target.value })
                }
              />
            </label>
            <label>
              สิ้นสุด
              <input
                required
                type="time"
                className={inputClass + " block w-full"}
                value={row.endTime}
                onChange={(event) =>
                  update(index, { endTime: event.target.value })
                }
              />
            </label>
          </div>
          <label>
            เริ่มใช้ตาราง
            <input
              required
              type="date"
              className={inputClass + " block w-full"}
              value={row.validFrom}
              onChange={(event) =>
                update(index, { validFrom: event.target.value })
              }
            />
          </label>
          <label>
            สิ้นสุด
            <input
              required
              type="date"
              className={inputClass + " block w-full"}
              value={row.validUntil}
              onChange={(event) =>
                update(index, { validUntil: event.target.value })
              }
            />
          </label>
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
          >
            ลบช่วงสอน {index + 1}
          </button>
        </div>
      ))}
      <button
        type="button"
        className={secondaryButtonClass}
        onClick={() =>
          onChange([
            ...value,
            {
              lecturerId: "",
              courseName: "",
              dayOfWeek: 1,
              startTime: "09:00",
              endTime: "12:00",
              validFrom: from,
              validUntil: until,
            },
          ])
        }
      >
        เพิ่มช่วงสอนเอง
      </button>
      {!teachers.length && (
        <p className="text-label-md">
          เพิ่มอาจารย์ในส่วนบุคลากรและห้องทำงาน หรือใช้ปุ่มนำเข้าจากทะเบียน
        </p>
      )}
    </section>
  );
}
