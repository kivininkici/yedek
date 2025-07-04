import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
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
  const logout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => window.location.href = '/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 fixed h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-8">OtoKiwi Admin</h1>
          
          <nav className="space-y-1">
            <a href="/admin" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <BarChart3 className="w-4 h-4 mr-3" />
              Dashboard
            </a>
            <a href="/admin/users" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Users className="w-4 h-4 mr-3" />
              Kullanıcılar
            </a>
            <a href="/admin/keys" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Key className="w-4 h-4 mr-3" />
              Anahtarlar
            </a>
            <a href="/admin/orders" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <ShoppingCart className="w-4 h-4 mr-3" />
              Siparişler
            </a>
            <a href="/admin/services" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Activity className="w-4 h-4 mr-3" />
              Servisler
            </a>
            <a href="/admin/api-management" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Database className="w-4 h-4 mr-3" />
              API Yönetimi
            </a>
            <a href="/admin/api-balances" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <CreditCard className="w-4 h-4 mr-3" />
              API Bakiyeler
            </a>
            <a href="/admin/logs" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <FileText className="w-4 h-4 mr-3" />
              Loglar
            </a>
            <a href="/admin/login-attempts" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Shield className="w-4 h-4 mr-3" />
              Giriş Denemeleri
            </a>
            <a href="/admin/feedback" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <MessageSquare className="w-4 h-4 mr-3" />
              Geri Bildirimler
            </a>
            <a href="/admin/complaints" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <AlertTriangle className="w-4 h-4 mr-3" />
              Şikayetler
            </a>
            <a href="/admin/settings" className="flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 rounded text-sm">
              <Settings className="w-4 h-4 mr-3" />
              Ayarlar
            </a>
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