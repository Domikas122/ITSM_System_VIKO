import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge, SeverityBadge, CategoryBadge } from "@/components/status-badge";
import { SimilarIncidents } from "@/components/similar-incidents";
import { HistoryTimeline } from "@/components/history-timeline";
import { AiAnalysisPanel } from "@/components/ai-analysis-panel";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { IncidentWithDetails, IncidentStatus } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import {
  ArrowLeft,
  Clock,
  User,
  UserCheck,
  Calendar,
  Server,
  PlayCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentDetailProps {
  incidentId: string;
}

const statusTransitions: Record<IncidentStatus, { next: IncidentStatus; label: string; icon: typeof PlayCircle }[]> = {
  Naujas: [{ next: "Paskirtas", label: "Paskirtas man", icon: UserCheck }],
  Paskirtas: [{ next: "Vykdomas", label: "Vykdomas", icon: PlayCircle }],
  Vykdomas: [{ next: "Išspręstas", label: "Žymėti išspręstu", icon: CheckCircle }],
  Išspręstas: [
    { next: "Uždarytas", label: "Uždaryti", icon: XCircle },
    { next: "Vykdomas", label: "Atidaryti naujai", icon: PlayCircle },
  ],
  Uždarytas: [],
};

export function IncidentDetail({ incidentId }: IncidentDetailProps) {
  const [, setLocation] = useLocation();
  const { role, currentUserId, currentUserName } = useRole();
  const { toast } = useToast();
  const [notes, setNotes] = useState("");
  const isSpecialist = role === "IT_specialistas"

  const { data: incident, isLoading } = useQuery<IncidentWithDetails>({
    queryKey: ["/api/incidents", incidentId],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: IncidentStatus; notes?: string }) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}/status`, {
        status,
        notes,
        performedBy: currentUserId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/stats"] });
      setNotes("");
      toast({
        title: "Status updated",
        description: "Incident status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const analyzeAiMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/incidents/${incidentId}/analyze`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents", incidentId] });
      toast({
        title: "Analysis complete",
        description: "AI analysis has been generated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze incident",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <IncidentDetailSkeleton />;
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Incident not found</p>
        <Button variant="ghost" onClick={() => setLocation("/")}>
          Go back to dashboard
        </Button>
      </div>
    );
  }

  const transitions = statusTransitions[incident.status] || [];
  const canUpdateStatus = isSpecialist && transitions.length > 0;

  const formatIncidentId = (id: string) => {
    return `INC-${id.slice(0, 6).toUpperCase()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-muted-foreground">
              {formatIncidentId(incident.id)}
            </span>
            <StatusBadge status={incident.status} />
            <SeverityBadge severity={incident.severity} />
            <CategoryBadge category={incident.category} />
          </div>
          <h1 className="text-2xl font-semibold mt-2" data-testid="text-incident-title">
            {incident.title}
          </h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap" data-testid="text-description">
                {incident.description}
              </p>
              {incident.affectedSystems && incident.affectedSystems.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4" />
                    Affected Systems
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {incident.affectedSystems.map((system) => (
                      <span
                        key={system}
                        className="text-xs bg-muted px-2 py-1 rounded capitalize"
                      >
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <AiAnalysisPanel
            incident={incident}
            onAnalyze={() => analyzeAiMutation.mutate()}
            isAnalyzing={analyzeAiMutation.isPending}
          />

          {canUpdateStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Update Status</CardTitle>
                <CardDescription>Change the incident status and add notes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add notes about this update (optional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-20"
                  data-testid="input-notes"
                />
                <div className="flex flex-wrap gap-2">
                  {transitions.map((transition) => (
                    <Button
                      key={transition.next}
                      variant={transition.next === "Išspręstas" || transition.next === "Uždarytas" ? "default" : "outline"}
                      onClick={() => updateStatusMutation.mutate({ status: transition.next, notes })}
                      disabled={updateStatusMutation.isPending}
                      data-testid={`button-${transition.next}`}
                    >
                      {updateStatusMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <transition.icon className="mr-2 h-4 w-4" />
                      )}
                      {transition.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <HistoryTimeline history={incident.history || []} />
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reported By</p>
                  <p className="text-sm font-medium">{incident.reporter?.displayName || "Unknown"}</p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  <p className="text-sm font-medium">
                    {incident.assignee?.displayName || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {format(new Date(incident.createdAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {format(new Date(incident.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              </div>

              {incident.resolvedAt && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm font-medium">
                        {format(new Date(incident.resolvedAt), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {incident.aiTags && incident.aiTags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {incident.aiTags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <SimilarIncidents incidents={incident.similarIncidents || []} />
        </div>
      </div>
    </div>
  );
}

function IncidentDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-96" />
        </div>
      </div>
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
