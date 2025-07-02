import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
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
  BarChart3,
  Rocket,
  Target,
  Globe,
  Settings,
  Calendar,
  ArrowUp,
  ArrowDown,
  Layers,
  Shield,
  Database
} from "lucide-react";
import { Key as KeyType } from "@shared/schema";

// Modern Background Component
const ModernBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/30 via-transparent to-cyan-950/20" />
      
      {/* Floating Orbs */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.04) 40%, transparent 70%)',
          filter: 'blur(60px)',
          top: '10%', 
          right: '10%'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.06) 0%, rgba(168, 85, 247, 0.03) 40%, transparent 70%)',
          filter: 'blur(50px)',
          bottom: '20%', 
          left: '10%'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

// Stats Card Component
const StatCard = ({ icon: Icon, title, value, change, changeType, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.02, y: -2 }}
    className="group"
  >
    <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl group-hover:border-white/20 transition-all duration-300 overflow-hidden">
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <motion.div 
            className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            whileHover={{ rotate: 5 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          {change && (
            <div className={`flex items-center text-sm ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {changeType === 'up' ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <motion.p 
            className="text-3xl font-bold text-white"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {value}
          </motion.p>
          <p className="text-white/60 text-sm font-medium">{title}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Quick Action Card
const QuickActionCard = ({ icon: Icon, title, description, onClick, color }: any) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    className="group cursor-pointer"
    onClick={onClick}
  >
    <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl group-hover:border-white/20 transition-all duration-300 overflow-hidden h-full">
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardContent className="p-6 relative z-10 h-full flex flex-col">
        <motion.div 
          className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 10 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-white/60 text-sm flex-1">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white text-lg font-medium">Admin Panel Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  const recentKeysData = Array.isArray(recentKeys) ? recentKeys.slice(0, 5) : [];
  const recentOrdersData = Array.isArray(recentOrders) ? recentOrders.slice(0, 5) : [];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 text-white relative">
      {/* Modern Background */}
      <ModernBackground />
      
      <Sidebar />
      
      <main className="flex-1 overflow-hidden relative z-10">
        <Header 
          title="Dashboard" 
          description="Sistem kontrolü ve performans takibi" 
        />
        
        <div className="p-6 space-y-8 max-h-[calc(100vh-80px)] overflow-y-auto">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
            <Card className="relative bg-black/30 border border-white/20 backdrop-blur-xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
                      animate={{ 
                        boxShadow: [
                          "0 0 30px rgba(59, 130, 246, 0.3)",
                          "0 0 50px rgba(147, 51, 234, 0.4)",
                          "0 0 30px rgba(236, 72, 153, 0.3)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Crown className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">
                        Hoş Geldiniz, {admin?.username || 'Admin'}!
                      </h1>
                      <p className="text-white/70">
                        Sistem başarıyla çalışıyor. Tüm kontroller elinizin altında.
                      </p>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button 
                      onClick={() => setShowKeyModal(true)}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Hızlı Key Oluştur
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Key}
              title="Toplam Key"
              value={(dashboardStats as any)?.totalKeys || 0}
              change="+12% bu hafta"
              changeType="up"
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
              delay={0.1}
            />
            <StatCard
              icon={CheckCircle}
              title="Kullanılmış Key"
              value={(dashboardStats as any)?.usedKeys || 0}
              change="+8% bu hafta"
              changeType="up"
              color="bg-gradient-to-r from-emerald-500 to-teal-500"
              delay={0.2}
            />
            <StatCard
              icon={Globe}
              title="Aktif Servis"
              value={(dashboardStats as any)?.activeServices || 0}
              change="+5 yeni"
              changeType="up"
              color="bg-gradient-to-r from-purple-500 to-pink-500"
              delay={0.3}
            />
            <StatCard
              icon={Activity}
              title="Günlük İşlem"
              value={(dashboardStats as any)?.dailyTransactions || 0}
              change="+25% dün"
              changeType="up"
              color="bg-gradient-to-r from-orange-500 to-red-500"
              delay={0.4}
            />
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Rocket className="w-6 h-6 mr-3 text-blue-400" />
              Hızlı İşlemler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickActionCard
                icon={Key}
                title="Key Yönetimi"
                description="Yeni key oluştur, mevcut keyleri yönet"
                onClick={() => window.location.href = '/admin/keys'}
                color="bg-gradient-to-r from-blue-500 to-purple-500"
              />
              <QuickActionCard
                icon={Settings}
                title="Servis Ayarları"
                description="API servislerini yapılandır ve güncelle"
                onClick={() => window.location.href = '/admin/services'}
                color="bg-gradient-to-r from-purple-500 to-pink-500"
              />
              <QuickActionCard
                icon={Database}
                title="API Yönetimi"
                description="Dış API bağlantılarını kontrol et"
                onClick={() => window.location.href = '/admin/api-management'}
                color="bg-gradient-to-r from-emerald-500 to-cyan-500"
              />
              <QuickActionCard
                icon={BarChart3}
                title="İstatistikler"
                description="Detaylı performans raporları görüntüle"
                onClick={() => window.location.href = '/admin/key-stats'}
                color="bg-gradient-to-r from-orange-500 to-red-500"
              />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Keys */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <Key className="w-5 h-5 mr-3 text-blue-400" />
                    Son Oluşturulan Keyler
                    <Badge className="ml-auto bg-blue-500/20 text-blue-300 border-blue-400/30">
                      {recentKeysData.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentKeysData.length > 0 ? (
                    <div className="space-y-3">
                      {recentKeysData.map((key: any, index: number) => (
                        <motion.div
                          key={key.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">{key.name}</p>
                            <p className="text-sm text-white/60">{key.category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={key.isUsed ? "destructive" : "secondary"}>
                              {key.isUsed ? "Kullanılmış" : "Aktif"}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Key className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">Henüz key oluşturulmamış</p>
                      <p className="text-white/40 text-sm">Hızlı key oluşturmak için yukarıdaki butonu kullanın</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <Card className="bg-black/30 border border-white/10 backdrop-blur-xl rounded-2xl h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-white flex items-center">
                    <ShoppingCart className="w-5 h-5 mr-3 text-emerald-400" />
                    Son Siparişler
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                      {recentOrdersData.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentOrdersData.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrdersData.map((order: any, index: number) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors"
                        >
                          <div>
                            <p className="font-medium text-white">#{order.orderId}</p>
                            <p className="text-sm text-white/60">{order.service?.name}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'failed' ? 'destructive' : 'secondary'
                              }
                            >
                              {order.status === 'completed' ? 'Tamamlandı' :
                               order.status === 'failed' ? 'Başarısız' : 'İşleniyor'}
                            </Badge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-white/30 mx-auto mb-4" />
                      <p className="text-white/60">Henüz sipariş yok</p>
                      <p className="text-white/40 text-sm">İlk siparişler burda görünecek</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Key Creation Modal */}
      <KeyCreationModal 
        open={showKeyModal} 
        onOpenChange={setShowKeyModal}
      />
    </div>
  );
}