import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LayoutDashboard,
  Users,
  Key,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  Star,
  Crown,
  Zap,
  Target,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Package,
  Database,
  Shield,
  Globe,
  Sparkles,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Edit,
  Filter,
  RefreshCw,
  Bell,
  Settings
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

// Animated Background Component
const DashboardBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "10%" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "60%", right: "10%" }}
      />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGRlZnM+CjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPgo8cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDU5LCAxMzAsIDI0NiwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIgLz4KPHN2Zz4=')] opacity-20" />
    </div>
  );
};

// Header Component
const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-30"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Crown className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-sm text-slate-400">OtoKiwi Yönetim Paneli</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {currentTime.toLocaleTimeString('tr-TR')}
              </p>
              <p className="text-xs text-slate-400">
                {currentTime.toLocaleDateString('tr-TR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                <Bell className="w-4 h-4 mr-2" />
                Bildirimler
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Stat Card Component
const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color, 
  delay = 0 
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down";
  icon: any;
  color: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
              <p className="text-3xl font-bold text-white mb-2">{value}</p>
              {change && (
                <div className="flex items-center space-x-1">
                  {changeType === "up" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    changeType === "up" ? "text-green-400" : "text-red-400"
                  }`}>
                    {change}
                  </span>
                  <span className="text-xs text-slate-500">son 24 saat</span>
                </div>
              )}
            </div>
            
            <motion.div
              className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(147, 51, 234, 0.4)",
                  "0 0 20px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Activity Item Component
const ActivityItem = ({ 
  type, 
  message, 
  time, 
  icon: Icon, 
  color,
  delay = 0 
}: {
  type: string;
  message: string;
  time: string;
  icon: any;
  color: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200"
    >
      <motion.div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
        whileHover={{ scale: 1.1 }}
      >
        <Icon className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{type}</p>
        <p className="text-sm text-slate-400 mt-1">{message}</p>
        <p className="text-xs text-slate-500 mt-2">{time}</p>
      </div>
    </motion.div>
  );
};

export default function Dashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalUsers: 1247,
    totalKeys: 3584,
    totalOrders: 892,
    revenue: "₺45,230",
    dailyUsers: "+12%",
    dailyKeys: "+8%",
    dailyOrders: "+15%",
    dailyRevenue: "+23%"
  };

  const recentActivities = [
    {
      type: "Yeni Kullanıcı",
      message: "admin kullanıcısı sisteme katıldı",
      time: "2 dakika önce",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      type: "Key Oluşturuldu",
      message: "Instagram kategorisinde 50 adet key eklendi",
      time: "5 dakika önce",
      icon: Key,
      color: "bg-purple-500"
    },
    {
      type: "Sipariş Tamamlandı",
      message: "ORD-2024-001 numaralı sipariş tamamlandı",
      time: "8 dakika önce",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      type: "API Güncellendi",
      message: "MedyaBayim API bakiyesi yenilendi",
      time: "12 dakika önce",
      icon: Database,
      color: "bg-cyan-500"
    },
    {
      type: "Güvenlik Uyarısı",
      message: "3 başarısız giriş denemesi tespit edildi",
      time: "15 dakika önce",
      icon: Shield,
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen flex">
      <DashboardBackground />
      <Sidebar />
      
      <div className="flex-1">
        <DashboardHeader />
        
        <div className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-4 mb-6">
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(147, 51, 234, 0.4)",
                    "0 0 30px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Hoş Geldiniz, Admin! 👋
                </h2>
                <p className="text-lg text-slate-400">
                  OtoKiwi sistemine genel bakış ve son aktiviteler
                </p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Toplam Kullanıcılar"
              value={stats.totalUsers.toLocaleString()}
              change={stats.dailyUsers}
              changeType="up"
              icon={Users}
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              title="Toplam Key'ler"
              value={stats.totalKeys.toLocaleString()}
              change={stats.dailyKeys}
              changeType="up"
              icon={Key}
              color="bg-gradient-to-r from-purple-500 to-pink-500"
              delay={0.2}
            />
            <StatCard
              title="Toplam Siparişler"
              value={stats.totalOrders.toLocaleString()}
              change={stats.dailyOrders}
              changeType="up"
              icon={ShoppingCart}
              color="bg-gradient-to-r from-emerald-500 to-teal-500"
              delay={0.3}
            />
            <StatCard
              title="Toplam Gelir"
              value={stats.revenue}
              change={stats.dailyRevenue}
              changeType="up"
              icon={TrendingUp}
              color="bg-gradient-to-r from-orange-500 to-red-500"
              delay={0.4}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-white">Son Aktiviteler</CardTitle>
                        <p className="text-sm text-slate-400">Gerçek zamanlı sistem aktiviteleri</p>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yenile
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <ActivityItem
                        key={index}
                        {...activity}
                        delay={0.6 + (index * 0.1)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-6"
            >
              {/* System Status */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">Sistem Durumu</CardTitle>
                      <p className="text-sm text-slate-400">Tüm sistemler normal</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">API Sunucuları</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Aktif</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Veritabanı</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Aktif</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">E-posta Servisi</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Aktif</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg text-white flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    Hızlı İşlemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full justify-start bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30">
                      <Plus className="w-4 h-4 mr-2" />
                      Yeni Key Oluştur
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full justify-start bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30">
                      <Package className="w-4 h-4 mr-2" />
                      Servis Ekle
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full justify-start bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/30">
                      <Eye className="w-4 h-4 mr-2" />
                      Siparişleri Görüntüle
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="w-full justify-start bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30">
                      <Settings className="w-4 h-4 mr-2" />
                      Sistem Ayarları
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}