import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Users, 
  Key, 
  ShoppingCart, 
  Server, 
  Settings, 
  Shield, 
  BarChart3, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  CreditCard,
  Activity,
  Database,
  UserCheck,
  AlertTriangle,
  Eye,
  Lock,
  TrendingUp,
  Globe,
  Zap,
  FileText,
  Calendar,
  Clock,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  href: string;
  badge?: string;
  isNew?: boolean;
  isHot?: boolean;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    href: "/admin/dashboard"
  },
  {
    id: "users",
    title: "Kullanıcı Yönetimi",
    icon: Users,
    href: "/admin/users",
    children: [
      {
        id: "all-users",
        title: "Tüm Kullanıcılar",
        icon: Users,
        href: "/admin/users"
      },
      {
        id: "admin-users",
        title: "Admin Kullanıcılar",
        icon: UserCheck,
        href: "/admin/admin-users"
      },
      {
        id: "login-attempts",
        title: "Giriş Denemeleri",
        icon: Eye,
        href: "/admin/login-attempts",
        isHot: true
      }
    ]
  },
  {
    id: "keys",
    title: "Key Yönetimi",
    icon: Key,
    href: "/admin/keys",
    children: [
      {
        id: "all-keys",
        title: "Tüm Key'ler",
        icon: Key,
        href: "/admin/keys"
      },
      {
        id: "key-stats",
        title: "Key İstatistikleri",
        icon: BarChart3,
        href: "/admin/key-stats"
      }
    ]
  },
  {
    id: "orders",
    title: "Sipariş Yönetimi",
    icon: ShoppingCart,
    href: "/admin/orders",
    badge: "3"
  },
  {
    id: "apis",
    title: "API Yönetimi",
    icon: Server,
    href: "/admin/apis",
    children: [
      {
        id: "api-settings",
        title: "API Ayarları",
        icon: Settings,
        href: "/admin/apis"
      },
      {
        id: "api-balances",
        title: "API Bakiyeleri",
        icon: CreditCard,
        href: "/admin/api-balances",
        isNew: true
      }
    ]
  },
  {
    id: "security",
    title: "Güvenlik",
    icon: Shield,
    href: "/admin/security",
    isHot: true,
    children: [
      {
        id: "security-overview",
        title: "Güvenlik Durumu",
        icon: Shield,
        href: "/admin/security"
      },
      {
        id: "master-password",
        title: "Master Şifre",
        icon: Lock,
        href: "/admin/master-password-management"
      }
    ]
  },
  {
    id: "analytics",
    title: "Analitik & Raporlar",
    icon: TrendingUp,
    href: "/admin/analytics",
    children: [
      {
        id: "revenue-reports",
        title: "Gelir Raporları",
        icon: DollarSign,
        href: "/admin/revenue-reports"
      },
      {
        id: "activity-logs",
        title: "Aktivite Logları",
        icon: Activity,
        href: "/admin/logs"
      }
    ]
  },
  {
    id: "system",
    title: "Sistem",
    icon: Database,
    href: "/admin/system",
    children: [
      {
        id: "system-health",
        title: "Sistem Sağlığı",
        icon: Activity,
        href: "/admin/system-health"
      },
      {
        id: "backup",
        title: "Yedekleme",
        icon: Database,
        href: "/admin/backup"
      }
    ]
  }
];

export default function ModernSidebar({ isCollapsed, onCollapse }: SidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + '/');
  };

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.1
      }
    }
  };

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const active = isActive(item.href);

    return (
      <div key={item.id} className="relative">
        <motion.div
          whileHover={{ x: depth === 0 ? 4 : 2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "group relative flex items-center w-full transition-all duration-200",
            depth === 0 ? "mb-1" : "mb-0.5"
          )}
        >
          <Link href={item.href}>
            <motion.div
              className={cn(
                "flex items-center w-full rounded-xl transition-all duration-200 cursor-pointer",
                depth === 0 ? "px-3 py-3" : "px-6 py-2 ml-4",
                active 
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50",
                isCollapsed && depth === 0 ? "justify-center" : ""
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-200",
                depth === 0 ? "w-8 h-8" : "w-6 h-6",
                active 
                  ? "bg-white/20 text-white" 
                  : "text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200"
              )}>
                <item.icon className={cn(depth === 0 ? "w-5 h-5" : "w-4 h-4")} />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    variants={contentVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="flex items-center justify-between flex-1 ml-3"
                  >
                    <span className={cn(
                      "font-medium transition-all duration-200",
                      depth === 0 ? "text-sm" : "text-xs",
                      active ? "text-white" : ""
                    )}>
                      {item.title}
                    </span>

                    <div className="flex items-center space-x-1">
                      {item.badge && (
                        <Badge 
                          variant={active ? "secondary" : "default"} 
                          className={cn(
                            "text-xs px-1.5 py-0.5 min-w-[20px] h-5",
                            active ? "bg-white/20 text-white" : "bg-red-100 text-red-800"
                          )}
                        >
                          {item.badge}
                        </Badge>
                      )}

                      {item.isNew && (
                        <Badge className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800">
                          NEW
                        </Badge>
                      )}

                      {item.isHot && (
                        <Badge className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-800">
                          HOT
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {hasChildren && !isCollapsed && (
            <motion.button
              onClick={() => toggleExpanded(item.id)}
              className={cn(
                "absolute right-2 p-1 rounded-md transition-all duration-200",
                active ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-600"
              )}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Menu className="w-4 h-4" />
              </motion.div>
            </motion.button>
          )}
        </motion.div>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && !isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-0.5 mt-1">
                {item.children?.map(child => renderMenuItem(child, depth + 1))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className="fixed left-0 top-0 h-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-2xl z-40 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  OtoKiwi
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin Panel</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => onCollapse(!isCollapsed)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent p-4">
        <nav className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <motion.button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
            isCollapsed ? "justify-center px-3 py-3" : "px-3 py-3"
          )}
          whileHover={{ x: isCollapsed ? 0 : 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-5 h-5" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="ml-3 text-sm font-medium"
              >
                Çıkış Yap
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              variants={contentVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="mt-3 text-center"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                OtoKiwi v1.0
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                2025 © Tüm hakları saklıdır
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}