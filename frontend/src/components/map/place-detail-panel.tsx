import { MapPin, X } from 'lucide-react';
import { categoryLabels } from '@/lib/categories';
import type { Place } from '@/types/api';
import { StatusBadge } from '../common/status-badge';

export function PlaceDetailPanel({ place, onClose }: { place: Place; onClose: () => void }) {
  return (
    <aside className="card relative p-5" aria-label="รายละเอียดสถานที่">
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
        aria-label="ปิดรายละเอียด"
      >
        <X size={19} />
      </button>
      <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-100 text-brand-700">
        <MapPin size={22} />
      </span>
      <div className="pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-slate-900">{place.roomCode ?? place.nameTh}</h2>
          <StatusBadge active={place.isActive} />
        </div>
        <p className="mt-1 text-slate-600">{place.nameTh}</p>
      </div>
      <dl className="mt-6 space-y-4 text-sm">
        <div>
          <dt className="text-slate-400">รหัสห้อง</dt>
          <dd className="font-medium text-slate-800">{place.roomCode ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-400">ประเภท</dt>
          <dd className="font-medium text-slate-800">{categoryLabels[place.category]}</dd>
        </div>
        <div>
          <dt className="text-slate-400">รายละเอียด</dt>
          <dd className="text-slate-700">{place.description ?? 'ยังไม่มีรายละเอียด'}</dd>
        </div>
        <div>
          <dt className="text-slate-400">อาจารย์ที่เกี่ยวข้อง</dt>
          <dd className="text-slate-700">
            {place.lecturers.length ? place.lecturers.map(({ nameTh }) => nameTh).join(', ') : '—'}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
