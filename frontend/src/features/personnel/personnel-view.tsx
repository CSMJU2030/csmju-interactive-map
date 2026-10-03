'use client';

import { GraduationCap, Mail, Phone, Search, UserRound, UsersRound } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '@/lib/api';
import type { Lecturer } from '@/types/api';

type PersonnelFilter = 'ALL' | 'TEACHER' | 'STAFF';

const filters: Array<{ value: PersonnelFilter; label: string }> = [
  { value: 'ALL', label: 'ทั้งหมด' },
  { value: 'TEACHER', label: 'คณาจารย์' },
  { value: 'STAFF', label: 'เจ้าหน้าที่' },
];

export function PersonnelView() {
  const [personnel, setPersonnel] = useState<Lecturer[]>([]);
  const [filter, setFilter] = useState<PersonnelFilter>('ALL');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void apiRequest<Lecturer[]>('/api/v1/lecturers?limit=100')
      .then(({ data }) => setPersonnel(data))
      .catch((caught: unknown) => setError(caught instanceof Error ? caught.message : 'ไม่สามารถโหลดข้อมูลบุคลากรได้'))
      .finally(() => setLoading(false));
  }, []);

  const visiblePersonnel = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('th');
    return personnel.filter((person) => {
      if (filter !== 'ALL' && person.personnelType !== filter) return false;
      if (!normalized) return true;
      return [person.title, person.nameTh, person.nameEn, person.positionAcademic, person.positionManager, person.email]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase('th').includes(normalized));
    });
  }, [filter, personnel, query]);

  const counts = useMemo(() => ({
    ALL: personnel.length,
    TEACHER: personnel.filter(({ personnelType }) => personnelType === 'TEACHER').length,
    STAFF: personnel.filter(({ personnelType }) => personnelType === 'STAFF').length,
  }), [personnel]);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><UsersRound size={25} /></span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">คณาจารย์และเจ้าหน้าที่</h1>
            <p className="mt-1 text-slate-500">สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้</p>
          </div>
        </div>
      </header>

      <section className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="กรองประเภทบุคลากร">
          {filters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${filter === value ? 'bg-brand-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {label} <span className="ml-1 opacity-75">{counts[value]}</span>
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <span className="sr-only">ค้นหาชื่อ ตำแหน่ง หรืออีเมล</span>
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input className="control w-full pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาชื่อ ตำแหน่ง หรืออีเมล" />
        </label>
      </section>

      {error && <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {loading && <p className="py-12 text-center text-slate-500">กำลังโหลดข้อมูลบุคลากร...</p>}

      {!loading && !error && (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {visiblePersonnel.map((person) => (
            <article key={person.id} className="card overflow-hidden">
              <div className="flex gap-4 p-5">
                {person.imageProfile ? (
                  <Image
                    src={person.imageProfile}
                    alt={`${person.title ?? ''}${person.nameTh}`}
                    width={96}
                    height={112}
                    className="h-28 w-24 shrink-0 rounded-xl bg-slate-100 object-cover object-top"
                  />
                ) : (
                  <span className="grid h-28 w-24 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><UserRound size={36} /></span>
                )}
                <div className="min-w-0">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${person.personnelType === 'TEACHER' ? 'bg-brand-100 text-brand-800' : 'bg-sky-100 text-sky-800'}`}>
                    {person.personnelType === 'TEACHER' ? 'คณาจารย์' : 'เจ้าหน้าที่'}
                  </span>
                  <h2 className="mt-2 text-lg font-bold leading-snug text-slate-900">{person.title}{person.nameTh}</h2>
                  {person.nameEn && <p className="mt-0.5 text-sm text-slate-500">{person.nameEn}</p>}
                  {person.positionAcademic && <p className="mt-2 text-sm font-medium text-brand-700">{person.positionAcademic}</p>}
                </div>
              </div>
              <div className="space-y-2 border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
                {person.positionManager && <p>{person.positionManager}</p>}
                {person.education && <p className="flex gap-2"><GraduationCap className="mt-0.5 shrink-0 text-slate-400" size={17} /><span>{person.education}</span></p>}
                {person.email && <a className="flex items-center gap-2 hover:text-brand-700" href={`mailto:${person.email}`}><Mail className="shrink-0 text-slate-400" size={17} />{person.email}</a>}
                {person.phone && <a className="flex items-center gap-2 hover:text-brand-700" href={`tel:${person.phone.replace(/[^0-9+]/g, '')}`}><Phone className="shrink-0 text-slate-400" size={17} />{person.phone}</a>}
              </div>
            </article>
          ))}
          {!visiblePersonnel.length && <p className="col-span-full py-12 text-center text-slate-500">ไม่พบบุคลากรที่ตรงกับการค้นหา</p>}
        </div>
      )}

      <p className="text-xs text-slate-400">ข้อมูลอ้างอิงจากเว็บไซต์สาขาวิชาวิทยาการคอมพิวเตอร์ มหาวิทยาลัยแม่โจ้</p>
    </div>
  );
}
