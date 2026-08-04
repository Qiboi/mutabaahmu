export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-muted)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
        <p className="text-sm text-slate-500">Memuat halaman...</p>
      </div>
    </div>
  );
}
