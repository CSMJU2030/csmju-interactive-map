export default function AboutLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดข้อมูลเกี่ยวกับระบบ">
      <header className="space-y-2">
        <div className="h-8 w-48 rounded-xl bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200" />
      </header>
      <div className="card h-64 w-full rounded-2xl bg-slate-100 p-6 space-y-4">
        <div className="h-6 w-36 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-200" />
        <div className="h-4 w-5/6 rounded bg-slate-200" />
        <div className="h-4 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}
