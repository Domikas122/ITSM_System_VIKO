import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import type { SimilarIncident } from "@shared/schema";
import { Search, ExternalLink, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimilarIncidentsProps {
  incidents: SimilarIncident[];
}

export function SimilarIncidents({ incidents }: SimilarIncidentsProps) {
  if (!incidents || incidents.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Similar Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No similar incidents found
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatSimilarity = (similarity: number) => {
    return `${Math.round(similarity * 100)}%`;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Similar Incidents ({incidents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {incidents.map((incident) => (
          <Link key={incident.id} href={`/incidents/${incident.id}`}>
            <div
              className={cn(
                "p-3 rounded-lg border transition-colors",
                "hover:bg-muted/50 cursor-pointer"
              )}
              data-testid={`similar-incident-${incident.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{incident.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {incident.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    incident.similarity >= 0.8 
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : incident.similarity >= 0.6
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {formatSimilarity(incident.similarity)} match
                  </span>
                  <StatusBadge status={incident.status} className="text-[10px]" />
                </div>
              </div>
              {incident.resolvedAt && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Resolved</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
