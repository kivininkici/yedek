import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
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
  Menu,
  X
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface SidebarProps {
  className?: string;
}

const navItems = [
  {
    title: "Ana Panel",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Key Yönetimi",
    href: "/admin/keys",
    icon: Key,
  },
  {
    title: "Servis Yönetimi",
    href: "/admin/services",
    icon: Package,
  },
  {
    title: "API Yönetimi", 
    href: "/admin/apis",
    icon: Activity,
  },
  {
    title: "API Bakiyeleri",
    href: "/admin/api-balances",
    icon: CreditCard,
  },
  {
    title: "Kullanıcı Yönetimi",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Şipariz Yönetimi",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Şikaret Yönetimi",
    href: "/admin/complaints",
    icon: FileText,
  },
  {
    title: "Şipariz Sorgulama",
    href: "/admin/order-search",
    icon: Search,
  },
  {
    title: "Giriş Denemeleri",
    href: "/admin/login-attempts",
    icon: Shield,
  },
  {
    title: "Master Şifre",
    href: "/admin/master-password-management",
    icon: Settings,
  },
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
                <p className="text-xs text-slate-400">Admin Panel</p>
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
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!collapsed && (
                    <span className="ml-3 truncate">{item.title}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="p-2 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen sticky top-0 z-40 transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 p-0 bg-slate-900 rounded-lg border border-slate-700 flex items-center justify-center text-white hover:bg-slate-800"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-0 left-0 w-64 h-screen z-50">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}