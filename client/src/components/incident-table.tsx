import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, SeverityDot, CategoryBadge } from "@/components/status-badge";
import type { Incident } from "@shared/schema";
import { format } from "date-fns";
import { Eye, UserPlus } from "lucide-react";
import { useRole } from "@/lib/role-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface IncidentTableProps {
  incidents?: Incident[];
  isLoading?: boolean;
  onAssign?: (incidentId: string) => void;
}

export function IncidentTable({ incidents, isLoading, onAssign }: IncidentTableProps) {
  const { role } = useRole();
  const isSpecialist = role === "IT_specialistas";
  const isMobile = useIsMobile();

  const formatIncidentId = (id: string) => {
    return `INC-${id.slice(0, 6).toUpperCase()}`;
  };

  if (isLoading) {
    if (isMobile) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full mb-3" />
                <div className="flex gap-2 mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    return (
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="w-[80px]">Category</TableHead>
              <TableHead className="w-[100px]">Severity</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
              <TableHead className="w-[140px]">Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-16" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!incidents?.length) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No incidents found</p>
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="space-y-3">
        {incidents.map((incident) => (
          <Card 
            key={incident.id} 
            className="hover-elevate cursor-pointer"
            data-testid={`row-incident-${incident.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {formatIncidentId(incident.id)}
                    </span>
                    <CategoryBadge category={incident.category} />
                  </div>
                  <Link href={`/incidents/${incident.id}`}>
                    <h3 className="font-medium text-sm hover:text-primary hover:underline line-clamp-2 mb-2">
                      {incident.title}
                    </h3>
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StatusBadge status={incident.status} />
                <div className="flex items-center gap-1.5">
                  <SeverityDot severity={incident.severity} />
                  <span className="text-xs capitalize text-muted-foreground">{incident.severity}</span>
                </div>
              </div>

              {incident.aiTags && incident.aiTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {incident.aiTags.slice(0, 3).map((tag, i) => (
                    <span 
                      key={i} 
                      className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(incident.createdAt), "MMM d, yyyy")}
                </span>
                <div className="flex items-center gap-1">
                  <Link href={`/incidents/${incident.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-view-${incident.id}`}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      <span className="text-xs">View</span>
                    </Button>
                  </Link>
                  {isSpecialist && incident.status === "Naujas" && !incident.assignedTo && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onAssign?.(incident.id)}
                      data-testid={`button-assign-${incident.id}`}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop Table View

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[100px] font-semibold">ID</TableHead>
            <TableHead className="font-semibold">Title</TableHead>
            <TableHead className="w-[80px] font-semibold">Category</TableHead>
            <TableHead className="w-[100px] font-semibold">Severity</TableHead>
            <TableHead className="w-[120px] font-semibold">Status</TableHead>
            <TableHead className="w-[140px] font-semibold">Created</TableHead>
            <TableHead className="w-[100px] font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {incidents.map((incident) => (
            <TableRow 
              key={incident.id} 
              className="hover-elevate cursor-pointer"
              data-testid={`row-incident-${incident.id}`}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                {formatIncidentId(incident.id)}
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Link href={`/incidents/${incident.id}`}>
                    <span className="font-medium hover:text-primary hover:underline line-clamp-1">
                      {incident.title}
                    </span>
                  </Link>
                  {incident.aiTags && incident.aiTags.length > 0 && (
                    <div className="flex gap-1">
                      {incident.aiTags.slice(0, 2).map((tag, i) => (
                        <span 
                          key={i} 
                          className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <CategoryBadge category={incident.category} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <SeverityDot severity={incident.severity} />
                  <span className="text-sm capitalize">{incident.severity}</span>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={incident.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {format(new Date(incident.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/incidents/${incident.id}`}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`button-view-${incident.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {isSpecialist && incident.status === "Naujas" && !incident.assignedTo && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onAssign?.(incident.id)}
                      data-testid={`button-assign-${incident.id}`}
                    >
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
