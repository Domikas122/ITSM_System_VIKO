import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IncidentHistory, IncidentStatus } from "@shared/schema";
import { format } from "date-fns";
import { 
  History, 
  Plus, 
  UserCheck, 
  PlayCircle, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryTimelineProps {
  history: IncidentHistory[];
}

const actionConfig: Record<string, { icon: typeof Plus; color: string; bgColor: string }> = {
  created: { 
    icon: Plus, 
    color: "text-blue-500", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30" 
  },
  assigned: { 
    icon: UserCheck, 
    color: "text-purple-500", 
    bgColor: "bg-purple-100 dark:bg-purple-900/30" 
  },
  status_change: { 
    icon: ArrowRight, 
    color: "text-amber-500", 
    bgColor: "bg-amber-100 dark:bg-amber-900/30" 
  },
  resolved: { 
    icon: CheckCircle, 
    color: "text-green-500", 
    bgColor: "bg-green-100 dark:bg-green-900/30" 
  },
  closed: { 
    icon: XCircle, 
    color: "text-gray-500", 
    bgColor: "bg-gray-100 dark:bg-gray-800/50" 
  },
  note: { 
    icon: MessageSquare, 
    color: "text-slate-500", 
    bgColor: "bg-slate-100 dark:bg-slate-800/50" 
  },
};

const statusLabels: Record<IncidentStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export function HistoryTimeline({ history }: HistoryTimelineProps) {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-4 w-4 text-muted-foreground" />
            History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No history recorded yet
          </p>
        </CardContent>
      </Card>
    );
  }

  const getActionLabel = (entry: IncidentHistory) => {
    if (entry.action === "created") {
      return "Incident created";
    }
    if (entry.action === "assigned") {
      return "Incident assigned";
    }
    if (entry.action === "status_change" && entry.previousStatus && entry.newStatus) {
      return `Status changed from ${statusLabels[entry.previousStatus]} to ${statusLabels[entry.newStatus]}`;
    }
    if (entry.action === "resolved") {
      return "Incident marked as resolved";
    }
    if (entry.action === "closed") {
      return "Incident closed";
    }
    return entry.action;
  };

  const getConfig = (action: string) => {
    return actionConfig[action] || actionConfig.note;
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {history.map((entry, index) => {
              const config = getConfig(entry.action);
              const Icon = config.icon;
              
              return (
                <div key={entry.id} className="relative pl-10" data-testid={`history-entry-${entry.id}`}>
                  <div className={cn(
                    "absolute left-0 p-1.5 rounded-full border-2 border-background",
                    config.bgColor
                  )}>
                    <Icon className={cn("h-3 w-3", config.color)} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{getActionLabel(entry)}</p>
                    {entry.notes && (
                      <p className="text-sm text-muted-foreground">{entry.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
