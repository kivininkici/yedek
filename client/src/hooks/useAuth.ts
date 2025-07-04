import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  email?: string;
  avatarId?: number;
  authenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error, isSuccess } = useQuery<User | undefined>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // If we got a 401 error, we're definitely not authenticated
  const is401Error = error?.message?.includes("401") || error?.message?.includes("Giriş yapılmamış");

  return {
    user,
    isLoading: isLoading && !is401Error && !isSuccess,
    isAuthenticated: !!user,
  };
}
