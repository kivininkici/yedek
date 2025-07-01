import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  MapPin,
  Monitor
} from "lucide-react";
import { useEffect } from "react";

interface LoginAttempt {
  id: number;
  ipAddress: string;
  username?: string;
  attemptType: 'success' | 'failed_password' | 'failed_security' | 'blocked';
  userAgent?: string;
  createdAt: string;
}

const attemptTypeConfig = {
  success: {
    label: 'Başarılı',
    color: 'bg-green-500',
    icon: CheckCircle,
    variant: 'default' as const
  },
  failed_password: {
    label: 'Şifre Hatası',
    color: 'bg-red-500',
    icon: XCircle,
    variant: 'destructive' as const
  },
  failed_security: {
    label: 'Güvenlik Sorusu Hatası',
    color: 'bg-orange-500',
    icon: AlertTriangle,
    variant: 'secondary' as const
  },
  blocked: {
    label: 'Engellendi',
    color: 'bg-gray-500',
    icon: Shield,
    variant: 'outline' as const
  }
};

export default function LoginAttempts() {
  const { toast } = useToast();
  const { isAuthenticated } = useAdminAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, toast]);

  const { data: loginAttempts = [], isLoading, error } = useQuery<LoginAttempt[]>({
    queryKey: ["/api/admin/login-attempts"],
    retry: (failureCount, error) => {
      if (isUnauthorizedError(error as Error)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  if (error && isUnauthorizedError(error as Error)) {
    return null;
  }

  const successfulAttempts = loginAttempts.filter(attempt => attempt.attemptType === 'success').length;
  const failedAttempts = loginAttempts.filter(attempt => 
    ['failed_password', 'failed_security'].includes(attempt.attemptType)
  ).length;
  const blockedAttempts = loginAttempts.filter(attempt => attempt.attemptType === 'blocked').length;
  const uniqueIPs = new Set(loginAttempts.map(attempt => attempt.ipAddress)).size;

  const recentAttempts = loginAttempts.slice(0, 10);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateUserAgent = (userAgent: string | undefined) => {
    if (!userAgent) return 'Bilinmiyor';
    return userAgent.length > 50 ? userAgent.substring(0, 50) + '...' : userAgent;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar />
      <div className="lg:ml-64">
        <Header title="Giriş Denemeleri" description="Admin panel giriş güvenlik logları" />
        <main className="p-4 lg:p-6">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Giriş Denemeleri
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Admin panel giriş güvenlik logları
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Başarılı Giriş"
              value={successfulAttempts}
              icon={CheckCircle}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Başarısız Deneme"
              value={failedAttempts}
              icon={XCircle}
              iconColor="text-red-500"
            />
            <StatsCard
              title="Engellenen IP"
              value={blockedAttempts}
              icon={Shield}
              iconColor="text-orange-500"
            />
            <StatsCard
              title="Farklı IP"
              value={uniqueIPs}
              icon={MapPin}
              iconColor="text-blue-500"
            />
          </div>

          {/* Recent Login Attempts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Son Giriş Denemeleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  Giriş denemeleri yükleniyor...
                </div>
              ) : recentAttempts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Henüz giriş denemesi bulunmamaktadır.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>IP Adresi</TableHead>
                        <TableHead>Kullanıcı Adı</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="hidden lg:table-cell">User Agent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAttempts.map((attempt) => {
                        const config = attemptTypeConfig[attempt.attemptType];
                        const Icon = config.icon;
                        
                        return (
                          <TableRow key={attempt.id}>
                            <TableCell className="font-mono text-sm">
                              {formatDate(attempt.createdAt)}
                            </TableCell>
                            <TableCell className="font-mono">
                              {attempt.ipAddress}
                            </TableCell>
                            <TableCell>
                              {attempt.username || 'Bilinmiyor'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
                                <Icon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                              {truncateUserAgent(attempt.userAgent)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}