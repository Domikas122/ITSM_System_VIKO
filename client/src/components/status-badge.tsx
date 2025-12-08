import { Badge } from "@/components/ui/badge";
import type { IncidentStatus, SeverityLevel, IncidentCategory } from "@shared/schema";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: IncidentStatus;
  className?: string;
}

const statusConfig: Record<IncidentStatus, { label: string; className: string }> = {
  Naujas: { 
    label: "NAUJAS", 
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" 
  },
  Paskirtas: { 
    label: "PRISKIRTAS", 
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800" 
  },
  Vykdomas: { 
    label: "VYKDOMAS", 
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" 
  },
  Išspręstas: { 
    label: "IŠSPRĘSTAS", 
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" 
  },
  Uždarytas: { 
    label: "UŽDARYTAS", 
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800/50 dark:text-gray-400 border-gray-200 dark:border-gray-700" 
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Naujas;
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium uppercase tracking-wide border",
        config?.className || "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
        className
      )}
      data-testid={`badge-status-${status}`}
    >
      {config?.label || "Nežinoma"}
    </Badge>
  );
}

interface SeverityBadgeProps {
  severity: SeverityLevel;
  showDot?: boolean;
  className?: string;
}

const severityConfig: Record<SeverityLevel, { label: string; dotColor: string; className: string }> = {
  Kritinis: { 
    label: "Kritinė", 
    dotColor: "bg-red-500",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800" 
  },
  Aukštas: { 
    label: "Aukšta", 
    dotColor: "bg-orange-500",
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800" 
  },
  Vidutinis: { 
    label: "Vidutinė", 
    dotColor: "bg-yellow-500",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800" 
  },
  Žemas: { 
    label: " Žema", 
    dotColor: "bg-green-500",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800" 
  },
};

export function SeverityBadge({ severity, showDot = true, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium border",
        config.className,
        className
      )}
      data-testid={`badge-severity-${severity}`}
    >
      {showDot && (
        <span className={cn("w-2 h-2 rounded-full mr-1.5", config.dotColor)} />
      )}
      {config.label}
    </Badge>
  );
}

export function SeverityDot({ severity, className }: { severity: SeverityLevel; className?: string }) {
  const config = severityConfig[severity] || severityConfig.Vidutinis;
  return (
    <span 
      className={cn("w-2.5 h-2.5 rounded-full inline-block", config?.dotColor || "bg-yellow-500", className)} 
      title={config?.label || "Nežinoma"}
      data-testid={`dot-severity-${severity}`}
    />
  );
}

interface CategoryBadgeProps {
  category: IncidentCategory;
  className?: string;
}

const categoryConfig: Record<IncidentCategory, { label: string; className: string }> = {
  IT: { 
    label: "IT", 
    className: "bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700" 
  },
  Kibernetinis: { 
    label: "Kibernetinis", 
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800" 
  },
};

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = categoryConfig[category] || categoryConfig.IT;
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "text-xs font-medium uppercase border",
        config?.className || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300 border-gray-200 dark:border-gray-800",
        className
      )}
      data-testid={`badge-category-${category}`}
    >
      {config?.label || "Nežinoma"}
    </Badge>
  );
}
