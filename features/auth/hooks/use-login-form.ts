"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";

const ERROR_MESSAGES: Record<string, string> = {
  rate_limited: "Terlalu banyak percobaan login gagal. Silakan coba lagi dalam beberapa menit.",
  account_inactive: "Akun Anda tidak aktif. Hubungi admin sekolah.",
};
const DEFAULT_ERROR_MESSAGE = "Email atau password salah.";

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (result?.error) {
        setServerError((result.code && ERROR_MESSAGES[result.code]) || DEFAULT_ERROR_MESSAGE);
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
      router.push(callbackUrl);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return { form, onSubmit: form.handleSubmit(onSubmit), serverError, isSubmitting };
}
