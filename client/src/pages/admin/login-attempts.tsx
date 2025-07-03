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
        <main className="p-4">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Giriş Denemeleri
            </h1>
            <p className="text-slate-400 mt-2">Admin panel giriş güvenlik logları</p>
          </div>

          {/* Login Attempts Table - Top Priority */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg mb-6"
          >
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Son Giriş Denemeleri
              </h2>
            </div>
            
            <div className="p-6">
              {isLoading ? (
                <div className="text-center py-8 text-slate-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-3">Yükleniyor...</p>
                </div>
              ) : recentAttempts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Shield className="w-16 h-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg">Henüz giriş denemesi bulunmamaktadır.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttempts.map((attempt, index) => {
                    const config = attemptTypeConfig[attempt.attemptType];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={attempt.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600/50 transition-colors border border-slate-200/50 dark:border-slate-600/50"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${config.color}/10`}>
                            <Icon className={`w-5 h-5 ${config.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-base font-medium text-slate-800 dark:text-slate-200">
                                {attempt.ipAddress}
                              </span>
                              <Badge variant={config.variant} className="text-sm">
                                {config.label}
                              </Badge>
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {formatDate(attempt.createdAt)} • {attempt.username || 'Bilinmiyor'}
                            </div>
                          </div>
                        </div>
                        <div className="hidden lg:block text-sm text-slate-400 max-w-xs truncate">
                          {truncateUserAgent(attempt.userAgent)}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Statistics Cards - Bottom */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Başarılı Giriş</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{successfulAttempts}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 p-4 rounded-xl border border-red-200/50 dark:border-red-800/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Başarısız Deneme</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300">{failedAttempts}</p>
                </div>
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-4 rounded-xl border border-orange-200/50 dark:border-orange-800/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Engellenen IP</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{blockedAttempts}</p>
                </div>
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Farklı IP</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{uniqueIPs}</p>
                </div>
                <MapPin className="w-6 h-6 text-blue-500" />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}