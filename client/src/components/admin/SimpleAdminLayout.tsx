import { ReactNode } from "react";
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
  AlertTriangle
} from "lucide-react";

interface SimpleAdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function SimpleAdminLayout({ children, title }: SimpleAdminLayoutProps) {
  const [location] = useLocation();
  
  const logout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => window.location.href = '/admin/login');
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-8">OtoKiwi Admin</h1>
          
          <nav className="space-y-1">
            <Link href="/admin">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <BarChart3 className="w-4 h-4 mr-3" />
                Dashboard
              </div>
            </Link>
            <Link href="/admin/users">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/users') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Users className="w-4 h-4 mr-3" />
                Kullanıcılar
              </div>
            </Link>
            <Link href="/admin/keys">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/keys') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Key className="w-4 h-4 mr-3" />
                Anahtarlar
              </div>
            </Link>
            <Link href="/admin/orders">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/orders') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <ShoppingCart className="w-4 h-4 mr-3" />
                Siparişler
              </div>
            </Link>
            <Link href="/admin/services">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/services') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Activity className="w-4 h-4 mr-3" />
                Servisler
              </div>
            </Link>
            <Link href="/admin/api-management">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/api-management') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Database className="w-4 h-4 mr-3" />
                API Yönetimi
              </div>
            </Link>
            <Link href="/admin/api-balances">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/api-balances') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <CreditCard className="w-4 h-4 mr-3" />
                API Bakiyeler
              </div>
            </Link>
            <Link href="/admin/logs">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/logs') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <FileText className="w-4 h-4 mr-3" />
                Loglar
              </div>
            </Link>
            <Link href="/admin/login-attempts">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/login-attempts') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Shield className="w-4 h-4 mr-3" />
                Giriş Denemeleri
              </div>
            </Link>
            <Link href="/admin/feedback">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/feedback') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <MessageSquare className="w-4 h-4 mr-3" />
                Geri Bildirimler
              </div>
            </Link>
            <Link href="/admin/complaints">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/complaints') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <AlertTriangle className="w-4 h-4 mr-3" />
                Şikayetler
              </div>
            </Link>
            <Link href="/admin/settings">
              <div className={`flex items-center px-3 py-2 rounded text-sm transition-all duration-75 ${
                isActive('/admin/settings') ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}>
                <Settings className="w-4 h-4 mr-3" />
                Ayarlar
              </div>
            </Link>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{title || 'Admin Panel'}</h2>
              <p className="text-gray-400 text-sm">OtoKiwi Yönetim Sistemi</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('tr-TR')} - {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}