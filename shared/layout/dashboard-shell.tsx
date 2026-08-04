"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode, type ComponentType } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  School as SchoolIcon,
  CalendarClock,
  Layers,
  Users,
  UserCog,
  GraduationCap,
  Megaphone,
  History,
  ClipboardList,
  CalendarDays,
  FilePenLine,
} from "lucide-react";
import { cn } from "@/utils/cn";
import type { SessionUser } from "@/types";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const ROLE_LABEL: Record<SessionUser["role"], string> = {
  super_admin: "Super Admin",
  school_admin: "Admin Sekolah",
  teacher: "Guru",
  parent: "Orang Tua",
};

interface NavLink {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

const NAV_LINKS: Record<SessionUser["role"], NavLink[]> = {
  super_admin: [{ href: "/dashboard/super-admin", label: "Ringkasan", icon: LayoutDashboard }],
  school_admin: [
    { href: "/dashboard/admin", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/admin/school", label: "Sekolah", icon: SchoolIcon },
    { href: "/dashboard/admin/academic-years", label: "Tahun Ajaran", icon: CalendarClock },
    { href: "/dashboard/admin/classes", label: "Kelas", icon: Layers },
    { href: "/dashboard/admin/students", label: "Siswa", icon: Users },
    { href: "/dashboard/admin/users", label: "Akun Guru & Ortu", icon: UserCog },
    { href: "/dashboard/admin/promotion", label: "Kenaikan Kelas", icon: GraduationCap },
    { href: "/dashboard/admin/announcements", label: "Pengumuman", icon: Megaphone },
    { href: "/dashboard/admin/activity", label: "Aktivitas", icon: History },
  ],
  teacher: [
    { href: "/dashboard/teacher", label: "Laporan Siswa", icon: ClipboardList },
    { href: "/dashboard/teacher/history", label: "Riwayat", icon: CalendarDays },
    { href: "/dashboard/teacher/announcements", label: "Pengumuman", icon: Megaphone },
  ],
  parent: [
    { href: "/dashboard/parent", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/dashboard/parent/report", label: "Isi Laporan Harian", icon: FilePenLine },
    { href: "/dashboard/parent/history", label: "Riwayat", icon: CalendarDays },
    { href: "/dashboard/parent/announcements", label: "Pengumuman", icon: Megaphone },
  ],
};

function SidebarContent({ user, pathname, onNavigate }: { user: SessionUser; pathname: string; onNavigate?: () => void }) {
  const links = NAV_LINKS[user.role];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="relative h-9 w-9 shrink-0">
          <Image
            src="/favicon-nurul-hasan.png"
            alt="Logo Nurul Hasan"
            fill
            className="object-contain"
            sizes="36px"
            priority
          />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Mutabaah Nurul Hasan</p>
          <p className="text-xs text-emerald-600">{ROLE_LABEL[user.role]}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-(--radius-control) px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border-subtle p-4">
        <p className="mb-2 truncate text-sm text-slate-600">{user.name}</p>
        <SignOutButton />
      </div>
    </div>
  );
}

export function DashboardShell({
  user,
  title,
  children,
}: {
  user: SessionUser;
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {/* Desktop sidebar — sticky + locked to viewport height so it never stretches with tall
          page content (e.g. long tables). Nav scrolls internally; footer/logout stays pinned. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border-subtle bg-white lg:block">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Tutup menu"
              className="absolute right-3 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent user={user} pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border-subtle bg-white px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
          </div>
          <NotificationBell />
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}