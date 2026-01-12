import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { IncidentFilters } from "@/components/incident-filters";
import { IncidentTable } from "@/components/incident-table";
import { useRole } from "@/lib/role-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Incident, IncidentFilters as Filters, IncidentCategory } from "@shared/schema";
import { Plus, RefreshCw, List } from "lucide-react";

export default function Incidents() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const categoryParam = params.get("category") as IncidentCategory | null;

  const { role, currentUserId } = useRole();
  const { toast } = useToast();
  const [filters, setFilters] = useState<Filters>({
    category: categoryParam ? [categoryParam] : undefined,
  });
  const isSpecialist = role === "IT_specialistas";

  const queryString = useMemo(() => {
    const queryParams = new URLSearchParams();
    if (filters.status?.length) queryParams.set("status", filters.status.join(","));
    if (filters.category?.length) queryParams.set("category", filters.category.join(","));
    if (filters.severity?.length) queryParams.set("severity", filters.severity.join(","));
    if (filters.dateFrom) queryParams.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) queryParams.set("dateTo", filters.dateTo);
    if (filters.search) queryParams.set("search", filters.search);
    if (!isSpecialist && currentUserId) queryParams.set("reportedBy", currentUserId);
    return queryParams.toString();
  }, [filters, isSpecialist, currentUserId]);
  const { data: incidents, isLoading, refetch } = useQuery<Incident[]>({
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
        title: "Priskirtas incidentas",
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

  const getPageTitle = () => {
    if (categoryParam === "IT") return "IT incidentai";
    if (categoryParam === "Kibernetinis") return "Kibernetinio saugumo incidentai";
    return "Visi incidentai";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <List className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-page-title">
              {getPageTitle()}
            </h1>
            <p className="text-muted-foreground text-sm">
              {incidents?.length || 0} incident{incidents?.length !== 1 ? "s" : ""} found
            </p>
          </div>
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
              Naujas incidentas
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <IncidentFilters filters={filters} onFiltersChange={handleFiltersChange} />
        <IncidentTable 
          incidents={incidents} 
          isLoading={isLoading}
          onAssign={handleAssign}
        />
      </div>
    </div>
  );
}
