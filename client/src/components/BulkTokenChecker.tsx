import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lock, Upload, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function BulkTokenChecker() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tokens, setTokens] = useState("");
  const [filterType, setFilterType] = useState("all");

  const isPremium = user && (user.role === "premium" || user.role === "admin");

  const bulkCheckMutation = useMutation({
    mutationFn: async (data: { tokens: string[]; type: string }) => {
      const response = await apiRequest("POST", "/api/check-tokens-bulk", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Check Complete",
        description: `Processed ${data.processed} tokens successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/check-history"] });
      setTokens("");
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

  const handleBulkCheck = () => {
    if (!tokens.trim()) {
      toast({
        title: "Error",
        description: "Please enter tokens",
        variant: "destructive",
      });
      return;
    }

    const tokenList = tokens
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (tokenList.length === 0) {
      toast({
        title: "Error",
        description: "No valid tokens found",
        variant: "destructive",
      });
      return;
    }

    // Validate format
    const invalidTokens = tokenList.filter(token => token.split(':').length !== 3);
    if (invalidTokens.length > 0) {
      toast({
        title: "Error",
        description: `${invalidTokens.length} tokens have invalid format`,
        variant: "destructive",
      });
      return;
    }

    bulkCheckMutation.mutate({ tokens: tokenList, type: filterType });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTokens(content);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900">
            {t('checker.bulkCheck')}
          </CardTitle>
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white">
            {t('checker.premium')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="relative">
          {isPremium ? (
            <>
              <Textarea
                placeholder={t('checker.bulkPlaceholder')}
                rows={6}
                value={tokens}
                onChange={(e) => setTokens(e.target.value)}
                className="w-full mb-4"
              />
              
              <div className="flex gap-3 mb-4">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </span>
                  </Button>
                </label>
                
                <Button 
                  onClick={handleBulkCheck}
                  disabled={bulkCheckMutation.isPending || !tokens.trim()}
                  className="ml-auto"
                >
                  {bulkCheckMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Check All
                </Button>
              </div>
            </>
          ) : (
            <>
              <Textarea
                placeholder={t('checker.bulkPlaceholder')}
                rows={6}
                disabled
                className="w-full opacity-50 mb-4"
              />
              <div className="absolute inset-0 bg-gray-50 bg-opacity-75 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {t('checker.upgradeForBulk')}
                  </p>
                  <Button 
                    className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white"
                    onClick={() => window.location.href = '/subscribe'}
                  >
                    {t('checker.upgradeNow')}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
