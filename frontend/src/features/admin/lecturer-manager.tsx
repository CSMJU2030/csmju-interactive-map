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
import { FormEvent, useCallback, useEffect, useState } from "react";
import {
  LoadingState,
  EmptyState,
  Pagination,
  SuccessToast,
} from "@/components/common/ui-feedback";
import { DeleteDialog } from "@/components/common/accessible-modal";
import { apiRequest } from "@/lib/api";
import type { Lecturer, Place, CurrentUser } from "@/types/api";
type PersonOption = {
  personCode: string;
  nameTh: string;
  personnelType: string;
};
export function LecturerManager({
  places,
  userRole,
}: {
  places: Place[];
  userRole: CurrentUser["subsystemRole"];
}) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [people, setPeople] = useState<PersonOption[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ personCode: "", placeId: "" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [listPage, setListPage] = useState(1);
  const [listPages, setListPages] = useState(1);
  const [deleting, setDeleting] = useState<Lecturer | null>(null);
  const [removing, setRemoving] = useState(false);
  const [toast, setToast] = useState("");
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
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!showForm) return;
    let active = true;
    const timer = setTimeout(() => {
      void apiRequest<PersonOption[]>(
        "/api/v1/lecturers/core-people?" +
          new URLSearchParams({
            limit: "20",
            page: String(page),
            ...(search ? { q: search } : {}),
          }).toString(),
      )
        .then((response) => {
          if (active) {
            setPeople(response.data);
            setTotalPages(response.meta?.totalPages ?? 0);
          }
        })
        .catch((caught: unknown) => {
          if (active)
            setError(
              caught instanceof Error
                ? caught.message
                : "โหลดบุคลากรจาก Core Hub ไม่สำเร็จ",
            );
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search, page, showForm]);
  const edit = (person: Lecturer | null) => {
    setEditingId(person?.id ?? null);
    setDraft({
      personCode: person?.personCode ?? "",
      placeId: person?.placeId ?? "",
    });
    setSearch("");
    setPage(1);
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
            personCode: draft.personCode,
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
    <section id="manage-lecturers" className={`${cardClass} overflow-hidden`}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 p-5">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <UserRoundCog width={20} height={20} aria-hidden="true" />
            บุคลากรและห้องทำงาน
          </h2>
          <p className="text-label-md text-on-surface-variant">
            เลือกบุคลากรจาก Core Hub แล้วกำหนดห้องบนแผนที่
          </p>
        </div>
        <button
          type="button"
          className={`${secondaryButtonClass}`}
          onClick={() => edit(null)}
        >
          <Plus width={20} height={20} aria-hidden="true" />
          กำหนดห้องบุคลากร
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="m-4 rounded-xl bg-error-container p-3 text-on-error-container"
        >
          {error}
        </p>
      )}
      {showForm && (
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-4 border-b border-outline-variant/40 p-5"
        >
          <label className="block">
            ค้นหาบุคลากรจาก Core Hub
            <input
              className={`${inputClass} mt-1 w-full`}
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="block">
            บุคลากร *
            <select
              required
              aria-required="true"
              className={`${inputClass} mt-1 w-full`}
              value={draft.personCode}
              onChange={(event) =>
                setDraft({ ...draft, personCode: event.target.value })
              }
            >
              <option value="">เลือกบุคลากร</option>
              {draft.personCode &&
                !people.some(
                  (person) => person.personCode === draft.personCode,
                ) && (
                  <option value={draft.personCode}>{draft.personCode}</option>
                )}
              {people.map((person) => (
                <option key={person.personCode} value={person.personCode}>
                  {person.nameTh} — {person.personCode}
                </option>
              ))}
            </select>
          </label>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
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
                .filter((place) => place.roomCode)
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
              disabled={saving || !draft.personCode}
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
    </section>
  );
}
