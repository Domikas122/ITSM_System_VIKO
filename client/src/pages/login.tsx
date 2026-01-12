import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import type { SafeUser } from "@shared/schema";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Prisijungimas nepavyko");
      }

      return response.json() as Promise<SafeUser>;
    },
    onSuccess: () => {
      toast({
        title: "Sėkmingai prisijungta",
        description: "Peradresuojama į pagrindinį puslapį...",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Prisijungimo klaida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Klaida",
        description: "Užpildykite visus laukus",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">IncidentPilot</CardTitle>
          <CardDescription className="text-base">
            Prisijunkite prie incidentų valdymo sistemos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Naudotojo vardas</Label>
              <Input
                id="username"
                type="text"
                placeholder="pvz., dom.kop"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Slaptažodis</Label>
              <Input
                id="password"
                type="password"
                placeholder="Įveskite slaptažodį"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                autoComplete="current-password"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Jungiamasi..." : "Prisijungti"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-semibold text-center mb-3">Demo prisijungimo duomenys:</p>
              <div className="space-y-1 text-xs">
                <p><strong>IT Specialistas:</strong></p>
                <p>• Naudotojas: <code className="bg-muted px-1 py-0.5 rounded">dom.kop</code></p>
                <p>• Slaptažodis: <code className="bg-muted px-1 py-0.5 rounded">mkl23MKL</code></p>
              </div>
              <div className="space-y-1 text-xs mt-3">
                <p><strong>Darbuotojas:</strong></p>
                <p>• Naudotojas: <code className="bg-muted px-1 py-0.5 rounded">ona.mika</code></p>
                <p>• Slaptažodis: <code className="bg-muted px-1 py-0.5 rounded">abc123ABC</code></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
