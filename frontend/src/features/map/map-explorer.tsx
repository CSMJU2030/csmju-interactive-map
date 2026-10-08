"use client";

import { cardClass, inputClass } from "@/csmju";
import {
  SettingsIcon as Filter,
  DescriptionIcon as List,
  MoreHorizIcon as LoaderCircle,
  LocationIcon as MapPin,
  SearchIcon as Search,
  CloseIcon as X,
} from "@/csmju";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { InteractiveSvgMap } from "@/components/map/interactive-svg-map";
import { PlaceDetailPanel } from "@/components/map/place-detail-panel";
import {
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/common/ui-feedback";
import { apiRequest } from "@/lib/api";
import { categoryLabels } from "@/lib/categories";
import { defaultMapLayout } from "@/lib/map-layout";
import { useBrowserLocation } from "@/lib/browser-location";
import type { MapLayout, Place, PlaceCategory } from "@/types/api";

type CategoryFilter = "ALL" | PlaceCategory;

const filters: Array<{ value: CategoryFilter; label: string }> = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "CLASSROOM", label: "ห้องเรียน" },
  { value: "COMPUTER_LAB", label: "ห้องปฏิบัติการ" },
  { value: "LECTURER_OFFICE", label: "ห้องพักอาจารย์" },
  { value: "DEPARTMENT_OFFICE", label: "สำนักงาน" },
  { value: "RESTROOM", label: "ห้องน้ำ" },
  { value: "FACILITY", label: "ลิฟต์ / สิ่งอำนวยความสะดวก" },
  { value: "STUDENT_CLUB", label: "ห้องชมรม" },
  { value: "STORAGE", label: "ห้องเก็บของ" },
  { value: "OTHER", label: "อื่น ๆ" },
];

export function MapExplorer() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapLayout, setMapLayout] = useState<MapLayout>(defaultMapLayout);
  const location = useBrowserLocation();
  const [queryOverride, setQuery] = useState<string | null>(null);
  const query = queryOverride ?? (location ? new URL(location).searchParams.get("q") ?? "" : "");
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [selected, setSelected] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const loadPlaces = useCallback(async (search: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (search.trim()) params.set("q", search.trim());
      const [response, layout] = await Promise.all([
        apiRequest<Place[]>(`/api/v1/places?${params}`),
        apiRequest<MapLayout>("/api/v1/places/layout-config"),
      ]);
      const all = [...response.data];
      for (let page = 2; page <= (response.meta?.totalPages ?? 1); page++) {
        params.set("page", String(page));
        const next = await apiRequest<Place[]>(
          "/api/v1/places?" + params.toString(),
        );
        all.push(...next.data);
      }
      setPlaces(all);
      setMapLayout(layout.data);
    } catch (caught) {
      setError(caught);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => void loadPlaces(query),
      query ? 250 : 0,
    );
    return () => window.clearTimeout(timeout);
  }, [loadPlaces, query]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const original =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input,select,a[href]",
        ) ?? [],
      );
    if (drawerOpen) focusable()[0]?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        const list = focusable();
        const first = list[0];
        const last = list.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
      if (event.key === "Escape") setDrawerOpen(false);
    };
    if (drawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (drawerOpen) original?.focus();
    };
  }, [drawerOpen]);

  const availableFilters = useMemo(() => {
    const availableCategories = new Set(places.map((place) => place.category));
    return filters.filter(
      (filter) =>
        filter.value === "ALL" || availableCategories.has(filter.value),
    );
  }, [places]);

  const [filterSource, setFilterSource] = useState(places);
  if (filterSource !== places) {
    setFilterSource(places);
    if (
      category !== "ALL" &&
      !places.some((place) => place.category === category)
    ) {
      setCategory("ALL");
      setSelected(null);
    }
  }

  const filteredPlaces = useMemo(
    () =>
      places.filter(
        (place) => category === "ALL" || place.category === category,
      ),
    [category, places],
  );

  const choosePlace = (place: Place) => {
    setSelected(place);
    setSearchOpen(false);
    mapRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "center",
    });
  };

  return (
    <div className="min-w-0 space-y-8">
      <div inert={drawerOpen} className="min-w-0 space-y-8">
        <section className={`${cardClass} p-4 md:p-6`}>
          <label htmlFor="map-search" className="mb-2 block text-label-md">
            ค้นหาห้อง สถานที่ หรืออาจารย์
          </label>
          <div className="relative max-w-3xl">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
              width={20}
              height={20}
              aria-hidden="true"
            />
            <input
              id="map-search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="ค้นหาห้อง สถานที่ หรืออาจารย์..."
              className={`${inputClass} h-13 w-full pl-12 pr-12 text-base`}
              aria-label="ค้นหาห้อง สถานที่ หรืออาจารย์"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setSelected(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-on-surface-variant hover:bg-surface"
                aria-label="ล้างคำค้นหา"
              >
                <X width={20} height={20} aria-hidden="true" />
              </button>
            )}
            {searchOpen && query && (
              <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-outline-variant/40 bg-white p-2 shadow-lg">
                {loading ? (
                  <div className="flex items-center gap-2 p-4 text-on-surface-variant">
                    <LoaderCircle
                      className="animate-pulse motion-reduce:animate-none"
                      width={20}
                      height={20}
                      aria-hidden="true"
                    />{" "}
                    กำลังค้นหา...
                  </div>
                ) : filteredPlaces.length ? (
                  filteredPlaces.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => choosePlace(place)}
                      className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-primary-container/10"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-container/10 text-primary-container">
                        <MapPin width={20} height={20} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block break-words font-semibold text-on-surface">
                          {place.nameTh}
                        </span>
                        <span className="block text-caption text-on-surface-variant">
                          {place.roomCode ?? "ไม่มีรหัส"} ·{" "}
                          {categoryLabels[place.category]}
                          {place.lecturers.length
                            ? ` · ${place.lecturers.map((item) => item.nameTh).join(", ")}`
                            : ""}
                        </span>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-on-surface-variant">
                    ไม่พบห้อง สถานที่ หรืออาจารย์ที่ตรงกับ “{query}”
                  </p>
                )}
              </div>
            )}
          </div>
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3"
            aria-label="ตัวกรองและเมนูสถานที่"
          >
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
              <Filter
                width={20}
                height={20}
                aria-hidden="true"
                className="shrink-0 text-on-surface-variant"
              />
              {availableFilters.map((filter) => (
                <button
                  aria-pressed={category === filter.value}
                  key={filter.value}
                  onClick={() => {
                    setCategory(filter.value);
                    setSelected(null);
                  }}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-label-md font-medium transition ${
                    category === filter.value
                      ? "bg-primary-container text-white"
                      : "border border-outline-variant/40 bg-white text-on-surface-variant hover:border-primary-container hover:text-primary-container"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-container bg-primary-container/10 px-4 py-2 text-label-md font-semibold text-primary-container shadow-sm transition hover:bg-primary-container/10 hover:border-primary-container"
            >
              <List width={20} height={20} aria-hidden="true" />
              <span>เลือกจากรายชื่อ ({filteredPlaces.length})</span>
            </button>
          </div>
        </section>

        {Boolean(error) && (
          <ErrorState error={error} onRetry={() => void loadPlaces(query)} />
        )}
        {loading && <LoadingState />}
        {!loading && !error && !filteredPlaces.length && (
          <EmptyState
            search={Boolean(query || category !== "ALL")}
            onClear={() => {
              setQuery("");
              setCategory("ALL");
            }}
          />
        )}

        <div
          className="grid min-w-0 grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"
          ref={mapRef}
        >
          <div className="min-w-0">
            <InteractiveSvgMap
              places={filteredPlaces}
              mapLayout={mapLayout}
              selectedId={selected?.id ?? null}
              onSelect={choosePlace}
              onResetFocus={() => setSelected(null)}
            />
          </div>

          {selected ? (
            <PlaceDetailPanel
              place={selected}
              onClose={() => setSelected(null)}
            />
          ) : (
            <aside
              className={`${cardClass} grid min-h-48 place-items-center p-6 text-center`}
            >
              <div>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface text-on-surface-variant">
                  <MapPin width={20} height={20} aria-hidden="true" />
                </span>
                <p className="mt-3 font-semibold text-on-surface-variant">
                  เลือกสถานที่บนแผนที่
                </p>
                <p className="mt-1 text-label-md text-on-surface-variant">
                  คลิกห้องบนแผนที่เพื่อดูรายละเอียด
                  หรือค้นหาด้วยชื่อจากช่องด้านบน
                </p>
                <p className="mt-4 text-caption font-medium text-primary-container">
                  กำลังแสดง {filteredPlaces.length} สถานที่
                </p>
              </div>
            </aside>
          )}
        </div>
      </div>
      {/* Slide-Up Places Drawer Backdrop */}
      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
          aria-label="ปิดรายชื่อสถานที่"
          tabIndex={-1}
        />
      )}

      {/* Slide-Up Places Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-4xl transform rounded-t-3xl border-t border-outline-variant/40 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-y-0" : "translate-y-full pointer-events-none"
        }`}
        ref={drawerRef}
        inert={!drawerOpen}
        aria-hidden={!drawerOpen}
        role="dialog"
        aria-modal="true"
        aria-label="รายชื่อสถานที่"
      >
        {/* Pull handle */}
        <button
          type="button"
          className="flex w-full cursor-pointer justify-center pb-1 pt-3"
          onClick={() => setDrawerOpen(false)}
          aria-label="ปิดรายชื่อสถานที่"
        >
          <div className="h-1.5 w-12 rounded-full bg-surface hover:bg-surface transition" />
        </button>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 pb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-on-surface">
              รายชื่อสถานที่
            </h2>
            <span className="rounded-full bg-primary-container/10 px-2.5 py-0.5 text-caption font-semibold text-primary-container">
              {filteredPlaces.length} ห้อง
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl p-2 text-on-surface-variant hover:bg-surface hover:text-on-surface-variant transition"
            aria-label="ปิดแถบสถานที่"
          >
            <X width={20} height={20} aria-hidden="true" />
          </button>
        </div>

        {/* Category filter inside drawer */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-outline-variant/40 bg-surface px-5 py-2.5">
          <Filter
            width={20}
            height={20}
            aria-hidden="true"
            className="shrink-0 text-on-surface-variant mr-1"
          />
          {availableFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCategory(filter.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-caption font-medium transition ${
                category === filter.value
                  ? "bg-primary-container text-white shadow-sm"
                  : "border border-outline-variant/40 bg-white text-on-surface-variant hover:bg-surface"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Scrollable list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
          {loading && !places.length ? (
            <div className="flex items-center justify-center gap-2 py-12 text-on-surface-variant">
              <LoaderCircle
                className="animate-pulse motion-reduce:animate-none"
                width={20}
                height={20}
                aria-hidden="true"
              />{" "}
              กำลังโหลด...
            </div>
          ) : filteredPlaces.length ? (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPlaces.map((place) => {
                const isCurrentSelected = selected?.id === place.id;
                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => {
                      choosePlace(place);
                      setDrawerOpen(false);
                    }}
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                      isCurrentSelected
                        ? "border-primary-container bg-primary-container/10 text-primary-container shadow-sm ring-1 ring-primary-container"
                        : "border-outline-variant/40 bg-white hover:border-primary-container hover:bg-surface"
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isCurrentSelected
                          ? "bg-primary-container text-white"
                          : "bg-primary-container/10 text-primary-container"
                      }`}
                    >
                      <MapPin width={20} height={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-bold text-on-surface">
                          {place.roomCode ?? place.nameTh}
                        </span>
                        <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-caption font-medium text-on-surface-variant">
                          {categoryLabels[place.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 break-words text-caption text-on-surface-variant line-clamp-1">
                        {place.nameTh}
                      </p>
                      {place.lecturers.length > 0 && (
                        <p className="mt-1 truncate text-caption text-on-surface-variant">
                          {place.lecturers
                            .map((item) => item.nameTh)
                            .join(", ")}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-on-surface-variant">
              <p className="text-label-md">ไม่พบสถานที่ในหมวดหมู่นี้</p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface px-5 py-3 text-caption text-on-surface-variant">
          <span>แตะหรือคลิกสถานที่เพื่อให้แผนที่ซูมโฟกัสตำแหน่ง</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="font-semibold text-primary-container hover:underline"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
