import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Key,
  Settings,
  Users,
  Package,
  FileText,
  Activity,
  ShoppingCart,
  Search,
  CreditCard,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  TrendingUp,
  Database,
  Globe,
  Bell,
  Menu,
  X,
  Star,
  Zap,
  Target,
  BarChart3,
  UserCheck,
  MessageSquare,
  AlertTriangle,
  Lock,
  PieChart,
  Calendar,
  Sparkles
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
  color?: string;
  isNew?: boolean;
  isHot?: boolean;
}

const navSections = [
  {
    title: "Ana Panel",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        color: "text-blue-400",
        isHot: true
      },
      {
        title: "Canlı İstatistikler",
        href: "/admin/key-stats",
        icon: TrendingUp,
        color: "text-emerald-400",
        badge: "LIVE"
      },
    ]
  },
  {
    title: "Yönetim",
    items: [
      {
        title: "Key Yönetimi",
        href: "/admin/keys",
        icon: Key,
        color: "text-purple-400"
      },
      {
        title: "Servis Yönetimi",
        href: "/admin/services",
        icon: Package,
        color: "text-indigo-400"
      },
      {
        title: "API Yönetimi",
        href: "/admin/api-management",
        icon: Database,
        color: "text-cyan-400",
        isNew: true
      },
      {
        title: "API Bakiyeleri",
        href: "/admin/api-balances",
        icon: CreditCard,
        color: "text-green-400",
        badge: "₺"
      },
    ]
  },
  {
    title: "Kullanıcılar & Siparişler",
    items: [
      {
        title: "Kullanıcı Yönetimi",
        href: "/admin/users",
        icon: Users,
        color: "text-orange-400"
      },
      {
        title: "Sipariş Yönetimi",
        href: "/admin/orders",
        icon: ShoppingCart,
        color: "text-rose-400"
      },
      {
        title: "Sipariş Sorgulama",
        href: "/admin/order-search",
        icon: Search,
        color: "text-yellow-400"
      },
    ]
  },
  {
    title: "Güvenlik & Loglar",
    items: [
      {
        title: "Giriş Denemeleri",
        href: "/admin/login-attempts",
        icon: Shield,
        color: "text-red-400",
        badge: "SEC"
      },
      {
        title: "Sistem Logları",
        href: "/admin/logs",
        icon: Activity,
        color: "text-gray-400"
      },
      {
        title: "Master Şifre",
        href: "/admin/master-password-management",
        icon: Lock,
        color: "text-red-500",
        isHot: true
      },
    ]
  },
  {
    title: "Destek & Ayarlar",
    items: [
      {
        title: "Geri Bildirimler",
        href: "/admin/feedback",
        icon: MessageSquare,
        color: "text-blue-300"
      },
      {
        title: "Şikayetler",
        href: "/admin/complaints",
        icon: AlertTriangle,
        color: "text-amber-400"
      },
      {
        title: "Sistem Ayarları",
        href: "/admin/settings",
        icon: Settings,
        color: "text-slate-400"
      },
    ]
  }
];

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-slate-900 border-r border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Crown className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white">OtoKiwi</h1>
              </div>
            )}
          </div>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navSections.map((section, sectionIndex) => (
          <div key={section.title}>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, delay: sectionIndex * 0.05 }}
                  className="overflow-hidden"
                >
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    {section.title}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                  >
                    <Link href={item.href}>
                      <motion.div
                        className={cn(
                          "relative group flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer",
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "hover:bg-slate-700/30 hover:border hover:border-slate-600/50"
                        )}
                        whileHover={{ scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"
                            layoutId="activeIndicator"
                          />
                        )}
                        
                        <motion.div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                              : `${item.color} group-hover:bg-slate-700 group-hover:text-white`
                          )}
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                        
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.div
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: "auto" }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="flex-1 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-sm font-medium transition-colors",
                                  isActive ? "text-white" : "text-slate-300 group-hover:text-white"
                                )}>
                                  {item.title}
                                </span>
                                
                                <div className="flex items-center space-x-1">
                                  {item.badge && (
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs px-1.5 py-0.5 h-5",
                                        isActive
                                          ? "bg-white/20 text-white"
                                          : "bg-slate-700 text-slate-300"
                                      )}
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                  
                                  {"isNew" in item && item.isNew && (
                                    <motion.div
                                      animate={{ 
                                        scale: [1, 1.05, 1],
                                        opacity: [0.9, 1, 0.9]
                                      }}
                                      transition={{ 
                                        duration: 3, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                      }}
                                    >
                                      <Badge className="text-xs px-1.5 py-0.5 h-5 bg-green-500 text-white">
                                        YENİ
                                      </Badge>
                                    </motion.div>
                                  )}
                                  
                                  {"isHot" in item && item.isHot && (
                                    <motion.div
                                      animate={{ 
                                        rotate: [0, 2, -2, 0],
                                        scale: [1, 1.03, 1]
                                      }}
                                      transition={{ 
                                        duration: 4, 
                                        repeat: Infinity, 
                                        ease: "easeInOut" 
                                      }}
                                    >
                                      <Badge className="text-xs px-1.5 py-0.5 h-5 bg-red-500 text-white">
                                        🔥
                                      </Badge>
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            
            {sectionIndex < navSections.length - 1 && (
              <Separator className="my-4 bg-slate-700/50" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
          <Button
            onClick={handleLogout}
            variant="ghost"
            className={cn(
              "w-full justify-start text-slate-300 hover:text-white hover:bg-red-500/20 hover:border-red-500/30 border border-transparent transition-all",
              collapsed ? "justify-center px-0" : "px-3"
            )}
          >
            <LogOut className="w-4 h-4" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="ml-3 overflow-hidden"
                >
                  Çıkış Yap
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
        
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-3 text-center overflow-hidden"
            >
              <p className="text-xs text-slate-500">
                OtoKiwi Admin v2.1
              </p>
              <div className="flex items-center justify-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Sistem Aktif</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-all duration-300",
          collapsed ? "w-20" : "w-80",
          className
        )}
        initial={false}
        animate={{ width: collapsed ? 80 : 320 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Menu Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        <Button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 p-0 bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 hover:bg-slate-800"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>
      </motion.div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden fixed top-0 left-0 w-80 h-screen z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}