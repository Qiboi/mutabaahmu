"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Users, School, TrendingUp, HeartHandshake, Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "../hooks/use-dashboard-stats";
import { StatCard } from "./stat-card";

export function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  const trendData = stats.last7Days.map((d) => ({
    ...d,
    label: format(new Date(d.date), "EEE", { locale: idLocale }),
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Siswa" value={stats.totalStudents} tone="emerald" />
        <StatCard icon={School} label="Total Kelas" value={stats.totalClasses} tone="blue" />
        <StatCard
          icon={TrendingUp}
          label="Completion Rate Hari Ini"
          value={`${stats.completionRateToday}%`}
          tone="emerald"
        />
        <StatCard
          icon={HeartHandshake}
          label="Partisipasi Orang Tua"
          value={`${stats.parentParticipationRate}%`}
          hint="Aktif mengisi laporan 7 hari terakhir"
          tone="amber"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-col items-start">
            <CardTitle>Tren Completion Rate 7 Hari Terakhir</CardTitle>
            <CardDescription>Persentase siswa yang mengisi laporan setiap hari.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                    contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="completionRate"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#059669" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start">
            <CardTitle>Completion Rate per Kelas (Hari Ini)</CardTitle>
            <CardDescription>Persentase siswa yang sudah mengisi laporan hari ini.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.classRates}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Completion Rate"]}
                    contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
                  />
                  <Bar dataKey="rate" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Kelas Paling Aktif</p>
              <p className="font-semibold text-slate-900">
                {stats.mostActiveClass ? `${stats.mostActiveClass.name} (${stats.mostActiveClass.rate}%)` : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <TrendingDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Kelas Paling Perlu Perhatian</p>
              <p className="font-semibold text-slate-900">
                {stats.leastActiveClass ? `${stats.leastActiveClass.name} (${stats.leastActiveClass.rate}%)` : "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
