'use client';

import { MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { categoryLabels } from '@/lib/categories';
import type { Place } from '@/types/api';

export function LocationsView() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams({ limit: '100' });
      if (query) params.set('q', query);
      void apiRequest<Place[]>(`/api/v1/places?${params}`).then(({ data }) => setPlaces(data));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">สถานที่ทั้งหมด</h1>
        <p className="mt-2 text-slate-500">รายชื่อห้องและจุดสำคัญที่เปิดแสดงบนแผนที่</p>
      </header>
      <div className="card p-4">
        <label className="relative block max-w-xl">
          <span className="sr-only">ค้นหาสถานที่</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
          <input className="control w-full pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาสถานที่..." />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {places.map((place) => (
          <Link key={place.id} href={`/map?q=${encodeURIComponent(place.roomCode ?? place.nameTh)}`} className="card p-5 transition hover:border-brand-500">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700"><MapPin size={20} /></span>
            <h2 className="mt-4 font-bold text-slate-900">{place.nameTh}</h2>
            <p className="mt-1 text-sm text-slate-500">{place.roomCode ?? 'ไม่มีรหัส'} · {categoryLabels[place.category]}</p>
          </Link>
        ))}
        {!places.length && (
          <p className="col-span-full py-12 text-center text-slate-500">ไม่พบสถานที่ที่ตรงกับการค้นหา</p>
        )}
      </div>
    </div>
  );
}
