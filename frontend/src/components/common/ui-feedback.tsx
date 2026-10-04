"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  cardClass,
  secondaryButtonClass,
  DescriptionIcon,
  PageHeader,
} from "@/csmju";
import { ApiError } from "@/lib/api";

export function LoadingState() {
  const [visible, setVisible] = useState(false);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const first = setTimeout(() => setVisible(true), 300);
    const second = setTimeout(() => setSlow(true), 3000);
    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);
  return (
    <div
      aria-busy="true"
      role="status"
      aria-live="polite"
      className="min-h-72 space-y-4"
    >
      {visible && (
        <>
          <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-variant motion-reduce:animate-none" />
          <div className="h-64 w-full animate-pulse rounded-xl bg-surface-variant motion-reduce:animate-none" />
          {slow && <p className="text-body-md">กำลังโหลดข้อมูล...</p>}
        </>
      )}
    </div>
  );
}
export function MissingPage() {
  return (
    <section className="space-y-4">
      <PageHeader
        title="ไม่พบหน้าที่ค้นหา"
        description="ตรวจสอบลิงก์หรือกลับไปยังหน้าหลัก"
      />
      <DescriptionIcon className="h-6 w-6 text-outline" aria-hidden="true" />
      <p className="text-body-md">หน้านี้อาจถูกย้ายหรือลิงก์ไม่ถูกต้อง</p>
      <Link
        className={`${secondaryButtonClass} inline-flex min-h-11 items-center`}
        href="/map"
      >
        กลับหน้าหลัก
      </Link>
    </section>
  );
}
export function EmptyState({
  search = false,
  onClear,
}: {
  search?: boolean;
  onClear?: () => void;
}) {
  return (
    <section className={`${cardClass} space-y-4 p-6 text-center`} role="status">
      <DescriptionIcon
        className="mx-auto h-6 w-6 text-outline"
        aria-hidden="true"
      />
      <h2 className="font-display text-headline-md">
        {search ? "ไม่พบข้อมูลที่ตรงกับการค้นหา" : "ยังไม่มีข้อมูล"}
      </h2>
      <p className="text-body-md">
        {search
          ? "ลองใช้คำค้นอื่นหรือล้างตัวกรอง"
          : "เมื่อผู้ดูแลเพิ่มข้อมูลแล้ว รายการจะแสดงที่นี่"}
      </p>
      {onClear ? (
        <button
          className={`${secondaryButtonClass} min-h-11`}
          onClick={onClear}
        >
          ล้างตัวกรอง
        </button>
      ) : (
        <Link
          className={`${secondaryButtonClass} inline-flex min-h-11 items-center`}
          href="/map"
        >
          กลับหน้าหลัก
        </Link>
      )}
    </section>
  );
}
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const api = error instanceof ApiError ? error : null;
  if (api?.status === 401) return <LoadingState />;
  if (api?.status === 404) return <EmptyState />;
  const forbidden = api?.status === 403;
  const message = forbidden
    ? "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบย่อยนี้"
    : (api?.message ?? "ระบบขัดข้องชั่วคราว กรุณาลองอีกครั้ง");
  return (
    <section className={`${cardClass} space-y-4 p-6`} role="alert">
      <h2 className="font-display text-headline-md">
        {forbidden ? "ไม่มีสิทธิ์เข้าถึง" : "โหลดข้อมูลไม่สำเร็จ"}
      </h2>
      <p className="text-body-md">{message}</p>
      {api?.requestId && (
        <p className="text-body-md">รหัสอ้างอิง: {api.requestId}</p>
      )}
      {forbidden ? (
        <>
          <Link
            href="/map"
            className={`${secondaryButtonClass} inline-flex min-h-11 items-center`}
          >
            กลับหน้าหลัก
          </Link>
          <a
            href={
              process.env.NEXT_PUBLIC_CORE_HUB_WEB_URL ??
              "https://csmju2030.jowave.com"
            }
            className="text-primary-container underline"
          >
            ขอสิทธิ์เข้าใช้งาน
          </a>
        </>
      ) : (
        <button
          onClick={onRetry}
          className={`${secondaryButtonClass} min-h-11`}
        >
          ลองอีกครั้ง
        </button>
      )}
    </section>
  );
}
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="แบ่งหน้ารายการ"
      className="flex flex-wrap items-center justify-end gap-3 py-4"
    >
      <button
        className={`${secondaryButtonClass} min-h-11`}
        disabled={page <= 1}
        title={page <= 1 ? "อยู่ที่หน้าแรกแล้ว" : undefined}
        onClick={() => onChange(page - 1)}
      >
        ก่อนหน้า
      </button>
      <span className="text-body-md tabular-nums" aria-live="polite">
        หน้า {page} / {Math.max(1, totalPages)}
      </span>
      <button
        className={`${secondaryButtonClass} min-h-11`}
        disabled={page >= totalPages}
        title={page >= totalPages ? "อยู่ที่หน้าสุดท้ายแล้ว" : undefined}
        onClick={() => onChange(page + 1)}
      >
        ถัดไป
      </button>
    </nav>
  );
}
export function SuccessToast({ message }: { message: string }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(timer);
  }, [message]);
  return visible ? (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-4 z-50 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface shadow-md"
    >
      {message}
    </div>
  ) : null;
}
