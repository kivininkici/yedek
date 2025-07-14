import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Key, Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function PremiumUpgrade() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [premiumKey, setPremiumKey] = useState("");

  const isPremium = user && (user.role === "premium" || user.role === "admin");

  const activateKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await apiRequest("POST", "/api/activate-key", { key });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Premium activated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPremiumKey("");
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

  const handleUpgrade = () => {
    window.location.href = '/subscribe';
  };

  const handleActivateKey = () => {
    if (!premiumKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a premium key",
        variant: "destructive",
      });
      return;
    }
    activateKeyMutation.mutate(premiumKey);
  };

  const getPremiumDaysLeft = () => {
    if (!user?.premiumUntil) return 0;
    const now = new Date();
    const premiumUntil = new Date(user.premiumUntil);
    const diffTime = premiumUntil.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-6">
      {/* Account Status Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('account.status')}
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{t('account.plan')}</span>
              <Badge variant={isPremium ? "default" : "secondary"} className={isPremium ? "bg-gradient-to-r from-amber-400 to-orange-500" : ""}>
                {isPremium ? t('account.premium') : t('account.free')}
              </Badge>
            </div>
            
            {user?.role === "free" && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('account.checksToday')}</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.checksToday}/50
                </span>
              </div>
            )}

            {isPremium && user?.premiumUntil && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Days Remaining</span>
                <span className="text-sm font-medium text-gray-900">
                  {getPremiumDaysLeft()} days
                </span>
              </div>
            )}
            
            {user?.role === "free" && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${(user.checksToday / 50) * 100}%` }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium Key Activation */}
      {!isPremium && (
        <Card className="border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Key className="w-5 h-5 mr-2" />
              Activate Premium Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="premium-key">Premium Key</Label>
              <Input
                id="premium-key"
                placeholder="Enter your premium key"
                value={premiumKey}
                onChange={(e) => setPremiumKey(e.target.value)}
              />
              <Button 
                onClick={handleActivateKey}
                disabled={activateKeyMutation.isPending}
                className="w-full"
              >
                {activateKeyMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Activate Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Upgrade Card */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-amber-400 to-orange-500 border-0 shadow-sm text-white">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Crown className="w-5 h-5 mr-2" />
              {t('premium.title')}
            </h3>
            <p className="text-sm opacity-90 mb-4">
              {t('premium.description')}
            </p>
            <ul className="space-y-2 text-sm mb-4">
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {t('premium.unlimited')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {t('premium.bulk')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {t('premium.parser')}
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                {t('premium.support')}
              </li>
            </ul>
            <Button 
              onClick={handleUpgrade}
              className="w-full bg-white text-orange-600 hover:bg-gray-50 font-medium"
            >
              {t('premium.price')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
