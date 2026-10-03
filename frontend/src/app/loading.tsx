export default function RootLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="กำลังโหลดหน้าเว็บ">
      <div className="space-y-2">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-4 w-96 rounded-lg bg-slate-200" />
      </div>
      <div className="h-96 w-full rounded-2xl bg-slate-200" />
    </div>
  );
}
