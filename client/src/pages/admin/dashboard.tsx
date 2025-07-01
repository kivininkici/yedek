import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { AdminCursorFollower } from "@/hooks/useMouseTracking";

import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/admin/stats-card";
import KeyCreationModal from "@/components/admin/key-creation-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Key,
  Users,
  ShoppingCart,
  Activity,
  Plus,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles,
  Zap,
  TrendingUp,
  Crown,
  Star,
  BarChart3
} from "lucide-react";
import { Key as KeyType } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, admin } = useAdminAuth();
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Giriş Gerekli",
        description: "Admin paneline erişmek için giriş yapmalısınız",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch dashboard stats
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/admin/dashboard/stats"],
    enabled: isAuthenticated,
  });

  // Fetch recent keys
  const { data: recentKeys } = useQuery({
    queryKey: ["/api/admin/keys"],
    enabled: isAuthenticated,
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Get recent 5 keys and orders
  const recentKeysData = Array.isArray(recentKeys) ? recentKeys.slice(0, 5) : [];
  const recentOrdersData = Array.isArray(recentOrders) ? recentOrders.slice(0, 5) : [];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20">
      <Sidebar />
      <main className="flex-1 overflow-hidden relative md:ml-0 ml-0">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0] 
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"
            animate={{ 
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        

        
        <Header 
          title="🚀 Admin Dashboard" 
          description="Sistem kontrolü ve performans takibi" 
        />
        
        <div className="content-area relative z-10">
          <div className="p-4 md:p-8 space-y-8">
            {/* Welcome Section with Animation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-3xl p-6 md:p-8 border border-blue-500/20 backdrop-blur-xl shadow-2xl gap-6">
                <div className="flex items-center space-x-6 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <motion.div 
                      className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Star className="w-3 h-3 text-yellow-900" />
                    </motion.div>
                  </motion.div>
                  <div>
                    <motion.h2 
                      className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent font-extrabold text-3xl md:text-4xl mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      Hoş Geldiniz, {admin?.username || 'Admin'}! 👋
                    </motion.h2>
                    <motion.p 
                      className="text-slate-300 text-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Sistemin komuta merkezine hoş geldiniz. Tüm kontroller elinizin altında! ⚡
                    </motion.p>
                  </div>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 hover:from-blue-700 hover:via-purple-700 hover:to-cyan-700 text-white shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 h-14 px-8 text-lg font-bold rounded-2xl w-full lg:w-auto"
                    onClick={() => setShowKeyModal(true)}
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    🔑 Hızlı Key Oluştur
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Enhanced Statistics Cards */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              {[
                {
                  title: "🔑 Toplam Key",
                  value: (dashboardStats as any)?.totalKeys || 0,
                  icon: Key,
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-500/10 to-blue-600/20",
                  change: "+12% bu ay",
                  changeType: "positive" as const,
                  delay: 0
                },
                {
                  title: "✅ Kullanılmış Key", 
                  value: (dashboardStats as any)?.usedKeys || 0,
                  icon: CheckCircle,
                  gradient: "from-green-500 to-emerald-600",
                  bgGradient: "from-green-500/10 to-emerald-600/20",
                  change: "+8% bu hafta",
                  changeType: "positive" as const,
                  delay: 0.1
                },
                {
                  title: "🚀 Aktif Servis",
                  value: (dashboardStats as any)?.activeServices || 0,
                  icon: Zap,
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-500/10 to-purple-600/20", 
                  change: "5 servis aktif",
                  changeType: "neutral" as const,
                  delay: 0.2
                },
                {
                  title: "📊 Günlük İşlem",
                  value: (dashboardStats as any)?.dailyTransactions || 0,
                  icon: TrendingUp,
                  gradient: "from-cyan-500 to-cyan-600",
                  bgGradient: "from-cyan-500/10 to-cyan-600/20",
                  change: "+25% dün",
                  changeType: "positive" as const,
                  delay: 0.3
                }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: stat.delay }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="group"
                  >
                    <Card className={`relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 backdrop-blur-xl`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="opacity-10"
                          >
                            <Sparkles className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                          <div className="flex items-end justify-between">
                            <motion.p 
                              className="text-3xl font-bold text-white"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.5, delay: stat.delay + 0.3, type: "spring" }}
                            >
                              {stat.value.toLocaleString()}
                            </motion.p>
                            <Badge 
                              className={`text-xs px-2 py-1 ${
                                stat.changeType === 'positive' 
                                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                  : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                              }`}
                            >
                              {stat.change}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Hover effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Enhanced Recent Activity */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              {/* Recent Keys */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="border-b border-slate-700/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mr-3"
                        >
                          <Key className="w-5 h-5 text-white" />
                        </motion.div>
                        🔑 Son Oluşturulan Key'ler
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400"
                        onClick={() => window.location.href = '/admin/keys'}
                      >
                        Tümünü Gör
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-900/50">
                          <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                            <TableHead className="text-slate-300 font-semibold">Key</TableHead>
                            <TableHead className="text-slate-300 font-semibold">Durum</TableHead>
                            <TableHead className="text-slate-300 font-semibold">Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentKeysData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-slate-400 py-12">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                  className="flex flex-col items-center"
                                >
                                  <Key className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                  <p className="text-lg font-medium">Henüz key oluşturulmamış</p>
                                  <p className="text-sm text-slate-500 mt-1">Hızlı key oluşturmak için yukarıdaki butonu kullanın</p>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            recentKeysData.map((key: KeyType, index: number) => (
                              <motion.tr 
                                key={key.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="border-slate-700/50 hover:bg-slate-800/30 transition-all duration-200"
                              >
                                <TableCell>
                                  <code className="px-3 py-1.5 bg-slate-900/70 text-blue-400 text-sm rounded-lg font-mono border border-blue-500/20">
                                    {key.value.substring(0, 8)}...
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    variant={key.isUsed ? "default" : "secondary"}
                                    className={key.isUsed 
                                      ? "bg-red-500/20 text-red-400 border-red-500/30" 
                                      : "bg-green-500/20 text-green-400 border-green-500/30"
                                    }
                                  >
                                    {key.isUsed ? "Kullanılmış" : "Aktif"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400">
                                  {key.createdAt ? new Date(key.createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                                </TableCell>
                              </motion.tr>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Orders */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50 backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-300">
                  <CardHeader className="border-b border-slate-700/50 pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                          className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-3"
                        >
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </motion.div>
                        🛒 Son Siparişler
                      </CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-400"
                        onClick={() => window.location.href = '/admin/orders'}
                      >
                        Tümünü Gör
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-slate-900/50">
                          <TableRow className="border-slate-700/50 hover:bg-slate-800/30">
                            <TableHead className="text-slate-300 font-semibold">Sipariş ID</TableHead>
                            <TableHead className="text-slate-300 font-semibold">Durum</TableHead>
                            <TableHead className="text-slate-300 font-semibold">Tarih</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentOrdersData.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-slate-400 py-12">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5 }}
                                  className="flex flex-col items-center"
                                >
                                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                                  <p className="text-lg font-medium">Henüz sipariş yok</p>
                                  <p className="text-sm text-slate-500 mt-1">İlk siparişler geldiğinde burada görünecek</p>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            recentOrdersData.map((order: any, index: number) => (
                              <TableRow 
                                key={order.id}
                                className="border-slate-700/50 hover:bg-slate-800/30 transition-all duration-200"
                              >
                                <TableCell>
                                  <code className="px-3 py-1.5 bg-slate-900/70 text-purple-400 text-sm rounded-lg font-mono border border-purple-500/20">
                                    #{order.orderId || order.id}
                                  </code>
                                </TableCell>
                                <TableCell>
                                  <Badge 
                                    className={
                                      order.status === 'completed' 
                                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                                        : order.status === 'pending'
                                        ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                                        : order.status === 'in_progress'
                                        ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                        : "bg-red-500/20 text-red-400 border-red-500/30"
                                    }
                                  >
                                    {order.status === 'completed' && 'Tamamlandı'}
                                    {order.status === 'pending' && 'Bekliyor'}
                                    {order.status === 'in_progress' && 'İşleniyor'}
                                    {order.status === 'cancelled' && 'İptal Edildi'}
                                    {order.status === 'failed' && 'Başarısız'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400">
                                  {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Key Creation Modal */}
            <KeyCreationModal 
              open={showKeyModal} 
              onOpenChange={setShowKeyModal}
            />
          </div>
        </div>
      </main>
    </div>
  );
}