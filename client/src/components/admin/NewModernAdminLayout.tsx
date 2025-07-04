import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Key, 
  Settings, 
  Users, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Bell,
  Search,
  Moon,
  Sun,
  Shield,
  Database,
  BarChart3,
  FileText,
  MessageSquare,
  Globe,
  Clock,
  Menu,
  X,
  Crown,
  Star,
  Lock,
  AlertTriangle,
  CheckCircle,
  Plus,
  LogOut,
  User,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';

interface NewModernAdminLayoutProps {
  children: React.ReactNode;
}

const NewModernAdminLayout: React.FC<NewModernAdminLayoutProps> = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications] = useState([
    { id: 1, type: 'success', message: 'Sistem başarıyla güncellendi', time: '2 dk önce' },
    { id: 2, type: 'warning', message: 'Düşük bakiye uyarısı', time: '5 dk önce' },
    { id: 3, type: 'info', message: 'Yeni kullanıcı kaydı', time: '10 dk önce' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigation menu items with modern categorization
  const menuItems = [
    {
      category: 'Ana Panel',
      items: [
        { 
          id: 'dashboard', 
          label: 'Dashboard', 
          icon: Crown, 
          path: '/admin/dashboard',
          badge: 'HOT',
          color: 'from-purple-500 to-pink-500'
        },
        { 
          id: 'analytics', 
          label: 'Analitik', 
          icon: BarChart3, 
          path: '/admin/analytics',
          badge: 'NEW',
          color: 'from-blue-500 to-cyan-500'
        },
      ]
    },
    {
      category: 'Yönetim',
      items: [
        { 
          id: 'keys', 
          label: 'Key Yönetimi', 
          icon: Key, 
          path: '/admin/keys',
          color: 'from-green-500 to-emerald-500'
        },
        { 
          id: 'users', 
          label: 'Kullanıcılar', 
          icon: Users, 
          path: '/admin/users',
          color: 'from-orange-500 to-red-500'
        },
        { 
          id: 'services', 
          label: 'Servisler', 
          icon: Globe, 
          path: '/admin/services',
          color: 'from-indigo-500 to-purple-500'
        },
        { 
          id: 'orders', 
          label: 'Siparişler', 
          icon: FileText, 
          path: '/admin/orders',
          color: 'from-teal-500 to-blue-500'
        },
      ]
    },
    {
      category: 'Sistem',
      items: [
        { 
          id: 'api-management', 
          label: 'API Yönetimi', 
          icon: Database, 
          path: '/admin/api-management',
          color: 'from-rose-500 to-pink-500'
        },
        { 
          id: 'api-balances', 
          label: 'API Bakiyeleri', 
          icon: DollarSign, 
          path: '/admin/api-balances',
          color: 'from-yellow-500 to-orange-500'
        },
        { 
          id: 'logs', 
          label: 'Sistem Logları', 
          icon: Activity, 
          path: '/admin/logs',
          color: 'from-gray-500 to-slate-500'
        },
        { 
          id: 'login-attempts', 
          label: 'Giriş Denemeleri', 
          icon: Shield, 
          path: '/admin/login-attempts',
          color: 'from-red-500 to-rose-500'
        },
      ]
    },
    {
      category: 'İletişim',
      items: [
        { 
          id: 'feedback', 
          label: 'Geri Bildirimler', 
          icon: MessageSquare, 
          path: '/admin/feedback',
          color: 'from-violet-500 to-purple-500'
        },
        { 
          id: 'complaints', 
          label: 'Şikayetler', 
          icon: AlertTriangle, 
          path: '/admin/complaints',
          color: 'from-amber-500 to-orange-500'
        },
      ]
    },
    {
      category: 'Güvenlik',
      items: [
        { 
          id: 'master-password', 
          label: 'Master Şifre', 
          icon: Lock, 
          path: '/admin/master-password-management',
          color: 'from-slate-500 to-gray-500'
        },
        { 
          id: 'settings', 
          label: 'Ayarlar', 
          icon: Settings, 
          path: '/admin/settings',
          color: 'from-neutral-500 to-stone-500'
        },
      ]
    },
  ];

  // Get current active menu item
  const getCurrentMenuItem = () => {
    for (const category of menuItems) {
      for (const item of category.items) {
        if (location.startsWith(item.path)) {
          return item;
        }
      }
    }
    return menuItems[0].items[0];
  };

  const currentMenuItem = getCurrentMenuItem();

  // System status indicators
  const systemStatus = {
    server: { status: 'online', label: 'Sunucu', icon: CheckCircle, color: 'text-green-500' },
    database: { status: 'online', label: 'Veritabanı', icon: CheckCircle, color: 'text-green-500' },
    api: { status: 'online', label: 'API', icon: CheckCircle, color: 'text-green-500' },
    storage: { status: 'warning', label: 'Depolama', icon: AlertTriangle, color: 'text-yellow-500' },
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-slate-900 dark:via-gray-900 dark:to-zinc-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Ultra-Modern Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ 
          x: isMobileMenuOpen ? 0 : (window.innerWidth < 1024 ? -300 : 0),
          width: isSidebarCollapsed ? 80 : 320
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <motion.div
                animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
                className="flex items-center space-x-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    OtoKiwi
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
                </div>
              </motion.div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="lg:hidden w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            <div className="p-4 space-y-6">
              {menuItems.map((category) => (
                <div key={category.category}>
                  <motion.h3
                    animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
                    className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 mb-3"
                  >
                    {category.category}
                  </motion.h3>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.startsWith(item.path);
                      return (
                        <motion.a
                          key={item.id}
                          href={item.path}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`
                            group relative flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg shadow-black/20' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                            }
                          `}
                        >
                          <div className="relative">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                            {isActive && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"
                              />
                            )}
                          </div>
                          <motion.span
                            animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
                            className="ml-3 font-medium"
                          >
                            {item.label}
                          </motion.span>
                          {(item as any).badge && !isSidebarCollapsed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto px-2 py-1 text-xs font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full"
                            >
                              {(item as any).badge}
                            </motion.span>
                          )}
                          {isActive && (
                            <motion.div
                              layoutId="activeTab"
                              className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"
                            />
                          )}
                        </motion.a>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <motion.div
              animate={{ opacity: isSidebarCollapsed ? 0 : 1 }}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Çevrimiçi</p>
              </div>
              <button className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-80'}`}>
        {/* Ultra-Modern Header */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentMenuItem.color} flex items-center justify-center shadow-lg`}>
                    <currentMenuItem.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentMenuItem.label}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentTime.toLocaleString('tr-TR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Arama yap..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* System Status */}
                <div className="hidden lg:flex items-center space-x-2">
                  {Object.entries(systemStatus).map(([key, status]) => {
                    const Icon = status.icon;
                    return (
                      <div key={key} className="flex items-center space-x-1">
                        <Icon className={`w-4 h-4 ${status.color}`} />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{status.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6 h-[calc(100vh-80px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default NewModernAdminLayout;