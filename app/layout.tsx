import type { Metadata } from "next";
import { AppSessionProvider } from "@/components/shared/session-provider";
import { AppQueryProvider } from "@/lib/query/provider";
import { ToastProvider } from "@/components/shared/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { absolute: "Mutabaah Nurul Hasan — Student Monitoring System" },
  description:
    "Sistem monitoring ibadah, karakter, dan kebiasaan siswa SDIT melalui laporan harian orang tua.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <AppSessionProvider>
          <AppQueryProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppQueryProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
