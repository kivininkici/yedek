import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Key, 
  ShoppingCart, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Database,
  BarChart3,
  Target,
  ArrowUp,
  ArrowDown,
  Plus,
  Settings,
  HardDrive,
  Gauge
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import NewModernAdminLayout from '@/components/admin/NewModernAdminLayout';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  trend: 'up' | 'down';
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  onClick: () => void;
}

interface ActivityItemProps {
  activity: {
    id: number;
    type: string;
    message: string;
    time: string;
    user: string;
  };
}

interface SystemHealthCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const NewModernDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/admin/dashboard/recent-activity'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Mock data for demonstration
  const mockStats = {
    totalUsers: 1245,
    totalKeys: 8934,
    totalOrders: 5673,
    totalRevenue: 125680,
    activeUsers: 892,
    pendingOrders: 23,
    completedOrders: 5650,
    failedOrders: 45,
    systemHealth: 98.5,
    apiHealth: 99.2,
    dbHealth: 97.8,
    storageUsage: 67.3,
  };

  const mockRecentActivity = [
    { id: 1, type: 'order', message: 'Yeni sipariş oluşturuldu', time: '2 dk önce', user: 'user123' },
    { id: 2, type: 'key', message: 'Yeni key oluşturuldu', time: '5 dk önce', user: 'admin' },
    { id: 3, type: 'user', message: 'Yeni kullanıcı kaydı', time: '8 dk önce', user: 'newuser456' },
    { id: 4, type: 'order', message: 'Sipariş tamamlandı', time: '12 dk önce', user: 'user789' },
    { id: 5, type: 'system', message: 'Sistem güncellendi', time: '15 dk önce', user: 'system' },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      
      {/* Floating Orbs */}
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-white/20 to-white/5 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-white/10 to-white/5 rounded-full blur-xl" />
      
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${
            trend === 'up' 
              ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
              : 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
        </div>
      </div>
    </motion.div>
  );

  const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, description, icon: Icon, color, onClick }) => (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6 text-left w-full"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      
      {/* Sparkle Effect */}
      <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
      <div className="absolute bottom-4 left-4 w-1 h-1 bg-white rounded-full animate-pulse delay-500" />
      
      <div className="relative">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-4`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </motion.button>
  );

  const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
    const getIcon = (type: string) => {
      switch (type) {
        case 'order': return ShoppingCart;
        case 'key': return Key;
        case 'user': return Users;
        case 'system': return Settings;
        default: return Activity;
      }
    };

    const getColor = (type: string) => {
      switch (type) {
        case 'order': return 'from-blue-500 to-cyan-500';
        case 'key': return 'from-green-500 to-emerald-500';
        case 'user': return 'from-purple-500 to-pink-500';
        case 'system': return 'from-orange-500 to-red-500';
        default: return 'from-gray-500 to-slate-500';
      }
    };

    const Icon = getIcon(activity.type);
    const color = getColor(activity.type);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center space-x-4 p-4 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/50"
      >
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user} • {activity.time}</p>
        </div>
      </motion.div>
    );
  };

  const SystemHealthCard: React.FC<SystemHealthCardProps> = ({ title, value, icon: Icon, color }) => (
    <motion.div
      variants={itemVariants}
      className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-5`} />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}%</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{title}</p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-2 bg-gradient-to-r ${color} rounded-full`}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <NewModernAdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Section */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 p-8 text-white"
        >
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/20" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Crown className="w-8 h-8 text-yellow-300" />
                <h1 className="text-3xl font-bold">Hoş Geldiniz, Admin!</h1>
              </div>
              <p className="text-lg text-white/80">
                {currentTime.toLocaleString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-white/60">OtoKiwi Yönetim Paneli</p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold">Premium</p>
                <p className="text-white/80">Deneyim</p>
              </div>
              <Star className="w-12 h-12 text-yellow-300 animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatCard
            title="Toplam Kullanıcı"
            value={mockStats.totalUsers}
            change="+12%"
            icon={Users}
            color="from-blue-500 to-cyan-500"
            trend="up"
          />
          <StatCard
            title="Aktif Keyler"
            value={mockStats.totalKeys}
            change="+8%"
            icon={Key}
            color="from-green-500 to-emerald-500"
            trend="up"
          />
          <StatCard
            title="Toplam Sipariş"
            value={mockStats.totalOrders}
            change="+15%"
            icon={ShoppingCart}
            color="from-purple-500 to-pink-500"
            trend="up"
          />
          <StatCard
            title="Gelir"
            value={`₺${mockStats.totalRevenue.toLocaleString()}`}
            change="+23%"
            icon={DollarSign}
            color="from-orange-500 to-red-500"
            trend="up"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={containerVariants}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Hızlı İşlemler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Yeni Key Oluştur"
              description="Hızlı key oluşturma işlemi"
              icon={Plus}
              color="from-green-500 to-emerald-500"
              onClick={() => window.location.href = '/admin/keys'}
            />
            <QuickActionCard
              title="Kullanıcı Yönetimi"
              description="Kullanıcı hesaplarını yönet"
              icon={Users}
              color="from-blue-500 to-cyan-500"
              onClick={() => window.location.href = '/admin/users'}
            />
            <QuickActionCard
              title="API Durumu"
              description="API servislerini kontrol et"
              icon={Database}
              color="from-purple-500 to-pink-500"
              onClick={() => window.location.href = '/admin/api-management'}
            />
            <QuickActionCard
              title="Sistem Logları"
              description="Sistem aktivitelerini görüntüle"
              icon={Activity}
              color="from-orange-500 to-red-500"
              onClick={() => window.location.href = '/admin/logs'}
            />
          </div>
        </motion.div>

        {/* System Health & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Health */}
          <motion.div variants={containerVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sistem Durumu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SystemHealthCard
                title="Sistem Sağlığı"
                value={mockStats.systemHealth}
                icon={Gauge}
                color="from-green-500 to-emerald-500"
              />
              <SystemHealthCard
                title="API Sağlığı"
                value={mockStats.apiHealth}
                icon={Globe}
                color="from-blue-500 to-cyan-500"
              />
              <SystemHealthCard
                title="Veritabanı"
                value={mockStats.dbHealth}
                icon={Database}
                color="from-purple-500 to-pink-500"
              />
              <SystemHealthCard
                title="Depolama"
                value={mockStats.storageUsage}
                icon={HardDrive}
                color="from-orange-500 to-red-500"
              />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={containerVariants}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Son Aktiviteler</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {mockRecentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <motion.div variants={containerVariants}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performans Özeti</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Günlük Siparişler</h3>
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">234</div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+18%</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">önceki güne göre</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Başarı Oranı</h3>
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">96.8%</div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+2.3%</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">bu ay</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 shadow-xl p-6"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ortalama Süre</h3>
                  <Clock className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">2.4dk</div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-600">
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-sm font-medium">-12%</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">daha hızlı</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </NewModernAdminLayout>
  );
};

export default NewModernDashboard;