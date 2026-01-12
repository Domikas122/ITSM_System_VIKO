import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useRole } from "@/lib/role-context";
import { createIncidentFormSchema, type CreateIncidentForm, type SeverityLevel } from "@shared/schema";
import { Loader2, AlertTriangle, Shield, Monitor, Server, Database, Cloud, Network, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import type { FieldValues, UseFormSetValue } from "react-hook-form";

const affectedSystemOptions = [
  { id: "email", label: "El. pašto sistema", icon: Server },
  { id: "network", label: "Tinklas", icon: Network },
  { id: "database", label: "Duomenų bazė", icon: Database },
  { id: "cloud", label: "Debesų paslaugos", icon: Cloud },
  { id: "workstation", label: "Darbalaukiai", icon: Laptop },
  { id: "servers", label: "Serveriai", icon: Server },
];

const severityOptions: { value: SeverityLevel; label: string; description: string; color: string }[] = [
  { value: "Kritinis", label: "Kritinis", description: "Reikia imtis neatidėliotinų veiksmų", color: "border-red-500 bg-red-50 dark:bg-red-900/20" },
  { value: "Aukštas", label: "Aukštas", description: "Reikia skubios pagalbos", color: "border-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  { value: "Vidutinis", label: "Vidutinis", description: "Įprastas prioritetas", color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
  { value: "Žemas", label: "Žemas", description: "Mažas poveikis", color: "border-green-500 bg-green-50 dark:bg-green-900/20" },
];

interface SystemButtonProps {
  system: typeof affectedSystemOptions[0];
  isSelected: boolean;
  onChange: (id: string) => void;
}

const SystemButton = memo(function SystemButton({ system, isSelected, onChange }: SystemButtonProps) {
  const handleClick = useCallback(() => {
    onChange(system.id);
  }, [system.id, onChange]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:bg-muted/50"
      )}
      data-testid={`system-${system.id}`}
    >
      <Checkbox
        checked={isSelected}
        className="pointer-events-none"
      />
      <system.icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm">{system.label}</span>
    </button>
  );
});

export function IncidentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentUserId } = useRole();

  const form = useForm<CreateIncidentForm>({
    resolver: zodResolver(createIncidentFormSchema),
    defaultValues: {
      title: "",
      description: "Aprašymas",
      category: "IT",
      severity: "Vidutinis",
      affectedSystems: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateIncidentForm) => {
      const response = await apiRequest("POST", "/api/incidents", {
        ...data,
        reportedBy: currentUserId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/stats"] });
      toast({
        title: "Incidentas sukurtas",
        description: "Jūsų incidentas buvo sėkmingai pateiktas.",
      });
      setLocation(`/incidents/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Klaida",
        description: error.message || "Nepavyko sukurti incidento",
        variant: "destructive",
      });
    },
  });

  const handleSystemToggle = useCallback((fieldValue: string[], onChange: (value: string[]) => void, id: string) => {
    const current = fieldValue || [];
    onChange(
      current.includes(id)
        ? current.filter((i: string) => i !== id)
        : [...current, id]
    );
  }, []);

  const onSubmit = (data: CreateIncidentForm) => {
    createMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Pranešti apie naują incidentą
        </CardTitle>
        <CardDescription>
          Pateikite išsamią informaciją apie IT arba kibernetinio saugumo incidentą.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incidento pavadinimas</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Trumpas problemos aprašymas" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormDescription>
                    Trumpa incidento santrauka (bent 5 simboliai)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorija</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => field.onChange("IT")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        field.value === "IT"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      data-testid="category-it"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        field.value === "IT" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">IT Incidentas</p>
                        <p className="text-xs text-muted-foreground">Aparatinė įranga, programinė įranga, tinklo problemos</p>
                      </div>
                    </div>
                    <div
                      onClick={() => field.onChange("Kibernetinis")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        field.value === "Kibernetinis"
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                          : "border-border hover:border-rose-500/50"
                      )}
                      data-testid="category-cyber"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        field.value === "Kibernetinis" ? "bg-rose-500 text-white" : "bg-muted"
                      )}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Kibernetinis saugumas</p>
                        <p className="text-xs text-muted-foreground">Saugumo grėsmės, pažeidimai, atakos</p>
                      </div>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="severity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lygis</FormLabel>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-3"
                  >
                    {severityOptions.map((option) => (
                      <div key={option.value}>
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={option.value}
                          className={cn(
                            "flex flex-col p-3 rounded-lg border-2 cursor-pointer transition-all",
                            "peer-data-[state=checked]:border-l-4",
                            field.value === option.value ? option.color : "border-border hover:bg-muted/50"
                          )}
                          data-testid={`severity-${option.value}`}
                        >
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Išsamus aprašymas</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Išsamiai aprašykite incidentą: kas nutiko, kada prasidėjo, ką bandėte..."
                      className="min-h-32 resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormDescription>
                    Įtraukite kuo daugiau detalių (mažiausiai 20 simbolių)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="affectedSystems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paveiktos sistemos (neprivaloma)</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {affectedSystemOptions.map((system) => (
                      <SystemButton
                        key={system.id}
                        system={system}
                        isSelected={(field.value || []).includes(system.id)}
                        onChange={(id) => handleSystemToggle(field.value || [], field.onChange, id)}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                className="flex-1"
                data-testid="button-cancel"
              >
                Atšaukti
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="flex-1"
                data-testid="button-submit"
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Pateikti incidentą
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
