import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900">ไม่พบหน้าที่คุณกำลังค้นหา</h2>
        <p className="text-sm text-slate-600">
          หน้าเว็บนี้อาจถูกย้าย ลบ หรือคุณอาจพิมพ์ที่อยู่ URL ไม่ถูกต้อง
        </p>
        <div className="pt-2">
          <Link
            href="/map"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-6 py-2.5 font-medium text-white transition hover:bg-brand-800"
          >
            กลับสู่หน้าแผนที่
          </Link>
        </div>
      </div>
    </div>
  );
}
