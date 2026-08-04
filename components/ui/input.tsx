import * as React from "react";
import { cn } from "@/utils/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "h-11 w-full rounded-(--radius-control) border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500",
        "aria-invalid:border-red-300 aria-invalid:focus:ring-red-400",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";