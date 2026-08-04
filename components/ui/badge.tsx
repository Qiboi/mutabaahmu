import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-emerald-100 text-emerald-700",
      blue: "bg-blue-100 text-blue-700",
      amber: "bg-amber-100 text-amber-700",
      gold: "bg-gold-100 text-gold-700",
      gray: "bg-slate-100 text-slate-600",
      red: "bg-red-100 text-red-700",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}