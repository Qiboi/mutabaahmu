"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MessageSquarePlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { teacherCommentSchema, type TeacherCommentInput } from "../schemas/daily-report.schema";
import { useAddTeacherComment } from "../hooks/use-teacher-comment";

export function TeacherCommentForm({ reportId, existingComment }: { reportId: string; existingComment?: string }) {
  const [isEditing, setIsEditing] = useState(!existingComment);
  const mutation = useAddTeacherComment();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherCommentInput>({
    resolver: zodResolver(teacherCommentSchema),
    defaultValues: { teacherComment: existingComment ?? "" },
  });

  function onSubmit(values: TeacherCommentInput) {
    mutation.mutate({ id: reportId, input: values }, { onSuccess: () => setIsEditing(false) });
  }

  if (!isEditing && existingComment) {
    return (
      <div className="flex items-start justify-between gap-2 rounded-[var(--radius-control)] bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        <p>{existingComment}</p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="shrink-0 text-xs font-medium text-emerald-700 underline hover:text-emerald-900"
        >
          Ubah
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <Textarea
        placeholder="Tulis komentar untuk orang tua..."
        className="min-h-16 text-sm"
        {...register("teacherComment")}
      />
      {errors.teacherComment && <p className="text-xs text-red-600">{errors.teacherComment.message}</p>}
      {mutation.error && <p className="text-xs text-red-600">{mutation.error.message}</p>}
      <Button type="submit" size="sm" disabled={mutation.isPending}>
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : existingComment ? (
          <Send className="h-3.5 w-3.5" />
        ) : (
          <MessageSquarePlus className="h-3.5 w-3.5" />
        )}
        {existingComment ? "Simpan" : "Kirim Komentar"}
      </Button>
    </form>
  );
}
