"use client";
import {
  cardClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/csmju";
import {
  MoreHorizIcon as LoaderCircle,
  EditIcon as Pencil,
  AddIcon as Plus,
  DeleteIcon as Trash2,
  PersonIcon as UserRoundCog,
} from "@/csmju";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  LoadingState,
  EmptyState,
  Pagination,
  SuccessToast,
} from "@/components/common/ui-feedback";
import { DeleteDialog } from "@/components/common/accessible-modal";
import { apiRequest } from "@/lib/api";
import type { Lecturer, Place, CurrentUser } from "@/types/api";
export function LecturerManager({
  places,
  userRole,
}: {
  places: Place[];
  userRole: CurrentUser["subsystemRole"];
}) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    personCode: "",
    nameTh: "",
    nameEn: "",
    email: "",
    personnelType: "TEACHER",
    positionAcademic: "",
    positionManager: "",
    placeId: "",
  });
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (showForm) {
      formRef.current?.scrollIntoView({ block: "start" });
      formRef.current?.focus({ preventScroll: true });
    }
  }, [showForm, editingId]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listPage, setListPage] = useState(1);
  const [listPages, setListPages] = useState(1);
  const [deleting, setDeleting] = useState<Lecturer | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState("");
  const [importing, setImporting] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiRequest<Lecturer[]>(
        "/api/v1/lecturers?limit=20&page=" + listPage,
      );
      setLecturers(response.data);
      setListPages(response.meta?.totalPages ?? 1);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "โหลดข้อมูลไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  }, [listPage]);
  const importCsmju = async () => {
    setImporting(true);
    setError("");
    try {
      const response = await apiRequest<{
        created: number;
        updated: number;
        skipped: string[];
      }>("/api/v1/lecturers/import-csmju", { method: "POST" });
      setToast(
        `ดึงข้อมูลสำเร็จ: เพิ่ม ${response.data.created} คน อัปเดต ${response.data.updated} คน`,
      );
      await load();
      if (response.data.skipped.length)
        setError(
          "กรุณาตรวจการจับคู่บุคลากร: " + response.data.skipped.join(", "),
        );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ดึงข้อมูลไม่สำเร็จ");
    } finally {
      setImporting(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load, places]);
  const edit = (person: Lecturer | null) => {
    setEditingId(person?.id ?? null);
    setDraft({
      personCode: person?.personCode ?? "",
      nameTh: person?.nameTh ?? "",
      nameEn: person?.nameEn ?? "",
      email: person?.email ?? "",
      personnelType: person?.personnelType ?? "TEACHER",
      positionAcademic: person?.positionAcademic ?? "",
      positionManager: person?.positionManager ?? "",
      placeId: person?.placeId ?? "",
    });
    setShowForm(true);
    setError("");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await apiRequest<Lecturer>(
        editingId ? "/api/v1/lecturers/" + editingId : "/api/v1/lecturers",
        {
          method: editingId ? "PATCH" : "POST",
          body: JSON.stringify({
            ...draft,
            email: draft.email.trim() || null,
            placeId: draft.placeId || null,
          }),
        },
      );
      setShowForm(false);
      setToast(
        "บันทึกข้อมูลสำเร็จ " +
          new Date().toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }),
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };
  const remove = async (person: Lecturer) => {
    setRemoving(true);
    try {
      await apiRequest("/api/v1/lecturers/" + person.id, { method: "DELETE" });
      setDeleting(null);
      setToast(
        "ลบข้อมูลสำเร็จ " +
          new Date().toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }),
      );
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "ลบไม่สำเร็จ");
    } finally {
      setRemoving(false);
    }
  };
  return (
    <div className="space-y-8">
      <section id="manage-lecturers" className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 p-5">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <UserRoundCog width={20} height={20} aria-hidden="true" />
              บุคลากรและห้องทำงาน
            </h2>
            <p className="text-label-md text-on-surface-variant">
              เพิ่มหรือแก้ไขบุคลากร แล้วกำหนดห้องทำงานบนแผนที่
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={importing || saving}
              onClick={() => void importCsmju()}
              className={`${secondaryButtonClass} disabled:opacity-50`}
            >
              {importing ? "กำลังดึงข้อมูล…" : "ดึงข้อมูลจากเว็บสาขา"}
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass}`}
              onClick={() => edit(null)}
            >
              <Plus width={20} height={20} aria-hidden="true" />
              เพิ่มบุคลากร
            </button>
          </div>
        </div>
        {error && (
          <p
            role="alert"
            className="m-4 rounded-xl bg-error-container p-3 text-on-error-container"
          >
            {error}
          </p>
        )}
        {loading ? (
          <LoadingState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-label-md">
              <thead className="bg-surface">
                <tr>
                  <th className="p-4">บุคลากร</th>
                  <th className="p-4">ห้องทำงาน</th>
                  <th className="p-4">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {lecturers.map((person) => (
                  <tr
                    key={person.id}
                    className="border-t border-outline-variant/40"
                  >
                    <td className="p-4">
                      {person.nameTh}
                      <span className="block text-caption text-on-surface-variant">
                        {person.personCode}
                      </span>
                    </td>
                    <td className="p-4">
                      {person.place?.nameTh ?? "ยังไม่กำหนด"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={`${secondaryButtonClass}`}
                          onClick={() => edit(person)}
                          aria-label={"แก้ไขห้องของ " + person.nameTh}
                        >
                          <Pencil width={20} height={20} aria-hidden="true" />
                        </button>
                        {userRole === "ADMIN" && (
                          <button
                            type="button"
                            className={`${secondaryButtonClass}`}
                            onClick={() => setDeleting(person)}
                            aria-label={"ลบการกำหนดห้องของ " + person.nameTh}
                          >
                            <Trash2 width={20} height={20} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!lecturers.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="p-6 text-center text-on-surface-variant"
                    >
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination
          page={listPage}
          totalPages={listPages}
          onChange={setListPage}
        />
      </section>
      {showForm && (
        <form
          ref={formRef}
          tabIndex={-1}
          aria-label="แก้ไขข้อมูลบุคลากรและห้องทำงาน"
          onSubmit={(event) => void submit(event)}
          className={`${cardClass} scroll-mt-24 space-y-4 p-5 outline-none`}
        >
          <div className="border-b border-outline-variant/40 pb-4">
            <h2 className="text-lg font-bold">
              {editingId
                ? "แก้ไขบุคลากรและห้องทำงาน"
                : "เพิ่มบุคลากรและห้องทำงาน"}
            </h2>
            <p className="mt-1 text-label-md text-on-surface-variant">
              {editingId
                ? draft.nameTh
                : "กรอกข้อมูลบุคลากรและเลือกห้องบนแผนที่"}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                { key: "personCode", label: "รหัสบุคลากร", required: true },
                { key: "nameTh", label: "ชื่อบุคลากร", required: true },
                { key: "nameEn", label: "ชื่อภาษาอังกฤษ" },
                { key: "email", label: "อีเมล" },
                { key: "positionAcademic", label: "ตำแหน่งวิชาการ" },
                { key: "positionManager", label: "ตำแหน่งงาน" },
              ] as const
            ).map((field) => (
              <label key={field.key} className="block">
                {field.label}
                <input
                  required={"required" in field}
                  type={field.key === "email" ? "email" : "text"}
                  maxLength={
                    field.key === "personCode"
                      ? 100
                      : field.key === "email"
                        ? 254
                        : 150
                  }
                  className={inputClass + " mt-1 w-full"}
                  value={draft[field.key]}
                  onChange={(event) =>
                    setDraft({ ...draft, [field.key]: event.target.value })
                  }
                />
              </label>
            ))}
            <label className="block">
              ประเภทบุคลากร
              <select
                className={inputClass + " mt-1 w-full"}
                value={draft.personnelType}
                onChange={(event) =>
                  setDraft({ ...draft, personnelType: event.target.value })
                }
              >
                <option value="TEACHER">อาจารย์</option>
                <option value="STAFF">เจ้าหน้าที่</option>
              </select>
            </label>
          </div>
          <label className="block">
            ห้องทำงาน
            <select
              className={`${inputClass} mt-1 w-full`}
              value={draft.placeId}
              onChange={(event) =>
                setDraft({ ...draft, placeId: event.target.value })
              }
            >
              <option value="">ยังไม่กำหนด</option>
              {places
                .filter((place) => place.isActive)
                .map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.roomCode} — {place.nameTh}
                  </option>
                ))}
            </select>
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              className={`${primaryButtonClass}`}
              aria-busy={saving}
              title={
                saving
                  ? "กำลังบันทึก กรุณารอสักครู่"
                  : !draft.personCode
                    ? "กรุณาเลือกบุคลากรก่อนบันทึก"
                    : undefined
              }
              disabled={
                saving || !draft.personCode.trim() || !draft.nameTh.trim()
              }
            >
              {saving && (
                <LoaderCircle
                  width={20}
                  height={20}
                  aria-hidden="true"
                  className="animate-pulse motion-reduce:animate-none"
                />
              )}
              บันทึกการกำหนดห้อง
            </button>
            <button
              type="button"
              className={`${secondaryButtonClass}`}
              onClick={() => setShowForm(false)}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
      {deleting && (
        <DeleteDialog
          title="ลบการกำหนดห้อง"
          message={"ลบการกำหนดห้องของ " + deleting.nameTh + "?"}
          blockedReason={removing ? "กำลังลบ กรุณารอสักครู่" : undefined}
          onClose={() => {
            if (!removing) setDeleting(null);
          }}
          onConfirm={() => void remove(deleting)}
        />
      )}
      {toast && <SuccessToast key={toast} message={toast} />}
    </div>
  );
}
