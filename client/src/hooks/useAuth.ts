import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 5000, // Allow user data to be fresh for 5 seconds during impersonation
    refetchOnWindowFocus: true, // Refetch user when window gains focus
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
