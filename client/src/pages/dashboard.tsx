import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatsCards, CategoryStats } from "@/components/stats-cards";
import { IncidentFilters } from "@/components/incident-filters";
import { IncidentTable } from "@/components/incident-table";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Incident, DashboardStats, IncidentFilters as Filters } from "@shared/schema";
import { Plus, RefreshCw } from "lucide-react";

export default function Dashboard() {
  const { role, currentUserId, currentUserName } = useRole();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({});
  const isSpecialist = role === "specialist";

  const buildQueryString = (filters: Filters) => {
    const params = new URLSearchParams();
    if (filters.status?.length) params.set("status", filters.status.join(","));
    if (filters.category?.length) params.set("category", filters.category.join(","));
    if (filters.severity?.length) params.set("severity", filters.severity.join(","));
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.search) params.set("search", filters.search);
    if (!isSpecialist) params.set("reportedBy", currentUserId);
    return params.toString();
  };

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/incidents/stats"],
  });

  const queryString = buildQueryString(filters);
  const { data: incidents, isLoading: incidentsLoading, refetch } = useQuery<Incident[]>({
    queryKey: ["/api/incidents", queryString],
  });

  const assignMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const response = await apiRequest("PATCH", `/api/incidents/${incidentId}/assign`, {
        assignedTo: currentUserId,
        performedBy: currentUserId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/stats"] });
      toast({
        title: "Incident assigned",
        description: "The incident has been assigned to you.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign incident",
        variant: "destructive",
      });
    },
  });

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleAssign = (incidentId: string) => {
    assignMutation.mutate(incidentId);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            {isSpecialist ? "Incident Dashboard" : "My Incidents"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSpecialist 
              ? "Manage and monitor all IT and cyber security incidents" 
              : "View and track your reported incidents"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => refetch()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Link href="/incidents/new">
            <Button data-testid="button-new-incident">
              <Plus className="h-4 w-4 mr-2" />
              {isSpecialist ? "New Incident" : "Report Incident"}
            </Button>
          </Link>
        </div>
      </div>

      {isSpecialist && (
        <>
          <StatsCards stats={stats} isLoading={statsLoading} />
          <CategoryStats stats={stats} isLoading={statsLoading} />
        </>
      )}

      <div className="space-y-4">
        <IncidentFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <IncidentTable 
          incidents={incidents} 
          isLoading={incidentsLoading}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
}
