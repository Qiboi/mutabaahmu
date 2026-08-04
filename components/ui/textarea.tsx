
import * as React from "react";
import { cn } from "@/utils/cn";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-24 w-full rounded-[var(--radius-control)] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

