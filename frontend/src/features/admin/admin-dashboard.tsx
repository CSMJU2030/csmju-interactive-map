'use client';

import { Beaker, BookOpen, Building, LoaderCircle, MapPin, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { StatusBadge } from '@/components/common/status-badge';
import { apiRequest, ApiError } from '@/lib/api';
import { categoryLabels } from '@/lib/categories';
import { defaultMapLayout } from '@/lib/map-layout';
import type { CurrentUser, DashboardStats, MapLayout, Place } from '@/types/api';
import { BulkLayoutEditor } from './bulk-layout-editor';
import { LecturerManager } from './lecturer-manager';
import { PlaceForm } from './place-form';

export function AdminDashboard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [layoutPlaces, setLayoutPlaces] = useState<Place[]>([]);
  const [mapLayout, setMapLayout] = useState<MapLayout>(defaultMapLayout);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Place | null | undefined>(undefined);
  const [deletingPlace, setDeletingPlace] = useState<Place | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (query.trim()) params.set('q', query.trim());
      const allPlacesRequest = apiRequest<Place[]>('/api/v1/places/admin-list?limit=100');
      const placeListRequest = query.trim()
        ? apiRequest<Place[]>(`/api/v1/places/admin-list?${params}`)
        : allPlacesRequest;
      const [me, placeList, dashboard, allPlaces, layout] = await Promise.all([
        apiRequest<CurrentUser>('/api/v1/me'),
        placeListRequest,
        apiRequest<DashboardStats>('/api/v1/places/stats'),
        allPlacesRequest,
        apiRequest<MapLayout>('/api/v1/places/layout-config'),
      ]);
      setUser(me.data);
      setPlaces(placeList.data);
      setLayoutPlaces(allPlaces.data);
      setMapLayout(layout.data);
      setStats(dashboard.data);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'ไม่สามารถโหลดข้อมูลผู้ดูแลได้');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void load(), query ? 200 : 0);
    return () => clearTimeout(timeout);
  }, [load, query]);

  const confirmDelete = async () => {
    if (!deletingPlace) return;
    setIsDeleting(true);
    try {
      await apiRequest<{ id: string }>(`/api/v1/places/${deletingPlace.id}`, { method: 'DELETE' });
      setDeletingPlace(null);
      await load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'ลบสถานที่ไม่สำเร็จ');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !user) {
    return <div className="card flex min-h-72 items-center justify-center gap-3 p-8 text-slate-500"><LoaderCircle className="animate-spin" /> กำลังตรวจสอบสิทธิ์...</div>;
  }

  if (error && !user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h2 className="font-bold">ไม่สามารถเข้าหน้าผู้ดูแลได้</h2>
        <p className="mt-2">{error}</p>
        <p className="mt-3 text-sm">เข้าสู่ระบบผ่าน Core Hub และใช้บัญชีที่มีสิทธิ์จัดการแผนที่</p>
      </div>
    );
  }

  const cards = [
    { label: 'สถานที่ทั้งหมด', value: stats?.totalPlaces ?? 0, icon: MapPin, color: 'bg-blue-50 text-blue-700' },
    { label: 'ห้องเรียน', value: stats?.totalClassrooms ?? 0, icon: BookOpen, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'ห้อง Lab', value: stats?.totalLabs ?? 0, icon: Beaker, color: 'bg-teal-50 text-teal-700' },
    { label: 'ห้องพักอาจารย์', value: stats?.totalLecturerOffices ?? 0, icon: Users, color: 'bg-purple-50 text-purple-700' },
    { label: 'เปิดใช้งาน', value: stats?.totalActive ?? 0, icon: Building, color: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-sm font-semibold text-brand-700">ADMIN PANEL</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 md:text-3xl">จัดการแผนที่</h1>
          <p className="mt-2 text-slate-500">เข้าสู่ระบบในสิทธิ์ {user?.subsystemRole.toLowerCase()} · {user?.email}</p>
        </header>
        <button className="button-primary" onClick={() => setEditing(null)}>
          <Plus size={19} /> เพิ่มสถานที่
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${card.color}`}><card.icon size={20} /></span>
            <p className="mt-4 text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.label}</p>
          </div>
        ))}
      </section>

      <BulkLayoutEditor places={layoutPlaces} mapLayout={mapLayout} onSaved={load} />

      <section id="manage-locations" className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 md:p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">รายการสถานที่</h2>
            <p className="text-sm text-slate-500">ข้อมูลตำแหน่งทั้งหมด รวมรายการที่ปิดใช้งาน</p>
          </div>
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">ค้นหาสถานที่ในหน้าจัดการ</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="control w-full pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาสถานที่..." />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">ชื่อสถานที่</th>
                <th className="px-5 py-3 font-semibold">รหัสห้อง</th>
                <th className="px-5 py-3 font-semibold">ประเภท</th>
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 text-right font-semibold">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {places.map((place) => (
                <tr key={place.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4"><span className="font-semibold text-slate-800">{place.nameTh}</span><span className="block text-xs text-slate-400">X {place.positionX}, Y {place.positionY}</span></td>
                  <td className="px-5 py-4 text-slate-600">{place.roomCode ?? '—'}</td>
                  <td className="px-5 py-4 text-slate-600">{categoryLabels[place.category]}</td>
                  <td className="px-5 py-4"><StatusBadge active={place.isActive} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(place)} className="rounded-lg p-2 text-brand-700 hover:bg-brand-50" aria-label={`แก้ไข ${place.nameTh}`}><Pencil size={18} /></button>
                      {user?.subsystemRole === 'ADMIN' && (
                        <button type="button" onClick={() => setDeletingPlace(place)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`ลบ ${place.nameTh}`}><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {user && <LecturerManager places={layoutPlaces} userRole={user.subsystemRole} />}

      <section id="settings" className="card p-5">
        <h2 className="font-bold text-slate-900">การตั้งค่า Integration</h2>
        <p className="mt-1 text-sm text-slate-500">สิทธิ์มาจากบัญชี Core Hub เจ้าหน้าที่แก้ไขแผนที่ได้ และผู้ดูแลลบรายการได้</p>
      </section>

      {editing !== undefined && (
        <PlaceForm
          place={editing}
          places={layoutPlaces}
          mapLayout={mapLayout}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            void load();
          }}
        />
      )}

      {deletingPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4">
            <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
              ยืนยันการลบสถานที่
            </h3>
            <p className="text-sm text-slate-600">
              ต้องการลบสถานที่ <strong>&ldquo;{deletingPlace.nameTh}&rdquo;</strong> หรือไม่? ข้อมูลตำแหน่งและรายละเอียดของสถานที่นี้จะถูกลบออกจากระบบอย่างถาวร
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingPlace(null)}
                className="button-secondary"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void confirmDelete()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'กำลังลบ...' : 'ลบสถานที่'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
