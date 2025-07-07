import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5000, // Allow user data to be fresh for 5 seconds during impersonation
    refetchOnWindowFocus: true, // Refetch user when window gains focus
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (response.status === 401) {
        // 401 is expected when not authenticated - return null instead of throwing
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    authError: error,
  };
}
