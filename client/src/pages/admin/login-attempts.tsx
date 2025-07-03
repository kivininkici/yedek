import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import { motion } from "framer-motion";
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
    label: 'Güvenlik Sorusu Hatası',
    color: 'bg-orange-500',
    icon: AlertTriangle,
    variant: 'secondary' as const
  },
  failed_math: {
    label: 'Matematik Doğrulama Hatası (Giriş)',
    color: 'bg-purple-500',
    icon: Monitor,
    variant: 'secondary' as const
  },
  failed_math_register: {
    label: 'Matematik Doğrulama Hatası (Kayıt)',
    color: 'bg-indigo-500',
    icon: Monitor,
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
    ['failed_password', 'failed_security', 'failed_math', 'failed_math_register'].includes(attempt.attemptType)
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
        {/* GİRİŞ DENEMELERİ - EN ÜSTTE */}
        <div className="bg-white dark:bg-slate-800 shadow-sm">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
              🔐 GİRİŞ DENEMELERİ
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-300">Canlı güvenlik logları</p>
          </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-600 mx-auto"></div>
              <p className="mt-6 text-xl font-semibold">Yükleniyor...</p>
            </div>
          ) : recentAttempts.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="w-24 h-24 mx-auto mb-6 text-slate-400" />
              <p className="text-2xl font-bold text-slate-600">Giriş denemesi bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => {
                const config = attemptTypeConfig[attempt.attemptType];
                const Icon = config.icon;
                return (
                  <div
                    key={attempt.id}
                    className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border-2 border-slate-200 dark:border-slate-600 shadow-lg hover:shadow-xl transition-all hover:border-blue-300 dark:hover:border-blue-600"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-full ${config.color}/30 border-2 ${config.color.replace('bg-', 'border-')}`}>
                          <Icon className={`w-8 h-8 ${config.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="font-mono text-2xl font-bold text-slate-900 dark:text-white">
                              {attempt.ipAddress}
                            </span>
                            <Badge variant={config.variant} className="text-base font-bold px-3 py-1">
                              {config.label}
                            </Badge>
                          </div>
                          <div className="text-lg text-slate-600 dark:text-slate-400">
                            <span className="font-semibold">{formatDate(attempt.createdAt)}</span>
                            {attempt.username && (
                              <span className="ml-3">• Kullanıcı: {attempt.username}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {attempt.userAgent && (
                        <div className="hidden lg:block text-sm text-slate-500 max-w-lg truncate bg-white dark:bg-slate-800 p-3 rounded-lg border">
                          {truncateUserAgent(attempt.userAgent)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </div>

        {/* İSTATİSTİKLER - ALTTA */}
        <div className="p-4 mt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📊 İstatistikler</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 dark:text-green-400 font-medium">Başarılı</p>
                  <p className="text-2xl font-bold text-green-800 dark:text-green-300">{successfulAttempts}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 dark:text-red-400 font-medium">Başarısız</p>
                  <p className="text-2xl font-bold text-red-800 dark:text-red-300">{failedAttempts}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-700 dark:text-orange-400 font-medium">Engellenen</p>
                  <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">{blockedAttempts}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 dark:text-blue-400 font-medium">Farklı IP</p>
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{uniqueIPs}</p>
                </div>
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}