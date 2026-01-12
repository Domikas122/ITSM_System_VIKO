import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Users, Shield, User } from "lucide-react";
import type { SafeUser, UserRole } from "@shared/schema";

export default function UserManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    displayName: "",
    role: "Darbuotojas" as UserRole,
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Nepavyko gauti vartotojų");
      }
      return response.json() as Promise<SafeUser[]>;
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Nepavyko sukurti vartotojo");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Vartotojas sukurtas",
        description: "Naujas vartotojas sėkmingai sukurtas",
      });
      setIsDialogOpen(false);
      setNewUser({
        username: "",
        password: "",
        displayName: "",
        role: "Darbuotojas",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Klaida",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.displayName) {
      toast({
        title: "Klaida",
        description: "Užpildykite visus laukus",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const getRoleBadge = (role: UserRole) => {
    if (role === "IT_specialistas") {
      return (
        <Badge variant="default" className="gap-1">
          <Shield className="h-3 w-3" />
          IT Specialistas
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <User className="h-3 w-3" />
        Darbuotojas
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Vartotojų valdymas
          </h1>
          <p className="text-muted-foreground mt-1">
            Kurkite ir valdykite sistemos vartotojus
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Naujas vartotojas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sukurti naują vartotoją</DialogTitle>
              <DialogDescription>
                Įveskite naujo vartotojo informaciją
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="username">Naudotojo vardas *</Label>
                <Input
                  id="username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="pvz., petras.slekys"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Pilnas vardas *</Label>
                <Input
                  id="displayName"
                  value={newUser.displayName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, displayName: e.target.value })
                  }
                  placeholder="pvz., Petras Šlekys"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Slaptažodis *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="Saugus slaptažodis"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Vaidmuo *</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: UserRole) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Darbuotojas">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Darbuotojas
                      </div>
                    </SelectItem>
                    <SelectItem value="IT_specialistas">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        IT Specialistas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Atšaukti
                </Button>
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Kuriama..." : "Sukurti"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visi vartotojai</CardTitle>
          <CardDescription>
            {users ? `Iš viso vartotojų: ${users.length}` : "Įkeliama..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Kraunama...
            </div>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naudotojo vardas</TableHead>
                  <TableHead>Pilnas vardas</TableHead>
                  <TableHead>Vaidmuo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.username}</TableCell>
                    <TableCell>{user.displayName}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nerasta vartotojų
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
