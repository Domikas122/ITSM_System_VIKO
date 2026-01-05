import { useState, useMemo, useCallback } from "react";
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
  const isSpecialist = role === "IT_specialistas";

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/incidents/stats"],
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.status?.length) params.set("Būklė", filters.status.join(","));
    if (filters.category?.length) params.set("Kategorija", filters.category.join(","));
    if (filters.severity?.length) params.set("Sunkumas", filters.severity.join(","));
    if (filters.dateFrom) params.set("dataNuo", filters.dateFrom);
    if (filters.dateTo) params.set("dataIki", filters.dateTo);
    if (filters.search) params.set("paieška", filters.search);
    if (!isSpecialist) params.set("pranešė", currentUserId);
    return params.toString();
  }, [filters, isSpecialist, currentUserId]);
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
        title: "Paskirtas incidentas",
        description: "Incidentas jums buvo sėkmingai paskirtas.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko paskirti incidento",
        variant: "destructive",
      });
    },
  });

  const handleFiltersChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  const handleAssign = (incidentId: string) => {
    assignMutation.mutate(incidentId);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold" data-testid="text-page-title">
            {isSpecialist ? "Incidentų skydelis" : "Mano incidentai"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isSpecialist 
              ? "Valdykite ir stebėkite visus IT ir kibernetinio saugumo incidentus" 
              : "Peržiūrėkite ir sekite savo praneštus incidentus"}
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
              {isSpecialist ? "Naujas incidentas" : "Pranešti apie incidentą"}
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
