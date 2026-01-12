import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Shield, 
  Monitor,
  User,
  UserCog,
  Users,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useRole } from "@/lib/role-context";
import { useAuth } from "@/lib/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const specialistMenuItems = [
  { title: "Informacinis skydelis", url: "/", icon: LayoutDashboard },
  { title: "Visi incidentai", url: "/incidents", icon: List },
  { title: "Nauji incidentai", url: "/incidents/new", icon: Plus },
  { title: "Vartotojų valdymas", url: "/users", icon: Users },
];

const employeeMenuItems = [
  { title: "Mano incidentai", url: "/", icon: List },
  { title: "Registruoti incidentą", url: "/incidents/new", icon: Plus },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { role, currentUserName } = useRole();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const menuItems = role === "IT_specialistas" ? specialistMenuItems : employeeMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Incidentų valdymas</span>
            <span className="text-xs text-muted-foreground">IT ir Kibernetinis saugumas</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="nav-it-incidents">
                  <Link href="/incidents?category=it">
                    <Monitor className="h-4 w-4" />
                    <span>IT incidentai</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild data-testid="nav-cyber-incidents">
                  <Link href="/incidents?category=cyber">
                    <Shield className="h-4 w-4" />
                    <span>Kibernetiniai incidentai</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarSeparator className="mb-4" />
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              {role === "IT_specialistas" ? (
                <UserCog className="h-4 w-4 text-muted-foreground" />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{currentUserName || "Vartotojas"}</span>
              <Badge variant="secondary" className="w-fit text-xs">
                {role === "IT_specialistas" ? "IT Specialistas" : "Darbuotojas"}
              </Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", {
                  method: "POST",
                  credentials: "include",
                });
                queryClient.clear();
                window.location.href = "/login";
              } catch (error) {
                toast({
                  title: "Klaida",
                  description: "Nepavyko atsijungti",
                  variant: "destructive",
                });
              }
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Atsijungti
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
