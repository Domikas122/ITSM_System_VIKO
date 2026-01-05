import { createContext, useContext, useState, useMemo } from "react";
import type { UserRole } from "@shared/schema";

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUserId: string;
  currentUserName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>("IT_specialistas");
  
  // Mock current user - in a real app this would come from auth
  const currentUserId = useMemo(() => 
    role === "IT_specialistas" ? "specialist-1" : "employee-1",
    [role]
  );
  const currentUserName = useMemo(() => 
    role === "IT_specialistas" ? "Dominykas Kopijevas" : "Ona Kepenienė",
    [role]
  );
  return (
    <RoleContext.Provider value={{ role, setRole, currentUserId, currentUserName }}>
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
