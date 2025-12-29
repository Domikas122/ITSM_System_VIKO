import { useParams } from "wouter";
import { IncidentDetail } from "@/components/incident-detail";

export default function IncidentDetailPage() {
  const params = useParams<{ id: string }>();
  
  if (!params.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Neteisingas incidento ID</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <IncidentDetail incidentId={params.id} />
    </div>
  );
}
