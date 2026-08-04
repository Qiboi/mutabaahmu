import type { AchievementCode } from "./achievement-codes";

export interface AchievementDefinition {
  code: AchievementCode;
  title: string;
  description: string;
  icon: "flame" | "moon-star" | "book-open" | "sunrise" | "hand-heart";
  color: "emerald" | "blue" | "amber" | "gold";
}

export const ACHIEVEMENT_DEFINITIONS: Record<AchievementCode, AchievementDefinition> = {
  streak_7_days: {
    code: "streak_7_days",
    title: "Konsisten 7 Hari",
    description: "Mengisi laporan harian 7 hari berturut-turut",
    icon: "flame",
    color: "emerald",
  },
  prayer_30_days: {
    code: "prayer_30_days",
    title: "Sholat 30 Hari",
    description: "Menyelesaikan 5 waktu sholat selama 30 hari",
    icon: "moon-star",
    color: "gold",
  },
  tilawah_100_pages: {
    code: "tilawah_100_pages",
    title: "100 Halaman Tilawah",
    description: "Membaca total 100 halaman Al-Qur'an",
    icon: "book-open",
    color: "emerald",
  },
  wake_up_early_streak: {
    code: "wake_up_early_streak",
    title: "Bangun Pagi Konsisten",
    description: "Bangun pagi 14 hari berturut-turut",
    icon: "sunrise",
    color: "amber",
  },
  helping_parents_14_days: {
    code: "helping_parents_14_days",
    title: "Anak Sholeh Pembantu Orang Tua",
    description: "Membantu orang tua selama 14 hari",
    icon: "hand-heart",
    color: "blue",
  },
};