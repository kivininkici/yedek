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
    isSuccess,
  } = useQuery<AdminUser | undefined, Error>({
    queryKey: ["/api/admin/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // If we got a 401 error, we're definitely not authenticated
  const is401Error = error?.message?.includes("401");
  const effectiveIsLoading = isLoading && !is401Error && !isSuccess;

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

  return {
    admin,
    isLoading: effectiveIsLoading,
    error,
    isAuthenticated: !!admin,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}