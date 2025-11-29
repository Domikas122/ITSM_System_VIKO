import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
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
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

const affectedSystemOptions = [
  { id: "email", label: "Email System", icon: Server },
  { id: "network", label: "Network", icon: Network },
  { id: "database", label: "Database", icon: Database },
  { id: "cloud", label: "Cloud Services", icon: Cloud },
  { id: "workstation", label: "Workstations", icon: Laptop },
  { id: "servers", label: "Servers", icon: Server },
];

const severityOptions: { value: SeverityLevel; label: string; description: string; color: string }[] = [
  { value: "critical", label: "Critical", description: "Immediate action required", color: "border-red-500 bg-red-50 dark:bg-red-900/20" },
  { value: "high", label: "High", description: "Urgent attention needed", color: "border-orange-500 bg-orange-50 dark:bg-orange-900/20" },
  { value: "medium", label: "Medium", description: "Normal priority", color: "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
  { value: "low", label: "Low", description: "Low impact issue", color: "border-green-500 bg-green-50 dark:bg-green-900/20" },
];

export function IncidentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currentUserId } = useRole();
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const form = useForm<CreateIncidentForm>({
    resolver: zodResolver(createIncidentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "it",
      severity: "medium",
      affectedSystems: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateIncidentForm) => {
      const response = await apiRequest("POST", "/api/incidents", {
        ...data,
        affectedSystems: selectedSystems,
        reportedBy: currentUserId,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents/stats"] });
      toast({
        title: "Incident created",
        description: "Your incident has been submitted successfully.",
      });
      setLocation(`/incidents/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create incident",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateIncidentForm) => {
    createMutation.mutate(data);
  };

  const toggleSystem = (systemId: string) => {
    setSelectedSystems((prev) =>
      prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : [...prev, systemId]
    );
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Report New Incident
        </CardTitle>
        <CardDescription>
          Provide detailed information about the IT or cyber security incident.
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
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief description of the issue" 
                      {...field} 
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormDescription>
                    A concise summary of the incident (minimum 5 characters)
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
                  <FormLabel>Category</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => field.onChange("it")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        field.value === "it"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                      data-testid="category-it"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        field.value === "it" ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <Monitor className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">IT Incident</p>
                        <p className="text-xs text-muted-foreground">Hardware, software, network issues</p>
                      </div>
                    </div>
                    <div
                      onClick={() => field.onChange("cyber")}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                        field.value === "cyber"
                          ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                          : "border-border hover:border-rose-500/50"
                      )}
                      data-testid="category-cyber"
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        field.value === "cyber" ? "bg-rose-500 text-white" : "bg-muted"
                      )}>
                        <Shield className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">Cyber Security</p>
                        <p className="text-xs text-muted-foreground">Security threats, breaches, attacks</p>
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
                  <FormLabel>Severity Level</FormLabel>
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
                  <FormLabel>Detailed Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the incident in detail: what happened, when it started, what you've tried..."
                      className="min-h-32 resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormDescription>
                    Include as much detail as possible (minimum 20 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <Label>Affected Systems (Optional)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {affectedSystemOptions.map((system) => (
                  <div
                    key={system.id}
                    onClick={() => toggleSystem(system.id)}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all",
                      selectedSystems.includes(system.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    )}
                    data-testid={`system-${system.id}`}
                  >
                    <Checkbox
                      checked={selectedSystems.includes(system.id)}
                      className="pointer-events-none"
                    />
                    <system.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{system.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                className="flex-1"
                data-testid="button-cancel"
              >
                Cancel
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
                Submit Incident
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
