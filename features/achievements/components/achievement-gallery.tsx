"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useStudentAchievements } from "../hooks/use-achievements";
import { AchievementBadge } from "./achievement-badge";

export function AchievementGallery({ studentId }: { studentId: string | undefined }) {
  const { data: achievements, isLoading } = useStudentAchievements(studentId);

  return (
    <Card>
      <CardHeader className="flex-col items-start">
        <CardTitle>Lencana Pencapaian</CardTitle>
        <CardDescription>Penghargaan yang sudah diraih dari kebiasaan baik sehari-hari.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-(--radius-card)" />
            ))}
          </div>
        ) : !achievements || achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Belum ada lencana"
            description="Terus konsisten mengisi laporan harian untuk meraih lencana pertama!"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {achievements.map((a, i) => (
              <AchievementBadge key={a._id.toString()} achievement={a} index={i} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}