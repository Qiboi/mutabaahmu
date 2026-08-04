"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useMyChildren } from "@/features/students/hooks/use-students";
import { AchievementGallery } from "@/features/achievements/components/achievement-gallery";

export function ParentOverview() {
  const { data: children, isLoading } = useMyChildren();
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    const firstChildId = children?.[0]?._id.toString();
    if (firstChildId && !selectedId) {
      setSelectedId(firstChildId);
    }
  }, [children, selectedId]);

  if (isLoading) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!children || children.length === 0) {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title="Belum ada anak yang terhubung"
          description="Hubungi admin sekolah untuk menautkan akun Anda dengan data siswa."
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {children.length > 1 && (
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="child-select">Menampilkan data untuk</Label>
          <Select id="child-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {children.map((child) => (
              <option key={child._id.toString()} value={child._id.toString()}>
                {child.fullName}
              </option>
            ))}
          </Select>
        </div>
      )}

      <AchievementGallery studentId={selectedId} />
    </div>
  );
}
