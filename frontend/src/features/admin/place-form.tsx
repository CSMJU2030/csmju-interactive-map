"use client";

import { inputClass, primaryButtonClass, secondaryButtonClass } from "@/csmju";
import { MoreHorizIcon as LoaderCircle, CloseIcon as X } from "@/csmju";
import { cloneElement, useEffect, useId, useState } from "react";
import { z } from "zod";
import { apiRequest, fieldError } from "@/lib/api";
import { categoryLabels } from "@/lib/categories";
import type { MapLayout, Place, PlaceCategory } from "@/types/api";
import { PlaceLayoutEditor } from "./place-layout-editor";

const categoryValues = Object.keys(categoryLabels) as [
  PlaceCategory,
  ...PlaceCategory[],
];
const placeSchema = z.object({
  nameTh: z.string().trim().max(150, "กรอกได้ไม่เกิน 150 ตัวอักษร"),
  roomCode: z.string().trim().max(30, "กรอกได้ไม่เกิน 30 ตัวอักษร"),
  category: z.enum(categoryValues),
  description: z.string().trim().max(1000, "กรอกได้ไม่เกิน 1,000 ตัวอักษร"),
  positionX: z
    .number({ invalid_type_error: "กรุณากรอกตัวเลข" })
    .min(0, "ค่าต้องไม่ต่ำกว่า 0")
    .max(100, "ค่าต้องไม่เกิน 100"),
  positionY: z
    .number({ invalid_type_error: "กรุณากรอกตัวเลข" })
    .min(0, "ค่าต้องไม่ต่ำกว่า 0")
    .max(100, "ค่าต้องไม่เกิน 100"),
  width: z
    .number({ invalid_type_error: "กรุณากรอกตัวเลข" })
    .min(1, "ค่าต้องไม่ต่ำกว่า 1")
    .max(100, "ค่าต้องไม่เกิน 100"),
  height: z
    .number({ invalid_type_error: "กรุณากรอกตัวเลข" })
    .min(1, "ค่าต้องไม่ต่ำกว่า 1")
    .max(100, "ค่าต้องไม่เกิน 100"),
  isActive: z.boolean(),
  keywordsText: z.string().max(1000, "กรอกได้ไม่เกิน 1,000 ตัวอักษร"),
});

type PlaceFormValues = z.infer<typeof placeSchema>;
type FieldErrors = Partial<Record<keyof PlaceFormValues | "root", string>>;

const defaults: PlaceFormValues = {
  nameTh: "",
  roomCode: "",
  category: "CLASSROOM",
  description: "",
  positionX: 10,
  positionY: 10,
  width: 12,
  height: 8,
  isActive: true,
  keywordsText: "",
};

export function PlaceForm({
  place,
  places,
  mapLayout,
  onClose,
  onSaved,
}: {
  place: Place | null;
  places: Place[];
  mapLayout: MapLayout;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<PlaceFormValues>(defaults);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [rooms, setRooms] = useState<Array<{ code: string; nameTh: string }>>(
    [],
  );
  useEffect(() => {
    let active = true;
    const load = async () => {
      const available: Array<{ code: string; nameTh: string }> = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await apiRequest<
          Array<{ code: string; nameTh: string }>
        >(`/api/v1/places/core-rooms?limit=100&page=${page}`);
        available.push(...response.data);
        totalPages = response.meta?.totalPages ?? 1;
        page += 1;
      } while (page <= totalPages && active);
      if (active) setRooms(available);
    };
    void load().catch((error: unknown) => {
      if (active)
        setErrors({
          root: error instanceof Error ? error.message : "โหลดห้องไม่สำเร็จ",
        });
    });
    return () => {
      active = false;
    };
  }, []);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(
      place
        ? {
            nameTh: place.roomCode ? "" : place.nameTh,
            roomCode: place.roomCode ?? "",
            category: place.category,
            description: place.description ?? "",
            positionX: place.positionX,
            positionY: place.positionY,
            width: place.width ?? 12,
            height: place.height ?? 8,
            isActive: place.isActive,
            keywordsText: place.keywords.join(", "),
          }
        : defaults,
    );
    setErrors({});
  }, [place]);

  const validateField = (key: keyof PlaceFormValues) => {
    const parsed = placeSchema.shape[key].safeParse(values[key]);
    const message =
      key === "nameTh" && !values.roomCode && !values.nameTh.trim()
        ? "กรุณากรอกชื่อจุดบนแผนที่"
        : !parsed.success
          ? parsed.error.issues[0]?.message
          : undefined;
    setErrors((current) => ({ ...current, [key]: message }));
  };
  const set = <K extends keyof PlaceFormValues>(
    key: K,
    value: PlaceFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined, root: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = placeSchema
      .refine((value) => Boolean(value.roomCode || value.nameTh), {
        path: ["nameTh"],
        message: "กรุณากรอกชื่อจุดบนแผนที่",
      })
      .safeParse(values);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof PlaceFormValues;
        next[field] ??= issue.message;
      }
      setErrors(next);
      setTimeout(
        () =>
          document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        0,
      );
      return;
    }

    const payload = {
      ...parsed.data,
      roomCode: parsed.data.roomCode || undefined,
      nameTh: parsed.data.roomCode ? undefined : parsed.data.nameTh,
      description: parsed.data.description || undefined,
      keywords: parsed.data.keywordsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      keywordsText: undefined,
    };

    setSubmitting(true);
    try {
      await apiRequest<Place>(
        place ? `/api/v1/places/${place.id}` : "/api/v1/places",
        {
          method: place ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      );
      onSaved();
    } catch (error) {
      const failure = fieldError(error);
      setErrors(
        failure.field && Object.hasOwn(placeSchema.shape, failure.field)
          ? { [failure.field]: failure.message }
          : { root: failure.message },
      );
      setTimeout(
        () =>
          document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        0,
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 p-4" role="region" aria-label="ฟอร์มสถานที่">
      <div className="mx-auto my-4 max-w-3xl rounded-xl bg-white shadow-xl md:my-10">
        <div className="flex items-center justify-between border-b border-outline-variant/40 px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-on-surface">
              {place ? "แก้ไขสถานที่" : "เพิ่มสถานที่"}
            </h2>
            <p className="text-label-md text-on-surface-variant">
              กำหนดข้อมูลและตำแหน่งบนแผนที่
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface"
            aria-label="ปิดฟอร์ม"
          >
            <X width={20} height={20} aria-hidden="true" />
          </button>
        </div>
        <form
          onSubmit={(event) => void submit(event)}
          className="space-y-5 p-5"
          noValidate
        >
          <p className="text-body-md text-on-surface-variant">
            ช่องที่มี * จำเป็นต้องกรอก
          </p>
          <p role="status" aria-live="polite" className="sr-only">
            {Object.values(errors).filter(Boolean).length > 0
              ? `พบข้อผิดพลาด ${Object.values(errors).filter(Boolean).length} ช่อง`
              : null}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {!values.roomCode && (
              <Field label="ชื่อจุดบนแผนที่" error={errors.nameTh} required>
                <input
                  className={`${inputClass} w-full`}
                  onBlur={() => validateField("nameTh")}
                  value={values.nameTh}
                  onChange={(event) => set("nameTh", event.target.value)}
                />
              </Field>
            )}
            <Field label="ห้องจาก Core Hub" error={errors.roomCode}>
              <select
                className={`${inputClass} w-full`}
                value={values.roomCode}
                onChange={(event) => {
                  set("roomCode", event.target.value);
                  set("nameTh", "");
                }}
              >
                <option value="">จุดบนแผนที่ที่ไม่ใช่ห้อง</option>
                {rooms.map((room) => (
                  <option key={room.code} value={room.code}>
                    {room.code} — {room.nameTh}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ประเภท" error={errors.category} required>
              <select
                className={`${inputClass} w-full`}
                value={values.category}
                onChange={(event) =>
                  set("category", event.target.value as PlaceCategory)
                }
              >
                {categoryValues.map((value) => (
                  <option key={value} value={value}>
                    {categoryLabels[value]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="รายละเอียด" error={errors.description}>
            <textarea
              className={`${inputClass} min-h-28 w-full py-2`}
              onBlur={() => validateField("description")}
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
            />
          </Field>
          <PlaceLayoutEditor
            value={{
              positionX: values.positionX,
              positionY: values.positionY,
              width: values.width,
              height: values.height,
            }}
            places={places}
            mapLayout={mapLayout}
            editingId={place?.id}
            label={values.roomCode || values.nameTh}
            onChange={(layout) =>
              setValues((current) => ({
                ...current,
                positionX: layout.positionX,
                positionY: layout.positionY,
                width: layout.width,
                height: layout.height,
              }))
            }
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <NumberField
              label="ตำแหน่ง X"
              value={values.positionX}
              error={errors.positionX}
              onBlur={() => validateField("positionX")}
              onChange={(value) => set("positionX", value)}
            />
            <NumberField
              label="ตำแหน่ง Y"
              value={values.positionY}
              error={errors.positionY}
              onBlur={() => validateField("positionY")}
              onChange={(value) => set("positionY", value)}
            />
            <NumberField
              label="ความกว้าง"
              value={values.width}
              error={errors.width}
              onBlur={() => validateField("width")}
              onChange={(value) => set("width", value)}
            />
            <NumberField
              label="ความสูง"
              value={values.height}
              error={errors.height}
              onBlur={() => validateField("height")}
              onChange={(value) => set("height", value)}
            />
          </div>
          <Field
            label="คำค้นหา"
            error={errors.keywordsText}
            hint="คั่นหลายคำด้วยเครื่องหมายจุลภาค (,)"
          >
            <input
              className={`${inputClass} w-full`}
              placeholder="เช่น lab, ห้องคอม, แลป 3"
              onBlur={() => validateField("keywordsText")}
              value={values.keywordsText}
              onChange={(event) => set("keywordsText", event.target.value)}
            />
          </Field>
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-outline-variant/40 px-4">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary-container"
              checked={values.isActive}
              onChange={(event) => set("isActive", event.target.checked)}
            />
            <span className="font-medium text-on-surface-variant">
              เปิดแสดงสถานที่บนแผนที่
            </span>
          </label>
          {errors.root && (
            <p
              role="alert"
              className="rounded-xl bg-error-container p-3 text-body-md text-on-error-container"
            >
              {errors.root}
            </p>
          )}
          <div className="flex justify-end gap-3 border-t border-outline-variant/40 pt-5">
            <button
              type="button"
              className={`${secondaryButtonClass}`}
              onClick={onClose}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={`${primaryButtonClass}`}
              aria-busy={submitting}
              title={submitting ? "กำลังบันทึก กรุณารอสักครู่" : undefined}
              disabled={submitting}
            >
              {submitting && (
                <LoaderCircle
                  className="animate-pulse motion-reduce:animate-none"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
              )}
              {place ? "บันทึกการแก้ไข" : "เพิ่มสถานที่"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  error,
  onBlur,
  onChange,
}: {
  label: string;
  value: number;
  error?: string;
  onBlur: () => void;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} error={error} required>
      <input
        type="number"
        onBlur={onBlur}
        step="0.01"
        className={`${inputClass} w-full`}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </Field>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  const id = useId();
  const input = children as React.ReactElement<
    React.InputHTMLAttributes<HTMLInputElement>
  >;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-label-md">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {cloneElement(input, {
        id,
        "aria-required": required,
        "aria-invalid": Boolean(error),
        "aria-describedby": error
          ? `${id}-error`
          : hint
            ? `${id}-hint`
            : undefined,
      })}
      {hint && (
        <p id={`${id}-hint`} className="text-label-md text-on-surface-variant">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-label-md text-error">
          {error}
        </p>
      )}
    </div>
  );
}
