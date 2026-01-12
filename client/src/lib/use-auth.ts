import { useQuery } from "@tanstack/react-query";
import type { SafeUser } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error("Nepavyko gauti vartotojo");
      }

      return response.json() as Promise<SafeUser>;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
  };
}
