import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function TokenChecker() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [token, setToken] = useState("");
  const [filterType, setFilterType] = useState("all");

  const checkTokenMutation = useMutation({
    mutationFn: async (data: { token: string; type: string }) => {
      const response = await apiRequest("POST", "/api/check-token", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.result.valid ? t('message.tokenValid') : t('message.tokenInvalid'),
        description: data.result.valid 
          ? `Servers: ${data.result.servers}, Friends: ${data.result.friends}`
          : t('message.tokenInvalid'),
        variant: data.result.valid ? "default" : "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/check-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setToken("");
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

  const handleSingleCheck = () => {
    if (!token.trim()) {
      toast({
        title: "Error",
        description: "Please enter a token",
        variant: "destructive",
      });
      return;
    }

    const parts = token.split(':');
    if (parts.length !== 3) {
      toast({
        title: "Error",
        description: t('message.invalidFormat'),
        variant: "destructive",
      });
      return;
    }

    checkTokenMutation.mutate({ token, type: filterType });
  };

  const canCheck = user && (user.role === "free" ? user.checksToday < 50 : true);

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-900">
          {t('checker.title')}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {t('checker.description')}
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Filter Options */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            {t('checker.filterType')}
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {t('checker.all')}
            </Button>
            <Button
              variant={filterType === "outlook" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("outlook")}
            >
              {t('checker.outlook')}
            </Button>
            <Button
              variant={filterType === "token" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("token")}
            >
              {t('checker.token')}
            </Button>
          </div>
        </div>

        {/* Single Token Input */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2">
            {t('checker.singleCheck')}
          </Label>
          <div className="flex gap-3 mt-2">
            <Input
              type="text"
              placeholder={t('checker.tokenPlaceholder')}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1"
              disabled={!canCheck}
            />
            <Button 
              onClick={handleSingleCheck}
              disabled={checkTokenMutation.isPending || !canCheck}
              className="px-6"
            >
              {checkTokenMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {t('checker.check')}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Format: outlook:outlook_password:token
          </p>
          
          {!canCheck && user?.role === "free" && (
            <div className="mt-2">
              <Badge variant="destructive">
                {t('message.dailyLimitReached')} ({user.checksToday}/50)
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
