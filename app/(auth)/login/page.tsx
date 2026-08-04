import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { MoonStar, BookOpen, HeartHandshake } from "lucide-react";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Masuk — Mutabaah Nurul Hasan",
};

const HIGHLIGHTS = [
  { icon: MoonStar, label: "Pantau sholat 5 waktu setiap hari" },
  { icon: BookOpen, label: "Catat tilawah & murajaah Al-Qur'an" },
  { icon: HeartHandshake, label: "Bangun kebiasaan baik bersama keluarga" },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen bg-surface-muted">
      {/* Brand panel — hidden below lg, collapses to a compact header on the form panel instead */}
      <div className="relative hidden overflow-hidden bg-linear-to-br from-emerald-800 via-emerald-700 to-emerald-900 lg:flex lg:w-[44%] lg:flex-col lg:justify-between lg:p-12">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="islamic-star" width="56" height="56" patternUnits="userSpaceOnUse">
              <rect x="14" y="14" width="28" height="28" fill="none" stroke="white" strokeWidth="1" />
              <rect
                x="14"
                y="14"
                width="28"
                height="28"
                fill="none"
                stroke="white"
                strokeWidth="1"
                transform="rotate(45 28 28)"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-star)" />
        </svg>

        <div
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-3">
          <div className="relative h-15 w-30 shrink-0">
            <Image
              src="/images/LOGO-NURUL-HASAN-LIGHT.png"
              alt="Logo Nurul Hasan"
              fill
              className="object-contain"
              sizes="200px"
              priority
            />
          </div>
          {/* <span className="text-lg font-semibold text-white">Mutabaah</span> */}
        </div>

        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium uppercase tracking-wide text-emerald-200">
              Generasi Rabbani
            </p>
            <h2 className="max-w-sm text-3xl font-semibold leading-tight text-white">
              Mendampingi tumbuh kembang ibadah dan akhlak ananda, setiap hari.
            </h2>
          </div>

          <ul className="space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm text-emerald-50/90">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                  <item.icon className="h-4 w-4 text-gold-400" />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-emerald-200/70">
          Sistem Monitoring Ibadah &amp; Karakter Siswa
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          {/* Compact brand header — only visible below lg, replaces the split panel */}
          <div className="mb-8 text-center lg:hidden">
            <div className="relative mx-auto mb-4 h-12 w-12">
              <Image
                src="/images/LOGO-NURUL-HASAN.png"
                alt="Logo Nurul Hasan"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <h1 className="text-xl font-semibold text-slate-900">Mutabaah</h1>
            <p className="mt-1 text-sm text-slate-500">
              Sistem Monitoring Ibadah &amp; Karakter Siswa
            </p>
          </div>

          <div className="rounded-(--radius-card) border border-border-subtle bg-white p-8 shadow-(--shadow-soft)">
            <div className="mb-7 hidden lg:block">
              <h1 className="text-xl font-semibold text-slate-900">Selamat datang kembali</h1>
              <p className="mt-1 text-sm text-slate-500">
                Masuk untuk melanjutkan pemantauan laporan harian.
              </p>
            </div>

            <Suspense fallback={<div className="h-64" />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}