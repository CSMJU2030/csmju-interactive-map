import { cardClass } from "@/csmju";
import { LocationIcon as MapPin, CloseIcon as X } from "@/csmju";
import { categoryLabels } from "@/lib/categories";
import type { Place } from "@/types/api";
import { StatusBadge } from "../common/status-badge";

export function PlaceDetailPanel({
  place,
  onClose,
}: {
  place: Place;
  onClose: () => void;
}) {
  return (
    <aside
      className={`${cardClass} relative p-5`}
      aria-label="รายละเอียดสถานที่"
    >
      <button
        onClick={onClose}
        className="absolute right-3 top-3 rounded-lg p-2 text-on-surface-variant hover:bg-surface"
        aria-label="ปิดรายละเอียด"
      >
        <X width={20} height={20} aria-hidden="true" />
      </button>
      <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-container/10 text-primary-container">
        <MapPin width={20} height={20} aria-hidden="true" />
      </span>
      <div className="pr-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold text-on-surface">
            {place.roomCode ?? place.nameTh}
          </h2>
          <StatusBadge active={place.isActive} />
        </div>
        <p className="mt-1 text-on-surface-variant">{place.nameTh}</p>
      </div>
      <dl className="mt-6 space-y-4 text-label-md">
        <div>
          <dt className="text-on-surface-variant">รหัสห้อง</dt>
          <dd className="font-medium text-on-surface">
            {place.roomCode ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">ประเภท</dt>
          <dd className="font-medium text-on-surface">
            {categoryLabels[place.category]}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">รายละเอียด</dt>
          <dd className="text-on-surface-variant">
            {place.description ?? "ยังไม่มีรายละเอียด"}
          </dd>
        </div>
        <div>
          <dt className="text-on-surface-variant">อาจารย์ที่เกี่ยวข้อง</dt>
          <dd className="text-on-surface-variant">
            {place.lecturers.length
              ? place.lecturers.map(({ nameTh }) => nameTh).join(", ")
              : "—"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}
