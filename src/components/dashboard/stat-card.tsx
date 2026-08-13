"use client";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  accent?: "primary" | "success" | "destructive";
}

export function StatCard({ label, value, icon: Icon, trend, trendPositive, accent = "primary" }: StatCardProps) {
  const iconBg = {
    primary: "from-primary-soft to-primary-subtle text-primary ring-primary-border",
    success: "from-success-soft to-success-subtle text-success ring-success-border",
    destructive: "from-destructive-soft to-destructive-subtle text-destructive ring-destructive-border",
  } as const;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary tabular-nums">{value}</p>
            {trend && (
              <div className={cn("mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", trendPositive ? "bg-success-subtle text-success" : "bg-destructive-subtle text-destructive")}>
                {trendPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trend}
              </div>
            )}
          </div>
          <div className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ring-1 shadow-lg",
            iconBg[accent],
            accent === "primary" ? "shadow-primary-border" : accent === "success" ? "shadow-success-border" : "shadow-destructive-border"
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
