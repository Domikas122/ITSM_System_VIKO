import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleProvider } from "@/lib/role-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Dashboard from "@/pages/dashboard";
import Incidents from "@/pages/incidents";
import NewIncident from "@/pages/new-incident";
import IncidentDetailPage from "@/pages/incident-detail";
import Login from "@/pages/login";
import UserManagement from "@/pages/user-management";
import NotFound from "@/pages/not-found";
import { useMemo } from "react";
import { useAuth } from "@/lib/use-auth";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Kraunama...</div>
      </div>
    );
  }

  if (!user) {
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/incidents" component={() => <ProtectedRoute component={Incidents} />} />
      <Route path="/incidents/new" component={() => <ProtectedRoute component={NewIncident} />} />
      <Route path="/incidents/:id" component={() => <ProtectedRoute component={IncidentDetailPage} />} />
      <Route path="/users" component={() => <ProtectedRoute component={UserManagement} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = useMemo(() => ({
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="incident-ui-theme">
        <RoleProvider>
          <TooltipProvider>
            <SidebarProvider style={style}>
              <div className="flex h-screen w-full">
                <AppSidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <header className="flex h-14 items-center justify-between gap-4 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <SidebarTrigger data-testid="button-sidebar-toggle" />
                    <ThemeToggle />
                  </header>
                  <main className="flex-1 overflow-auto bg-muted/30">
                    <Router />
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
