import { Flame, MoonStar, BookOpen, Sunrise, HandHeart, type LucideIcon } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { ACHIEVEMENT_DEFINITIONS, type AchievementDefinition } from "@/constants/achievements";
import type { IAchievement } from "@/models/Achievement";

const ICONS: Record<AchievementDefinition["icon"], LucideIcon> = {
  flame: Flame,
  "moon-star": MoonStar,
  "book-open": BookOpen,
  sunrise: Sunrise,
  "hand-heart": HandHeart,
};

const COLOR_CLASSES: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  amber: "bg-amber-50 text-amber-600 ring-amber-100",
  gold: "bg-gold-50 text-gold-600 ring-gold-100",
};

export function AchievementBadge({
  achievement,
  index = 0,
}: {
  achievement: IAchievement;
  /** Position in the gallery grid — used only to stagger the entrance animation. */
  index?: number;
}) {
  const def = ACHIEVEMENT_DEFINITIONS[achievement.code];
  const Icon = ICONS[def.icon];
  const isTopTier = def.color === "gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="group flex flex-col items-center gap-2 rounded-(--radius-card) border border-border-subtle bg-white p-4 text-center shadow-(--shadow-soft) transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative">
        {isTopTier && (
          <span className="absolute inset-0 -z-10 animate-pulse rounded-2xl bg-gold-400/30 blur-md" aria-hidden="true" />
        )}
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl ring-4 transition-transform duration-200 group-hover:scale-110",
            COLOR_CLASSES[def.color],
          )}
        >
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{def.title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{def.description}</p>
      </div>
      <p className="text-[11px] text-slate-400">
        {format(new Date(achievement.earnedAt), "d MMM yyyy", { locale: idLocale })}
      </p>
    </motion.div>
  );
}