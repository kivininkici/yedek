import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import DashboardStats from "@/components/DashboardStats";
import TokenChecker from "@/components/TokenChecker";
import BulkTokenChecker from "@/components/BulkTokenChecker";
import TokenParser from "@/components/TokenParser";
import PremiumUpgrade from "@/components/PremiumUpgrade";
import ResultsTable from "@/components/ResultsTable";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Download, Settings } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <TokenChecker />
            <BulkTokenChecker />
            <TokenParser />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <PremiumUpgrade />
            
            {/* Quick Actions */}
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('actions.title')}
                </h3>
                <div className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <History className="w-4 h-4 mr-3 text-gray-400" />
                    {t('actions.viewHistory')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-3 text-gray-400" />
                    {t('actions.exportResults')}
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-3 text-gray-400" />
                    {t('actions.settings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8">
          <ResultsTable />
        </div>
      </main>
    </div>
  );
}
