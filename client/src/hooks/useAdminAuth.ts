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
        console.log('Making request to /api/admin/me...');
        const response = await fetch("/api/admin/me");
        console.log('Response status:', response.status);
        if (response.status === 401) {
          console.log('Got 401, returning null');
          return null; // Not authenticated
        }
        if (!response.ok) {
          console.log('Response not ok, throwing error');
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Got admin data:', data);
        return data;
      } catch (error) {
        console.log('Caught error:', error);
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