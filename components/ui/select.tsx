
import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/cn";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-11 w-full appearance-none rounded-[var(--radius-control)] border border-slate-200 bg-white px-4 pr-9 text-sm text-slate-900 outline-none transition-shadow focus:ring-2 focus:ring-emerald-500",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  ),
);
Select.displayName = "Select";

