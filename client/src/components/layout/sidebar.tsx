import { Link, useLocation } from "wouter";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Settings,
  Users,
  Activity,
  Server,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
  FileText,
  Cog,
  Download,
  Search,
  BarChart3,
  DollarSign,
  Shield,
  MessageCircle,
  Lock,
  Crown,
  Zap,
  Database,
  Layers,
  Eye,
  Globe,
  Target,
  Sparkles,
  Star,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "@/hooks/useAdminAuth";

// Modern Navigation Structure
const navigationSections = [
  {
    title: "Ana",
    items: [
      { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: null },
      { name: "Key Yönetimi", href: "/admin/keys", icon: Key, badge: "hot" },
      { name: "Siparişler", href: "/admin/orders", icon: ShoppingCart, badge: null },
    ]
  },
  {
    title: "Sistem",
    items: [
      { name: "Servisler", href: "/admin/services", icon: Globe, badge: null },
      { name: "API Yönetimi", href: "/admin/api-management", icon: Database, badge: null },
      { name: "API Bakiyeleri", href: "/admin/api-balances", icon: DollarSign, badge: "new" },
    ]
  },
  {
    title: "Kullanıcı",
    items: [
      { name: "Kullanıcılar", href: "/admin/users", icon: Users, badge: null },
      { name: "Geri Dönüşler", href: "/admin/feedback", icon: MessageCircle, badge: null },
      { name: "Şikayetler", href: "/admin/complaints", icon: MessageCircle, badge: null },
    ]
  },
  {
    title: "Güvenlik",
    items: [
      { name: "Giriş Denemeleri", href: "/admin/login-attempts", icon: Shield, badge: null },
      { name: "Master Şifre", href: "/admin/master-password-management", icon: Lock, badge: null },
      { name: "Şifre Yönetimi", href: "/admin/password-management", icon: Lock, badge: null },
    ]
  },
  {
    title: "Analiz",
    items: [
      { name: "Key İstatistikleri", href: "/admin/key-stats", icon: BarChart3, badge: null },
      { name: "Sipariş Sorgula", href: "/admin/order-search", icon: Search, badge: null },
      { name: "Loglar", href: "/admin/logs", icon: FileText, badge: null },
    ]
  },
  {
    title: "Ayarlar",
    items: [
      { name: "Sistem Ayarları", href: "/admin/settings", icon: Cog, badge: null },
    ]
  }
];

// Modern Navigation Item Component
const NavigationItem = ({ item, isActive }: { item: any, isActive: boolean }) => (
  <Link href={item.href}>
    <motion.div
      className={`
        relative flex items-center px-4 py-3 mx-2 rounded-xl transition-all duration-300 group cursor-pointer
        ${isActive 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 text-white shadow-lg' 
          : 'hover:bg-white/5 text-white/70 hover:text-white'
        }
      `}
      whileHover={{ x: 5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full"
          layoutId="activeIndicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      <motion.div
        className={`
          w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-300
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg' 
            : 'bg-white/10 group-hover:bg-white/20'
          }
        `}
        whileHover={{ rotate: 5, scale: 1.1 }}
      >
        <item.icon className="w-5 h-5" />
      </motion.div>
      
      <span className="font-medium flex-1">{item.name}</span>
      
      {/* Badge */}
      {item.badge && (
        <Badge 
          className={`
            text-xs px-2 py-1 ml-2
            ${item.badge === 'hot' ? 'bg-red-500/20 text-red-300 border-red-400/30' : ''}
            ${item.badge === 'new' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : ''}
          `}
        >
          {item.badge === 'hot' ? '🔥' : item.badge === 'new' ? '✨' : item.badge}
        </Badge>
      )}
      
      {/* Hover arrow */}
      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
    </motion.div>
  </Link>
);

// Section Header Component
const SectionHeader = ({ title }: { title: string }) => (
  <motion.div
    className="px-6 py-3 mt-8 first:mt-6"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">{title}</h3>
    <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-transparent mt-2 rounded-full" />
  </motion.div>
);

export default function Sidebar() {
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Mobile Toggle Button
  const MobileToggle = () => (
    <Button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 bg-black/20 backdrop-blur-xl border border-white/20 hover:bg-black/30"
      size="sm"
    >
      {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <motion.aside
      className={`
        hidden lg:flex fixed left-0 top-0 h-full bg-black/30 backdrop-blur-2xl border-r border-white/10 z-40 flex-col
        ${isCollapsed ? 'w-20' : 'w-80'}
      `}
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(147, 51, 234, 0.4)",
                    "0 0 20px rgba(236, 72, 153, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Crown className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-white">OtoKiwi</h1>
                <p className="text-sm text-white/60">Admin Panel</p>
              </div>
            </motion.div>
          )}
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="hover:bg-white/10 text-white/70"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? '' : 'rotate-180'}`} />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <AnimatePresence>
          {navigationSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
            >
              {!isCollapsed && <SectionHeader title={section.title} />}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavigationItem
                    key={item.name}
                    item={item}
                    isActive={location === item.href || location.startsWith(item.href + '/')}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed ? (
          <motion.div
            className="bg-white/5 rounded-2xl p-4 border border-white/10"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-10 h-10 border-2 border-blue-400/30">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                  {admin?.username?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {admin?.username || 'Admin'}
                </p>
                <p className="text-xs text-white/60">Yönetici</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs">
                Online
              </Badge>
            </div>
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </motion.div>
        ) : (
          <motion.div className="space-y-2">
            <Avatar className="w-10 h-10 mx-auto border-2 border-blue-400/30">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                {admin?.username?.charAt(0).toUpperCase() || 'A'}
              </AvatarFallback>
            </Avatar>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="w-full hover:bg-red-500/20 text-red-300"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>

      {/* Buy Button */}
      <div className="p-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-lg"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {isCollapsed ? '' : 'Satın Al'}
          </Button>
        </motion.div>
      </div>
    </motion.aside>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
          />
          
          {/* Mobile Sidebar */}
          <motion.aside
            className="lg:hidden fixed left-0 top-0 h-full w-80 bg-black/40 backdrop-blur-2xl border-r border-white/10 z-50 flex flex-col"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Mobile Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">OtoKiwi</h1>
                    <p className="text-sm text-white/60">Admin Panel</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsMobileOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/10 text-white/70"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              {navigationSections.map((section) => (
                <div key={section.title}>
                  <SectionHeader title={section.title} />
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <div key={item.name} onClick={() => setIsMobileOpen(false)}>
                        <NavigationItem
                          item={item}
                          isActive={location === item.href || location.startsWith(item.href + '/')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile User Profile */}
            <div className="p-4 border-t border-white/10">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Avatar className="w-10 h-10 border-2 border-blue-400/30">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                      {admin?.username?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {admin?.username || 'Admin'}
                    </p>
                    <p className="text-xs text-white/60">Yönetici</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30">
                    Online
                  </Badge>
                </div>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-400/30"
                  size="sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
              
              <Button
                onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold shadow-lg"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Satın Al
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <MobileToggle />
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}