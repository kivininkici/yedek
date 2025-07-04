import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from 'wouter';
import {
  Users,
  Key,
  ShoppingCart,
  Activity,
  Settings,
  LogOut,
  BarChart3,
  Database,
  FileText,
  Bell,
  CreditCard,
  Shield,
  MessageSquare,
  AlertTriangle,
  Menu,
  X,
  Crown,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";

interface ModernAdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function ModernAdminLayout({ children, title }: ModernAdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const logout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => window.location.href = '/admin/login');
  };

  const isActive = (path: string) => location === path;

  const menuItems = [
    { href: '/admin', icon: BarChart3, label: 'Dashboard', color: 'from-blue-500 to-purple-500' },
    { href: '/admin/users', icon: Users, label: 'Kullanıcılar', color: 'from-green-500 to-teal-500' },
    { href: '/admin/keys', icon: Key, label: 'Anahtarlar', color: 'from-yellow-500 to-orange-500' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Siparişler', color: 'from-pink-500 to-rose-500' },
    { href: '/admin/services', icon: Activity, label: 'Servisler', color: 'from-indigo-500 to-blue-500' },
    { href: '/admin/api-management', icon: Database, label: 'API Yönetimi', color: 'from-cyan-500 to-blue-500' },
    { href: '/admin/api-balances', icon: CreditCard, label: 'API Bakiyeler', color: 'from-emerald-500 to-green-500' },
    { href: '/admin/logs', icon: FileText, label: 'Loglar', color: 'from-gray-500 to-slate-500' },
    { href: '/admin/login-attempts', icon: Shield, label: 'Güvenlik', color: 'from-red-500 to-pink-500' },
    { href: '/admin/feedback', icon: MessageSquare, label: 'Geri Bildirim', color: 'from-purple-500 to-indigo-500' },
    { href: '/admin/complaints', icon: AlertTriangle, label: 'Şikayetler', color: 'from-orange-500 to-red-500' },
    { href: '/admin/settings', icon: Settings, label: 'Ayarlar', color: 'from-slate-500 to-gray-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating orbs background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-black/20 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">OtoKiwi</h1>
                  <p className="text-xs text-purple-300">Admin Panel</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 overflow-y-auto">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`group relative flex items-center px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      active 
                        ? 'bg-gradient-to-r ' + item.color + ' shadow-lg shadow-purple-500/25 text-white' 
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}>
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl" />
                      )}
                      <Icon className={`w-5 h-5 mr-3 relative z-10 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                      <span className="relative z-10 font-medium">{item.label}</span>
                      {active && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Star className="w-4 h-4 text-yellow-300 fill-current" />
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <Button 
              onClick={logout}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg shadow-red-500/25 transition-all duration-200"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-72">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-bold text-white">{title || 'Admin Panel'}</h2>
                <p className="text-sm text-purple-300">OtoKiwi Yönetim Sistemi</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <TrendingUp className="w-4 h-4" />
                <span>Sistem Aktif</span>
              </div>
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('tr-TR')} - {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/10 relative"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 min-h-[calc(100vh-200px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}