'use client';

import { LoaderCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { apiRequest } from '@/lib/api';
import { categoryLabels } from '@/lib/categories';
import type { MapLayout, Place, PlaceCategory } from '@/types/api';
import { PlaceLayoutEditor } from './place-layout-editor';

const categoryValues = Object.keys(categoryLabels) as [PlaceCategory, ...PlaceCategory[]];
const placeSchema = z.object({
  nameTh: z.string().trim().max(150),
  roomCode: z.string().trim().max(30),
  category: z.enum(categoryValues),
  description: z.string().trim().max(1000),
  positionX: z.number().min(0).max(100),
  positionY: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  isActive: z.boolean(),
  keywordsText: z.string().max(1000),
});

type PlaceFormValues = z.infer<typeof placeSchema>;
type FieldErrors = Partial<Record<keyof PlaceFormValues | 'root', string>>;

const defaults: PlaceFormValues = {
  nameTh: '', roomCode: '', category: 'CLASSROOM', description: '',
  positionX: 10, positionY: 10, width: 12, height: 8, isActive: true, keywordsText: '',
};

export function PlaceForm({ place, places, mapLayout, onClose, onSaved }: {
  place: Place | null;
  places: Place[];
  mapLayout: MapLayout;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<PlaceFormValues>(defaults);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [rooms, setRooms] = useState<Array<{code:string;nameTh:string}>>([]);
  useEffect(() => {
    let active = true;
    const load = async () => {
      const available: Array<{code:string;nameTh:string}> = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await apiRequest<Array<{code:string;nameTh:string}>>(`/api/v1/places/core-rooms?limit=100&page=${page}`);
        available.push(...response.data);
        totalPages = response.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages && active);
      if (active) setRooms(available);
    };
    void load().catch((error:unknown) => {if(active)setErrors({root:error instanceof Error ? error.message : 'โหลดห้องไม่สำเร็จ'});});
    return () => {active = false;};
  }, []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(place ? {
      nameTh: place.roomCode ? '' : place.nameTh,
      roomCode: place.roomCode ?? '',
      category: place.category,
      description: place.description ?? '',
      positionX: place.positionX,
      positionY: place.positionY,
      width: place.width ?? 12,
      height: place.height ?? 8,
      isActive: place.isActive,
      keywordsText: place.keywords.join(', '),
    } : defaults);
    setErrors({});
  }, [place]);

  const set = <K extends keyof PlaceFormValues>(key: K, value: PlaceFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, root: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = placeSchema.safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof PlaceFormValues;
        next[field] ??= issue.message;
      }
      setErrors(next);
      return;
    }

    const payload = {
      ...parsed.data,
      roomCode: parsed.data.roomCode || undefined,
      nameTh: parsed.data.roomCode ? undefined : parsed.data.nameTh,
      description: parsed.data.description || undefined,
      keywords: parsed.data.keywordsText.split(',').map((item) => item.trim()).filter(Boolean),
      keywordsText: undefined,
    };

    setSubmitting(true);
    try {
      await apiRequest<Place>(place ? `/api/v1/places/${place.id}` : '/api/v1/places', {
        method: place ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      });
      onSaved();
    } catch (error) {
      setErrors({ root: error instanceof Error ? error.message : 'บันทึกข้อมูลไม่สำเร็จ' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto my-4 max-w-3xl rounded-2xl bg-white shadow-xl md:my-10">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{place ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}</h2>
            <p className="text-sm text-slate-500">กำหนดข้อมูลและตำแหน่งบนแผนที่</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="ปิดฟอร์ม"><X size={20} /></button>
        </div>
        <form onSubmit={(event) => void submit(event)} className="space-y-5 p-5" noValidate>
          <p className="text-xs text-slate-500">ช่องที่มี * จำเป็นต้องกรอก</p>
          <div className="grid gap-4 md:grid-cols-2">
            {!values.roomCode && <Field label="ชื่อจุดบนแผนที่" error={errors.nameTh} required><input className="control w-full" value={values.nameTh} onChange={(event) => set('nameTh', event.target.value)} /></Field>}
            <Field label="ห้องจาก Core Hub" error={errors.roomCode}><select className="control w-full" value={values.roomCode} onChange={event => {set('roomCode', event.target.value);set('nameTh','');}}><option value="">จุดบนแผนที่ที่ไม่ใช่ห้อง</option>{rooms.map(room => <option key={room.code} value={room.code}>{room.code} — {room.nameTh}</option>)}</select></Field>
            <Field label="ประเภท" error={errors.category} required><select className="control w-full" value={values.category} onChange={(event) => set('category', event.target.value as PlaceCategory)}>{categoryValues.map((value) => <option key={value} value={value}>{categoryLabels[value]}</option>)}</select></Field>
          </div>
          <Field label="รายละเอียด" error={errors.description}><textarea className="control min-h-28 w-full py-2" value={values.description} onChange={(event) => set('description', event.target.value)} /></Field>
          <PlaceLayoutEditor value={{ positionX: values.positionX, positionY: values.positionY, width: values.width, height: values.height }} places={places} mapLayout={mapLayout} editingId={place?.id} label={values.roomCode || values.nameTh} onChange={(layout) => setValues((current) => ({ ...current, positionX: layout.positionX, positionY: layout.positionY, width: layout.width, height: layout.height }))} />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <NumberField label="ตำแหน่ง X" value={values.positionX} error={errors.positionX} onChange={(value) => set('positionX', value)} />
            <NumberField label="ตำแหน่ง Y" value={values.positionY} error={errors.positionY} onChange={(value) => set('positionY', value)} />
            <NumberField label="ความกว้าง" value={values.width} error={errors.width} onChange={(value) => set('width', value)} />
            <NumberField label="ความสูง" value={values.height} error={errors.height} onChange={(value) => set('height', value)} />
          </div>
          <Field label="คำค้นหา" error={errors.keywordsText} hint="คั่นหลายคำด้วยเครื่องหมายจุลภาค (,)"><input className="control w-full" placeholder="เช่น lab, ห้องคอม, แลป 3" value={values.keywordsText} onChange={(event) => set('keywordsText', event.target.value)} /></Field>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-4"><input type="checkbox" className="h-4 w-4 accent-brand-700" checked={values.isActive} onChange={(event) => set('isActive', event.target.checked)} /><span className="font-medium text-slate-700">เปิดแสดงสถานที่บนแผนที่</span></label>
          {errors.root && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errors.root}</p>}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" className="button-secondary" onClick={onClose}>ยกเลิก</button><button type="submit" className="button-primary" disabled={submitting}>{submitting && <LoaderCircle className="animate-spin" size={18} />}{place ? 'บันทึกการแก้ไข' : 'เพิ่มสถานที่'}</button></div>
        </form>
      </div>
    </div>
  );
}

function NumberField({ label, value, error, onChange }: { label: string; value: number; error?: string; onChange: (value: number) => void }) {
  return <Field label={label} error={error} required><input type="number" step="0.01" className="control w-full" value={value} onChange={(event) => onChange(Number(event.target.value))} /></Field>;
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700">{label} {required && <span className="text-red-500">*</span>}</span>{children}{hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
