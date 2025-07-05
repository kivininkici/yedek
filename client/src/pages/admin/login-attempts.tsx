import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
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
  attemptType: 'success' | 'failed_password' | 'failed_security' | 'blocked' | 'failed_math' | 'failed_math_register';
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
    label: 'Güvenlik Hatası',
    color: 'bg-orange-500',
    icon: AlertTriangle,
    variant: 'destructive' as const
  },
  blocked: {
    label: 'Engellendi',
    color: 'bg-red-700',
    icon: Shield,
    variant: 'destructive' as const
  },
  failed_math: {
    label: 'Matematik Hatası',
    color: 'bg-yellow-500',
    icon: XCircle,
    variant: 'secondary' as const
  },
  failed_math_register: {
    label: 'Kayıt Mat. Hatası',
    color: 'bg-yellow-600',
    icon: XCircle,
    variant: 'secondary' as const
  }
};

export default function LoginAttempts() {
  const { isAuthenticated } = useAdminAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Oturum süresi doldu",
        description: "Lütfen tekrar giriş yapın",
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
    ['failed_password', 'failed_security', 'failed_math', 'failed_math_register'].includes(attempt.attemptType)
  ).length;
  const blockedAttempts = loginAttempts.filter(attempt => attempt.attemptType === 'blocked').length;
  const uniqueIPs = new Set(loginAttempts.map(attempt => attempt.ipAddress)).size;

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

  if (isLoading) {
    return (
      <ModernAdminLayout title="Giriş Denemeleri">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </ModernAdminLayout>
    );
  }

  return (
    <ModernAdminLayout title="Giriş Denemeleri">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Giriş Denemeleri</h1>
            <p className="text-gray-400">Son giriş denemeleri ve güvenlik raporları</p>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Başarılı</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{successfulAttempts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Başarısız</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">{failedAttempts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Engellenen</CardTitle>
              <Shield className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{blockedAttempts}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Farklı IP</CardTitle>
              <MapPin className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{uniqueIPs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attempts Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Son Giriş Denemeleri ({loginAttempts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">IP Adresi</TableHead>
                  <TableHead className="text-gray-300">Durum</TableHead>
                  <TableHead className="text-gray-300">Kullanıcı</TableHead>
                  <TableHead className="text-gray-300">Tarih</TableHead>
                  <TableHead className="text-gray-300">Tarayıcı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginAttempts.slice(0, 20).map((attempt) => {
                  const config = attemptTypeConfig[attempt.attemptType] || attemptTypeConfig.failed_password;
                  const IconComponent = config.icon;

                  return (
                    <TableRow key={attempt.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="font-mono text-white">{attempt.ipAddress}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          <Badge variant={config.variant} className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{attempt.username || '-'}</TableCell>
                      <TableCell className="text-gray-300">{formatDate(attempt.createdAt)}</TableCell>
                      <TableCell className="text-gray-400 text-xs">{truncateUserAgent(attempt.userAgent)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </ModernAdminLayout>
  );
}