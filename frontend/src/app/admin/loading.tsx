export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดหน้าผู้ดูแลระบบ">
      <header className="space-y-2">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-8 w-56 rounded-xl bg-slate-200" />
        <div className="h-4 w-72 rounded bg-slate-200" />
      </header>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="h-7 w-16 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="card h-96 w-full rounded-2xl bg-slate-100 p-6" />
    </div>
  );
}
