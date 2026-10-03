'use client';

import { Filter, List, LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { InteractiveSvgMap } from '@/components/map/interactive-svg-map';
import { PlaceDetailPanel } from '@/components/map/place-detail-panel';
import { apiRequest } from '@/lib/api';
import { categoryLabels } from '@/lib/categories';
import { defaultMapLayout } from '@/lib/map-layout';
import type { MapLayout, Place, PlaceCategory } from '@/types/api';

type CategoryFilter = 'ALL' | PlaceCategory;

const filters: Array<{ value: CategoryFilter; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'CLASSROOM', label: 'ห้องเรียน' },
  { value: 'COMPUTER_LAB', label: 'ห้องปฏิบัติการ' },
  { value: 'LECTURER_OFFICE', label: 'ห้องพักอาจารย์' },
  { value: 'DEPARTMENT_OFFICE', label: 'สำนักงาน' },
  { value: 'RESTROOM', label: 'ห้องน้ำ' },
  { value: 'FACILITY', label: 'ลิฟต์ / สิ่งอำนวยความสะดวก' },
  { value: 'STUDENT_CLUB', label: 'ห้องชมรม' },
  { value: 'STORAGE', label: 'ห้องเก็บของ' },
  { value: 'OTHER', label: 'อื่น ๆ' },
];

export function MapExplorer() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapLayout, setMapLayout] = useState<MapLayout>(defaultMapLayout);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('ALL');
  const [selected, setSelected] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  const loadPlaces = useCallback(async (search: string) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: '1', limit: '100' });
      if (search.trim()) params.set('q', search.trim());
      const [response, layout] = await Promise.all([
        apiRequest<Place[]>(`/api/v1/places?${params}`),
        apiRequest<MapLayout>('/api/v1/places/layout-config'),
      ]);
      setPlaces(response.data);
      setMapLayout(layout.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถโหลดข้อมูลแผนที่ได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadPlaces(query), query ? 250 : 0);
    return () => window.clearTimeout(timeout);
  }, [loadPlaces, query]);

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    if (drawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawerOpen]);

  const availableFilters = useMemo(() => {
    const availableCategories = new Set(places.map((place) => place.category));
    return filters.filter(
      (filter) => filter.value === 'ALL' || availableCategories.has(filter.value),
    );
  }, [places]);

  useEffect(() => {
    if (category !== 'ALL' && !places.some((place) => place.category === category)) {
      setCategory('ALL');
      setSelected(null);
    }
  }, [category, places]);

  const filteredPlaces = useMemo(
    () => places.filter((place) => category === 'ALL' || place.category === category),
    [category, places],
  );

  const choosePlace = (place: Place) => {
    setSelected(place);
    setSearchOpen(false);
    mapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="space-y-5">
      <section className="card p-4 md:p-6">
        <div className="relative max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={21} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            placeholder="ค้นหาห้อง สถานที่ หรืออาจารย์..."
            className="control h-13 w-full pl-12 pr-12 text-base"
            aria-label="ค้นหาห้อง สถานที่ หรืออาจารย์"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSelected(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              aria-label="ล้างคำค้นหา"
            >
              <X size={18} />
            </button>
          )}
          {searchOpen && query && (
            <div className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
              {loading ? (
                <div className="flex items-center gap-2 p-4 text-slate-500">
                  <LoaderCircle className="animate-spin" size={18} /> กำลังค้นหา...
                </div>
              ) : filteredPlaces.length ? (
                filteredPlaces.map((place) => (
                  <button
                    key={place.id}
                    onClick={() => choosePlace(place)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-brand-50"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-700">
                      <MapPin size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block break-words font-semibold text-slate-800">{place.nameTh}</span>
                      <span className="block text-xs text-slate-500">
                        {place.roomCode ?? 'ไม่มีรหัส'} · {categoryLabels[place.category]}
                        {place.lecturers.length ? ` · ${place.lecturers.map((item) => item.nameTh).join(', ')}` : ''}
                      </span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="p-4 text-slate-500">ไม่พบห้อง สถานที่ หรืออาจารย์ที่ตรงกับ “{query}”</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3" aria-label="ตัวกรองและเมนูสถานที่">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            <Filter size={17} className="shrink-0 text-slate-400" />
            {availableFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => {
                  setCategory(filter.value);
                  setSelected(null);
                }}
                className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-medium transition ${
                  category === filter.value
                    ? 'bg-brand-700 text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-brand-100 hover:border-brand-300"
          >
            <List size={17} />
            <span>เลือกจากรายชื่อ ({filteredPlaces.length})</span>
          </button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]" ref={mapRef}>
        <div>
          <InteractiveSvgMap
            places={filteredPlaces}
            mapLayout={mapLayout}
            selectedId={selected?.id ?? null}
            onSelect={choosePlace}
            onResetFocus={() => setSelected(null)}
          />
        </div>

        {selected ? (
          <PlaceDetailPanel place={selected} onClose={() => setSelected(null)} />
        ) : (
          <aside className="card grid min-h-48 place-items-center p-6 text-center">
            <div>
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
                <MapPin size={22} />
              </span>
              <p className="mt-3 font-semibold text-slate-700">เลือกสถานที่บนแผนที่</p>
              <p className="mt-1 text-sm text-slate-500">คลิกห้องบนแผนที่เพื่อดูรายละเอียด หรือค้นหาด้วยชื่อจากช่องด้านบน</p>
              <p className="mt-4 text-xs font-medium text-brand-700">กำลังแสดง {filteredPlaces.length} สถานที่</p>
            </div>
          </aside>
        )}
      </div>

      {/* Slide-Up Places Drawer Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-Up Places Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-4xl transform rounded-t-3xl border-t border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
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
          <div className="h-1.5 w-12 rounded-full bg-slate-300 hover:bg-slate-400 transition" />
        </button>

        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 pb-3 pt-1">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-slate-900">รายชื่อสถานที่</h2>
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              {filteredPlaces.length} ห้อง
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
            aria-label="ปิดแถบสถานที่"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category filter inside drawer */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-slate-50/70 px-5 py-2.5">
          <Filter size={15} className="shrink-0 text-slate-400 mr-1" />
          {availableFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setCategory(filter.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
                category === filter.value
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Scrollable list */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
          {loading && !places.length ? (
            <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
              <LoaderCircle className="animate-spin" size={20} /> กำลังโหลด...
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
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                      isCurrentSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                        isCurrentSelected ? 'bg-brand-600 text-white' : 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      <MapPin size={19} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-bold text-slate-900">
                          {place.roomCode ?? place.nameTh}
                        </span>
                        <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                          {categoryLabels[place.category]}
                        </span>
                      </div>
                      <p className="mt-0.5 break-words text-xs text-slate-600 line-clamp-1">
                        {place.nameTh}
                      </p>
                      {place.lecturers.length > 0 && (
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {place.lecturers.map((item) => item.nameTh).join(', ')}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm">ไม่พบสถานที่ในหมวดหมู่นี้</p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
          <span>แตะหรือคลิกสถานที่เพื่อให้แผนที่ซูมโฟกัสตำแหน่ง</span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="font-semibold text-brand-700 hover:underline"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
