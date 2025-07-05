import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getQueryFn } from "@/lib/queryClient";

interface AdminUser {
  id: number;
  username: string;
  email?: string;
}

export function useAdminAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: admin,
    error,
    isLoading,
  } = useQuery<AdminUser | undefined, Error>({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/admin/me");
        if (response.status === 401) {
          return null; // Not authenticated
        }
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        // Any error (including 401) means not authenticated
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 0, // Always fresh for security
    gcTime: 0,
    // Auto-refresh every 30 seconds to check session validity
    refetchInterval: 30000,
  });

  const effectiveIsLoading = isLoading;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/admin/me"], null);
      toast({
        title: "Çıkış başarılı",
        description: "Admin oturumunuz sonlandırıldı",
      });
      window.location.href = "/admin/login";
    },
    onError: (error: Error) => {
      toast({
        title: "Çıkış başarısız",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isAuthenticated = !!admin && admin !== null;

  return {
    admin,
    isLoading: effectiveIsLoading,
    error,
    isAuthenticated,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}