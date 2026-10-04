"use client";

import { cardClass, inputClass, primaryButtonClass } from "@/csmju";
import {
  SchoolIcon as Beaker,
  MenuBookIcon as BookOpen,
  MeetingRoomIcon as Building,
  LocationIcon as MapPin,
  EditIcon as Pencil,
  AddIcon as Plus,
  SearchIcon as Search,
  DeleteIcon as Trash2,
  GroupIcon as Users,
} from "@/csmju";
import { useCallback, useEffect, useState } from "react";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  Pagination,
  SuccessToast,
} from "@/components/common/ui-feedback";
import { DeleteDialog } from "@/components/common/accessible-modal";
import { StatusBadge } from "@/components/common/status-badge";
import { apiRequest } from "@/lib/api";
import { categoryLabels } from "@/lib/categories";
import { defaultMapLayout } from "@/lib/map-layout";
import type {
  CurrentUser,
  DashboardStats,
  MapLayout,
  Place,
} from "@/types/api";
import { BulkLayoutEditor } from "./bulk-layout-editor";
import { LecturerManager } from "./lecturer-manager";
import { PlaceForm } from "./place-form";

export function AdminDashboard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [layoutPlaces, setLayoutPlaces] = useState<Place[]>([]);
  const [mapLayout, setMapLayout] = useState<MapLayout>(defaultMapLayout);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<Place | null | undefined>(undefined);
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: "20", page: String(page) });
      if (query.trim()) params.set("q", query.trim());
      const allPlacesRequest = (async () => {
        const data: Place[] = [];
        let current = 1;
        let pages = 1;
        do {
          const result = await apiRequest<Place[]>(
            "/api/v1/places/admin-list?limit=100&page=" + current,
          );
          data.push(...result.data);
          pages = result.meta?.totalPages ?? 1;
          current++;
        } while (current <= pages);
        return { data };
      })();
      const placeListRequest = apiRequest<Place[]>(
        "/api/v1/places/admin-list?" + params.toString(),
      );
      const [me, placeList, dashboard, allPlaces, layout] = await Promise.all([
        apiRequest<CurrentUser>("/api/v1/me"),
        placeListRequest,
        apiRequest<DashboardStats>("/api/v1/places/stats"),
        allPlacesRequest,
        apiRequest<MapLayout>("/api/v1/places/layout-config"),
      ]);
      setUser(me.data);
      setPlaces(placeList.data);
      setTotalPages(placeList.meta?.totalPages ?? 1);
      setLayoutPlaces((current) =>
        JSON.stringify(current) === JSON.stringify(allPlaces.data)
          ? current
          : allPlaces.data,
      );
      setMapLayout((current) =>
        JSON.stringify(current) === JSON.stringify(layout.data)
          ? current
          : layout.data,
      );
      setStats(dashboard.data);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), query ? 200 : 0);
    return () => clearTimeout(timeout);
  }, [load, query]);

  const confirmDelete = async () => {
    if (!deletingPlace) return;
    setIsDeleting(true);
    try {
      await apiRequest<{ id: string }>(`/api/v1/places/${deletingPlace.id}`, {
        method: "DELETE",
      });
      setDeletingPlace(null);
      await load();
    } catch (caught) {
      setError(caught);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !user) {
    return <LoadingState />;
  }

  if (error && !user)
    return <ErrorState error={error} onRetry={() => void load()} />;

  const cards = [
    {
      label: "สถานที่ทั้งหมด",
      value: stats?.totalPlaces ?? 0,
      icon: MapPin,
      color: "bg-primary-container/10 text-primary-container",
    },
    {
      label: "ห้องเรียน",
      value: stats?.totalClassrooms ?? 0,
      icon: BookOpen,
      color: "bg-primary-container/10 text-primary-container",
    },
    {
      label: "ห้อง Lab",
      value: stats?.totalLabs ?? 0,
      icon: Beaker,
      color: "bg-primary-container/10 text-primary-container",
    },
    {
      label: "ห้องพักอาจารย์",
      value: stats?.totalLecturerOffices ?? 0,
      icon: Users,
      color: "bg-primary-container/10 text-primary-container",
    },
    {
      label: "เปิดใช้งาน",
      value: stats?.totalActive ?? 0,
      icon: Building,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-label-md font-semibold text-primary-container">
            ADMIN PANEL
          </p>
          <h1 className="mt-1 font-display text-headline-md text-on-surface md:text-headline-lg">
            จัดการแผนที่
          </h1>
          <p className="mt-2 text-on-surface-variant">
            เข้าสู่ระบบในสิทธิ์ {user?.subsystemRole.toLowerCase()} ·{" "}
            {user?.email}
          </p>
        </header>
        <button
          className={`${primaryButtonClass}`}
          onClick={() => setEditing(null)}
        >
          <Plus width={20} height={20} aria-hidden="true" /> เพิ่มสถานที่
        </button>
      </div>

      {Boolean(error) && (
        <ErrorState error={error} onRetry={() => void load()} />
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className={`${cardClass} p-5`}>
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl ${card.color}`}
            >
              <card.icon width={20} height={20} aria-hidden="true" />
            </span>
            <p className="mt-4 font-display text-headline-md tabular-nums text-on-surface">
              {card.value}
            </p>
            <p className="mt-1 text-label-md text-on-surface-variant">
              {card.label}
            </p>
          </div>
        ))}
      </section>

      <BulkLayoutEditor
        places={layoutPlaces}
        mapLayout={mapLayout}
        onSaved={load}
      />

      <section id="manage-locations" className={`${cardClass} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 p-4 md:p-5">
          <div>
            <h2 className="text-lg font-bold text-on-surface">รายการสถานที่</h2>
            <p className="text-label-md text-on-surface-variant">
              ข้อมูลตำแหน่งทั้งหมด รวมรายการที่ปิดใช้งาน
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="block pb-2 text-label-md">
              ค้นหาสถานที่ในหน้าจัดการ
            </span>
            <Search
              className="absolute left-3 bottom-3 text-on-surface-variant"
              width={20}
              height={20}
              aria-hidden="true"
            />
            <input
              className={`${inputClass} w-full pl-10`}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาสถานที่..."
            />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-label-md">
            <thead className="bg-surface text-on-surface-variant">
              <tr>
                <th className="px-5 py-3 font-semibold">ชื่อสถานที่</th>
                <th className="px-5 py-3 font-semibold">รหัสห้อง</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-surface">
                  <td className="px-5 py-4">
                    <span className="font-semibold text-on-surface">
                      {place.nameTh}
                    </span>
                    <span className="block text-caption text-on-surface-variant">
                      X {place.positionX}, Y {place.positionY}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">
                    {place.roomCode ?? "—"}
                  </td>
                  <td className="px-5 py-4 text-on-surface-variant">
                    {categoryLabels[place.category]}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge active={place.isActive} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setEditing(place)}
                        className="rounded-lg p-2 text-primary-container hover:bg-primary-container/10"
                        aria-label={`แก้ไข ${place.nameTh}`}
                      >
                        <Pencil width={20} height={20} aria-hidden="true" />
                      </button>
                      {user?.subsystemRole === "ADMIN" && (
                        <button
                          type="button"
                          onClick={() => setDeletingPlace(place)}
                          className="rounded-lg p-2 text-on-error-container hover:bg-error-container"
                          aria-label={`ลบ ${place.nameTh}`}
                        >
                          <Trash2 width={20} height={20} aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!places.length && (
          <EmptyState
            search={Boolean(query)}
            onClear={() => {
              setQuery("");
              setPage(1);
            }}
          />
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>

      {user && (
        <LecturerManager places={layoutPlaces} userRole={user.subsystemRole} />
      )}

      <section id="settings" className={`${cardClass} p-5`}>
        <h2 className="font-bold text-on-surface">การตั้งค่า Integration</h2>
        <p className="mt-1 text-label-md text-on-surface-variant">
          สิทธิ์มาจากบัญชี Core Hub เจ้าหน้าที่แก้ไขแผนที่ได้
          และผู้ดูแลลบรายการได้
        </p>
      </section>

      {editing !== undefined && (
        <PlaceForm
          place={editing}
          places={layoutPlaces}
          mapLayout={mapLayout}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setToast(
              "บันทึกข้อมูลสำเร็จ " +
                new Date().toLocaleTimeString("th-TH", {
                  timeZone: "Asia/Bangkok",
                }),
            );
            setEditing(undefined);
            void load();
          }}
        />
      )}

      {deletingPlace && (
        <DeleteDialog
          title="ลบสถานที่"
          message={
            <>ลบสถานที่ «{deletingPlace.nameTh}»? ข้อมูลตำแหน่งจะถูกลบถาวร</>
          }
          blockedReason={isDeleting ? "กำลังลบ กรุณารอสักครู่" : undefined}
          onClose={() => {
            if (!isDeleting) setDeletingPlace(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}

      {toast && <SuccessToast key={toast} message={toast} />}
    </div>
  );
}
