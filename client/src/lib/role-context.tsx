import { createContext, useContext, useMemo } from "react";
import type { UserRole } from "@shared/schema";
import { useAuth } from "./use-auth";

interface RoleContextType {
  role: UserRole;
  currentUserId: string | null;
  currentUserName: string | null;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const value = useMemo(() => ({
    role: user?.role || "Darbuotojas",
    currentUserId: user?.id || null,
    currentUserName: user?.displayName || null,
  }), [user]);
  
  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
