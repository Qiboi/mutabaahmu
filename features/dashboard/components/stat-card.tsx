import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "emerald",
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "emerald" | "blue" | "amber" | "gold";
  /** Optional — pass when a comparison value (e.g. vs. minggu lalu) is available. */
  trend?: { direction: "up" | "down"; label: string };
}) {
  const toneClasses = {
    emerald: "bg-gradient-to-br from-emerald-50 to-emerald-100/60 text-emerald-600",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100/60 text-blue-600",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100/60 text-amber-600",
    gold: "bg-gradient-to-br from-gold-50 to-gold-100/60 text-gold-600",
  }[tone];

  return (
    <div className="group rounded-(--radius-card) border border-border-subtle bg-white p-5 shadow-(--shadow-soft) transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              toneClasses,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-500">{label}</p>
            <p className="text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{value}</p>
          </div>
        </div>

        {trend && (
          <span
            className={cn(
              "flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-medium",
              trend.direction === "up" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.label}
          </span>
        )}
      </div>
      {hint && <p className="mt-2.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}