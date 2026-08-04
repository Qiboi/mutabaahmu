"use client";

/**
 * Wraps a Dialog's onOpenChange so that closing while the form has unsaved changes (isDirty)
 * requires confirmation first. Using window.confirm() here is a deliberate, pragmatic choice —
 * this is a rare edge case (closing mid-edit), so a native confirm is simpler and faster to wire
 * across every form dialog than a second custom dialog stacked on top of the first.
 */
export function guardedClose(
  isDirty: boolean,
  onOpenChange: (open: boolean) => void,
): (open: boolean) => void {
  return (open: boolean) => {
    if (!open && isDirty) {
      const confirmed = window.confirm(
        "Ada perubahan yang belum disimpan. Yakin ingin menutup tanpa menyimpan?",
      );
      if (!confirmed) return;
    }
    onOpenChange(open);
  };
}
