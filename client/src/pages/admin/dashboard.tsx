import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Key,
  ShoppingCart,
  TrendingUp,
  Activity,
  Crown,
  Sparkles,
  DollarSign,
  CheckCircle,
  Globe,
  Database,
  Plus,
  Eye,
  BarChart3,
  Settings,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Zap
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

// Enhanced Modern Background Component
const DashboardBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black" />
      
      {/* Enhanced Floating Orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, rgba(147, 51, 234, 0.4) 40%, transparent 70%)',
          filter: 'blur(60px)',
          top: '5%', 
          left: '5%'
        }}
        animate={{
          x: [0, 150, 0],
          y: [0, -80, 0],
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-8"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, rgba(168, 85, 247, 0.3) 40%, transparent 70%)',
          filter: 'blur(50px)',
          bottom: '10%', 
          right: '5%'
        }}
        animate={{
          x: [0, -120, 0],
          y: [0, 90, 0],
          scale: [1, 0.7, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full opacity-6"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.5) 0%, rgba(59, 130, 246, 0.25) 40%, transparent 70%)',
          filter: 'blur(45px)',
          top: '40%', 
          left: '30%'
        }}
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -60, 80, 0],
          scale: [0.8, 1.4, 0.9, 0.8],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Enhanced Grid Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px),
            radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 30px 30px',
        }}
        animate={{
          backgroundPosition: ['0px 0px, 0px 0px, 0px 0px', '60px 60px, 60px 60px, 30px 30px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Enhanced Header Component
const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-black/30 backdrop-blur-2xl border-b border-white/20 sticky top-0 z-30 shadow-2xl"
    >
      {/* Header Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
      
      <div className="container mx-auto px-6 py-5 relative z-10">
        <div className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="relative w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{
                boxShadow: [
                  "0 20px 40px rgba(59, 130, 246, 0.3)",
                  "0 20px 40px rgba(147, 51, 234, 0.3)", 
                  "0 20px 40px rgba(236, 72, 153, 0.3)",
                  "0 20px 40px rgba(59, 130, 246, 0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400/20 to-pink-400/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Crown className="w-8 h-8 text-white relative z-10" />
              
              {/* Floating Crown Sparkles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                  style={{
                    top: `${15 + i * 20}%`,
                    left: `${10 + i * 25}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </motion.div>
            
            <div className="space-y-1">
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  backgroundSize: '200% 200%'
                }}
              >
                Admin Dashboard
              </motion.h1>
              <motion.p 
                className="text-slate-300 text-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                OtoKiwi Yönetim Paneli
              </motion.p>
              
              {/* Live Status Indicator */}
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-green-300 font-medium">System Online</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {/* Enhanced Time Display */}
            <motion.div 
              className="text-right bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/20"
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            >
              <motion.p 
                className="text-lg font-bold text-white"
                animate={{ opacity: [1, 0.8, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {currentTime.toLocaleTimeString('tr-TR')}
              </motion.p>
              <p className="text-sm text-slate-300">
                {currentTime.toLocaleDateString('tr-TR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </motion.div>
            
            {/* Enhanced Notification Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="relative bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 group"
              >
                <div className="relative flex items-center space-x-2">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Bell className="w-5 h-5" />
                  </motion.div>
                  <span className="font-semibold">Bildirimler</span>
                  
                  {/* Notification Badge */}
                  {notifications > 0 && (
                    <motion.div
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {notifications}
                    </motion.div>
                  )}
                </div>
                
                {/* Button Shine Effect */}
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-700"
                />
              </Button>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-2xl px-4 py-3"
              >
                <Settings className="w-5 h-5 mr-2" />
                Ayarlar
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Stat Card Component
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
      whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.2 } }}
    >
      <Card className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-white/30 transition-all duration-300 shadow-2xl hover:shadow-3xl overflow-hidden group">
        {/* Background Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
              <motion.p 
                className="text-3xl font-bold text-white mb-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
              >
                {value}
              </motion.p>
              {change && (
                <motion.div 
                  className="flex items-center space-x-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 0.4 }}
                >
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
                </motion.div>
              )}
            </div>
            
            <motion.div
              className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center shadow-lg relative overflow-hidden`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{
                boxShadow: [
                  "0 10px 30px rgba(0,0,0,0.3)",
                  "0 15px 40px rgba(0,0,0,0.4)",
                  "0 10px 30px rgba(0,0,0,0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {/* Icon Background Glow */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <Icon className="w-8 h-8 text-white relative z-10" />
              
              {/* Floating Sparkles */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/60 rounded-full"
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${15 + i * 30}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
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
      className="flex items-start space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group"
    >
      <motion.div
        className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <Icon className="w-5 h-5 text-white" />
      </motion.div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-blue-200 transition-colors">{type}</p>
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
      message: "Sipariş #1234 başarıyla işlendi",
      time: "10 dakika önce",
      icon: CheckCircle,
      color: "bg-green-500"
    },
    {
      type: "API Çağrısı",
      message: "MedyaBayim API'den yeni servisler alındı",
      time: "15 dakika önce",
      icon: Globe,
      color: "bg-orange-500"
    },
    {
      type: "Sistem Güncellemesi",
      message: "Database backup başarıyla tamamlandı",
      time: "30 dakika önce",
      icon: Database,
      color: "bg-cyan-500"
    }
  ];

  const statCardData = [
    {
      title: "Toplam Kullanıcılar",
      value: stats.totalUsers,
      change: stats.dailyUsers,
      changeType: "up" as const,
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Aktif Key'ler",
      value: stats.totalKeys,
      change: stats.dailyKeys,
      changeType: "up" as const,
      icon: Key,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Toplam Siparişler",
      value: stats.totalOrders,
      change: stats.dailyOrders,
      changeType: "up" as const,
      icon: ShoppingCart,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Günlük Gelir",
      value: stats.revenue,
      change: stats.dailyRevenue,
      changeType: "up" as const,
      icon: DollarSign,
      color: "from-pink-500 to-pink-600"
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
                <motion.h2 
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Hoş Geldiniz, Admin! 👋
                </motion.h2>
                <motion.p 
                  className="text-lg text-slate-400"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  OtoKiwi sistemine genel bakış ve son aktiviteler
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {statCardData.map((stat, index) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
                icon={stat.icon}
                color={`bg-gradient-to-br ${stat.color}`}
                delay={0.1 * index}
              />
            ))}
          </motion.div>

          {/* Recent Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Recent Activities */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <span>Son Aktiviteler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    message={activity.message}
                    time={activity.time}
                    icon={activity.icon}
                    color={activity.color}
                    delay={0.1 * index}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-white flex items-center space-x-2">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <span>Hızlı İşlemler</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 h-auto">
                    <Plus className="w-5 h-5 mr-2" />
                    Yeni Key Oluştur
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl py-3 h-auto">
                    <Eye className="w-5 h-5 mr-2" />
                    Siparişleri Görüntüle
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl py-3 h-auto">
                    <BarChart3 className="w-5 h-5 mr-2" />
                    İstatistikleri İncele
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl py-3 h-auto">
                    <Settings className="w-5 h-5 mr-2" />
                    Sistem Ayarları
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}