import { 
  LayoutDashboard, 
  Plus, 
  List, 
  Shield, 
  Monitor,
  User,
  UserCog
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const specialistMenuItems = [
  { title: "Informacinis skydelis", url: "/", icon: LayoutDashboard },
  { title: "Visi incidentai", url: "/incidents", icon: List },
  { title: "Nauji incidentai", url: "/incidents/new", icon: Plus },
];

const employeeMenuItems = [
  { title: "Mano incidentai", url: "/", icon: List },
  { title: "Registruoti incidentą", url: "/incidents/new", icon: Plus },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { role, setRole, currentUserName } = useRole();
  
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
              <span className="text-sm font-medium">{currentUserName}</span>
              <Badge variant="secondary" className="w-fit text-xs capitalize">
                {role}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={role === "Darbuotojas" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setRole("Darbuotojas")}
              data-testid="button-role-employee"
            >
              Darbuotojas
            </Button>
            <Button
              variant={role === "IT_specialistas" ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => setRole("IT_specialistas")}
              data-testid="button-role-specialist"
            >
              IT_specialistas
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
