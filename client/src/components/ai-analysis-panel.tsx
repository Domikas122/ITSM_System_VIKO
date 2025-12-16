import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { IncidentWithDetails } from "@shared/schema";
import { Sparkles, Loader2, Lightbulb, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiAnalysisPanelProps {
  incident: IncidentWithDetails;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export function AiAnalysisPanel({ incident, onAnalyze, isAnalyzing }: AiAnalysisPanelProps) {
  const hasAnalysis = incident.aiAnalysis || (incident.aiTags && incident.aiTags.length > 0);

  return (
    <Card className={cn(
      "border-l-4",
      hasAnalysis ? "border-l-primary bg-primary/5" : "border-l-muted"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              hasAnalysis ? "bg-primary/10" : "bg-muted"
            )}>
              <Brain className={cn(
                "h-4 w-4",
                hasAnalysis ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">AI analizė</CardTitle>
              <CardDescription>
                Automatinė incidentų analizė ir rekomendacijos
              </CardDescription>
            </div>
          </div>
          <Button
            variant={hasAnalysis ? "outline" : "default"}
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            data-testid="button-analyze"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analizuojama...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                {hasAnalysis ? "Pakartotinai analizuoti" : "Analizuoti su AI"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasAnalysis ? (
          <div className="space-y-4">
            {incident.aiAnalysis && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Analizės santrauka</span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-6" data-testid="text-ai-analysis">
                  {incident.aiAnalysis}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">
              Spustelėkite „Analizuoti su AI“, kad gautumėte automatinę analizę, kategorizavimo pasiūlymus ir rastumėte panašius ankstesnius incidentus.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
