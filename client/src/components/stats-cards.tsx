import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@shared/schema";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Shield,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "New Incidents",
      value: stats?.byStatus?.new ?? 0,
      icon: AlertCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "In Progress",
      value: (stats?.byStatus?.assigned ?? 0) + (stats?.byStatus?.in_progress ?? 0),
      icon: Clock,
      iconColor: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Resolved",
      value: stats?.byStatus?.resolved ?? 0,
      icon: CheckCircle2,
      iconColor: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      label: "Total",
      value: stats?.total ?? 0,
      icon: TrendingUp,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className="hover-elevate" data-testid={`stat-card-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                <p className="text-2xl font-semibold mt-1">{item.value}</p>
              </div>
              <div className={cn("p-2.5 rounded-lg", item.bgColor)}>
                <item.icon className={cn("h-5 w-5", item.iconColor)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

interface CategoryStatsProps {
  stats?: DashboardStats;
  isLoading?: boolean;
}

export function CategoryStats({ stats, isLoading }: CategoryStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const categories = [
    {
      label: "IT Incidents",
      value: stats?.byCategory?.it ?? 0,
      icon: Monitor,
      iconColor: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-800/50",
    },
    {
      label: "Cyber Incidents",
      value: stats?.byCategory?.cyber ?? 0,
      icon: Shield,
      iconColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2">
      {categories.map((item) => (
        <Card key={item.label} className="hover-elevate" data-testid={`stat-card-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", item.bgColor)}>
                <item.icon className={cn("h-4 w-4", item.iconColor)} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                <p className="text-lg font-semibold">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
