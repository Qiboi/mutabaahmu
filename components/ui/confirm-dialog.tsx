
"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "./dialog";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Ya, Lanjutkan",
  cancelLabel = "Batal",
  tone = "default",
  isLoading = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" tints the confirm button red — use for permanently destructive actions. */
  tone?: "default" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} className="max-w-sm">
      <div className="flex items-start gap-3">
        <div
          className={
            tone === "danger"
              ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
              : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600"
          }
        >
          <AlertTriangle className="h-5 w-5" />
        </div>
        {description && <p className="pt-2 text-sm text-slate-600">{description}</p>}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className={tone === "danger" ? "bg-red-600 hover:bg-red-700" : undefined}
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}

