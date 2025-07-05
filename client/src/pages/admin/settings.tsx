import { useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  if (isLoading || !admin) {
    return (
      <ModernAdminLayout title="Sistem Ayarları">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout title="Sistem Ayarları">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Sistem Ayarları</h1>
            <p className="text-gray-400">Uygulama ayarlarını yapılandırın</p>
          </div>
        </div>

        {/* Settings Content */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              Sistem Ayarları
            </h3>
            <p className="text-gray-400">
              Bu bölüm yakında gelecek
            </p>
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
}
