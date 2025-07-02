import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  email?: string;
  authenticated: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | undefined>({
    queryKey: ["/api/user"],
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // If we got a 401 error, we're definitely not authenticated
  const is401Error = error?.message?.includes("401");

  return {
    user,
    isLoading: isLoading && !is401Error,
    isAuthenticated: !!user,
  };
}
