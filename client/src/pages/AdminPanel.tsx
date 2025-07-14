import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, DollarSign, Key, Plus, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";

export default function AdminPanel() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [keyDuration, setKeyDuration] = useState("");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: "Unauthorized",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: keys = [] } = useQuery({
    queryKey: ["/api/admin/keys"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createKeyMutation = useMutation({
    mutationFn: async (duration: number) => {
      const response = await apiRequest("POST", "/api/admin/create-key", { duration });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Key Created",
        description: `Premium key created: ${data.key}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      setKeyDuration("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    const duration = parseInt(keyDuration);
    if (!duration || duration < 1) {
      toast({
        title: "Error",
        description: "Please enter a valid duration",
        variant: "destructive",
      });
      return;
    }
    createKeyMutation.mutate(duration);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const stats = {
    totalUsers: users.length,
    premiumUsers: users.filter((u: any) => u.role === "premium" || u.role === "admin").length,
    revenue: users.filter((u: any) => u.role === "premium").length * 9.99,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 ml-4">
              {t('admin.title')}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.totalUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <Crown className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.premiumUsers')}</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.premiumUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('admin.revenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.revenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Key Generation */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                {t('admin.createKey')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="duration">{t('admin.duration')}</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter duration in days"
                    value={keyDuration}
                    onChange={(e) => setKeyDuration(e.target.value)}
                    min="1"
                  />
                </div>
                <Button 
                  onClick={handleCreateKey}
                  disabled={createKeyMutation.isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t('admin.generateKey')}
                </Button>
              </div>

              {/* Available Keys */}
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">{t('admin.availableKeys')}</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {keys.length === 0 ? (
                    <p className="text-sm text-gray-500">No keys created yet</p>
                  ) : (
                    keys.map((key: any) => (
                      <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <code className="text-sm font-mono">{key.key}</code>
                          <div className="text-xs text-gray-500 mt-1">
                            {key.duration} days • Created {format(new Date(key.createdAt), 'MMM dd')}
                          </div>
                        </div>
                        <Badge variant={key.isUsed ? "secondary" : "default"}>
                          {key.isUsed ? "Used" : "Available"}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>{t('admin.userManagement')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500">No users found</p>
                ) : (
                  users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user.email
                            }
                          </div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                          <div className="text-xs text-gray-400">
                            Checks today: {user.checksToday || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={user.role === "premium" || user.role === "admin" ? "default" : "secondary"}
                          className={user.role === "premium" || user.role === "admin" ? "bg-gradient-to-r from-amber-400 to-orange-500" : ""}
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
