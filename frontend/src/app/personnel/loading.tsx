export default function PersonnelLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดข้อมูลบุคลากร">
      <header className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
        </div>
      </header>
      <div className="card h-16 w-full rounded-2xl bg-slate-100 p-4" />
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-4">
            <div className="flex gap-4">
              <div className="h-28 w-24 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-2.5 flex-1">
                <div className="h-5 w-20 rounded-full bg-slate-200" />
                <div className="h-6 w-40 rounded bg-slate-200" />
                <div className="h-4 w-32 rounded bg-slate-200" />
                <div className="h-4 w-28 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
