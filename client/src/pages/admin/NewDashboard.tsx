import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Shield, 
  Users, 
  Key, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Clock,
  DollarSign,
  Server,
  Eye,
  Lock,
  UserCheck,
  Settings,
  Bell,
  Search,
  Calendar,
  BarChart3,
  Globe,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  Database,
  Wifi,
  WifiOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DashboardStats {
  totalKeys: number;
  usedKeys: number;
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  activeServices: number;
  totalServices: number;
  recentActivity: any[];
}

interface SecurityStatus {
  blockedIPs: number;
  whitelistedIPs: number;
  activeRateLimits: number;
  suspiciousActivity: number;
  securityLevel: string;
  lastUpdate: string;
  protectionLayers: string[];
}

export default function NewDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch security status
  const { data: security, isLoading: securityLoading } = useQuery<SecurityStatus>({
    queryKey: ["/api/admin/security/status"],
    refetchInterval: 15000 // Refresh every 15 seconds
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -4,
      scale: 1.02,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'maximum': return 'text-green-600 bg-green-100';
      case 'high': return 'text-yellow-600 bg-yellow-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg"
        variants={itemVariants}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <motion.div 
                className="flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    OtoKiwi Admin
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Yönetim Paneli</p>
                </div>
              </motion.div>

              {/* Quick Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Hızlı arama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/50 border-gray-200/50 focus:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* System Status */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-300 hidden sm:block">Sistem Aktif</span>
                </div>
                <Wifi className="w-4 h-4 text-green-500" />
              </div>

              {/* Live Clock */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-gray-200/50">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                  {formatTime(currentTime)}
                </span>
              </div>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                  3
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Hoş Geldiniz! 👋
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sistem durumu ve güncel istatistikler
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date().toLocaleDateString('tr-TR')}</span>
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Security Status Banner */}
        <motion.div 
          className="mb-8"
          variants={itemVariants}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Güvenlik Durumu</h3>
                    <p className="opacity-90">Tüm güvenlik katmanları aktif</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {security?.securityLevel || 'MAXIMUM'}
                  </div>
                  <p className="opacity-90">{security?.protectionLayers?.length || 10} koruma katmanı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          {/* Total Users */}
          <motion.div variants={itemVariants} whileHover="hover">
            <motion.div variants={cardHoverVariants}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Toplam Kullanıcı
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {statsLoading ? "..." : stats?.totalUsers.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    Aktif kullanıcı hesapları
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Total Keys */}
          <motion.div variants={itemVariants} whileHover="hover">
            <motion.div variants={cardHoverVariants}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                    Toplam Key
                  </CardTitle>
                  <Key className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {statsLoading ? "..." : stats?.totalKeys.toLocaleString() || "0"}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-green-600 dark:text-green-400">
                      <span>Kullanılan: {stats?.usedKeys || 0}</span>
                      <span>{stats?.totalKeys ? Math.round(((stats?.usedKeys || 0) / stats.totalKeys) * 100) : 0}%</span>
                    </div>
                    <Progress 
                      value={stats?.totalKeys ? ((stats?.usedKeys || 0) / stats.totalKeys) * 100 : 0} 
                      className="h-1 mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Total Orders */}
          <motion.div variants={itemVariants} whileHover="hover">
            <motion.div variants={cardHoverVariants}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Toplam Sipariş
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {statsLoading ? "..." : stats?.totalOrders.toLocaleString() || "0"}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      Beklemede: {stats?.pendingOrders || 0}
                    </Badge>
                    <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                      Tamamlanan: {stats?.completedOrders || 0}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Revenue */}
          <motion.div variants={itemVariants} whileHover="hover">
            <motion.div variants={cardHoverVariants}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    Toplam Gelir
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    ₺{statsLoading ? "..." : (stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                    Bugün: ₺{(stats?.todayRevenue || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Security Details & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Security Details */}
          <motion.div variants={itemVariants}>
            <Card className="h-full shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Güvenlik Detayları</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{security?.blockedIPs || 0}</div>
                    <div className="text-xs text-red-500">Engellenen IP</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{security?.whitelistedIPs || 0}</div>
                    <div className="text-xs text-green-500">Güvenli IP</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{security?.activeRateLimits || 0}</div>
                    <div className="text-xs text-yellow-500">Aktif Limit</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{security?.suspiciousActivity || 0}</div>
                    <div className="text-xs text-orange-500">Şüpheli Aktivite</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Aktif Koruma Katmanları:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {security?.protectionLayers?.map((layer, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">{layer}</span>
                      </div>
                    )) || Array.from({length: 10}).map((_, index) => (
                      <div key={index} className="flex items-center space-x-1 text-xs">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600 dark:text-gray-400">Koruma {index + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <Card className="h-full shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-600" />
                  <span>Hızlı İşlemler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                      <Key className="w-5 h-5" />
                      <span className="text-xs">Yeni Key</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">Kullanıcılar</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg">
                      <ShoppingCart className="w-5 h-5" />
                      <span className="text-xs">Siparişler</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg">
                      <Server className="w-5 h-5" />
                      <span className="text-xs">API Ayarları</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg">
                      <Shield className="w-5 h-5" />
                      <span className="text-xs">Güvenlik</span>
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg">
                      <BarChart3 className="w-5 h-5" />
                      <span className="text-xs">İstatistikler</span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-lg border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-indigo-600" />
                <span>Son Aktiviteler</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats?.recentActivity?.slice(0, 5).map((activity, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {activity.message || "Yeni sistem aktivitesi"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.timestamp ? new Date(activity.timestamp).toLocaleString('tr-TR') : "Şimdi"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {activity.type || "system"}
                        </Badge>
                      </motion.div>
                    )) || (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Henüz aktivite bulunmuyor</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}