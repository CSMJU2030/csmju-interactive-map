export default function MapLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดแผนที่">
      <header className="space-y-2">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="h-8 w-72 rounded-xl bg-slate-200" />
        <div className="h-4 w-96 rounded bg-slate-200" />
      </header>
      <div className="card h-20 w-full rounded-2xl bg-slate-100 p-4" />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-[520px] rounded-2xl bg-slate-200" />
        <div className="hidden h-[520px] rounded-2xl bg-slate-100 p-4 xl:block space-y-4">
          <div className="h-6 w-32 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-32 rounded-xl bg-slate-200 mt-6" />
        </div>
      </div>
    </div>
  );
}
