export default function LocationsLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดรายการสถานที่">
      <header className="space-y-2">
        <div className="h-8 w-60 rounded-xl bg-slate-200" />
        <div className="h-4 w-80 rounded bg-slate-200" />
      </header>
      <div className="card h-16 w-full rounded-2xl bg-slate-100 p-4" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-5 space-y-3">
            <div className="h-10 w-10 rounded-xl bg-slate-200" />
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
