import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Key,
  ShoppingCart,
  Activity,
  Settings,
  LogOut,
  Search,
  Plus,
  BarChart3,
  Bell,
  Calendar,
  Database
} from "lucide-react";

export default function MinimalDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['/api/admin/dashboard/recent-activity'],
    queryFn: async () => {
      const res = await fetch('/api/admin/dashboard/recent-activity');
      if (!res.ok) throw new Error('Failed to fetch recent activity');
      return res.json();
    },
  });

  const logout = () => {
    fetch('/api/admin/logout', { method: 'POST' })
      .then(() => window.location.href = '/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6">
          <h1 className="text-xl font-bold text-white mb-8">OtoKiwi Admin</h1>
          
          <nav className="space-y-2">
            <a href="/admin" className="flex items-center px-4 py-2 text-gray-300 bg-gray-700 rounded">
              <BarChart3 className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <a href="/admin/users" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              <Users className="w-5 h-5 mr-3" />
              Kullanıcılar
            </a>
            <a href="/admin/keys" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              <Key className="w-5 h-5 mr-3" />
              Anahtarlar
            </a>
            <a href="/admin/orders" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              <ShoppingCart className="w-5 h-5 mr-3" />
              Siparişler
            </a>
            <a href="/admin/api-management" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              <Database className="w-5 h-5 mr-3" />
              API Yönetimi
            </a>
            <a href="/admin/settings" className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 rounded">
              <Settings className="w-5 h-5 mr-3" />
              Ayarlar
            </a>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button 
              onClick={logout}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard</h2>
              <p className="text-gray-400 text-sm">Admin Yönetim Paneli</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('tr-TR')} - {new Date().toLocaleTimeString('tr-TR')}
              </div>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Toplam Kullanıcı</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Aktif Anahtarlar</p>
                    <p className="text-2xl font-bold text-white">{stats?.activeKeys || 0}</p>
                  </div>
                  <Key className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Toplam Sipariş</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalOrders || 0}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Bu Ay</p>
                    <p className="text-2xl font-bold text-white">{stats?.monthlyOrders || 0}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Hızlı İşlemler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Anahtar Oluştur
                </Button>
                <Button className="w-full justify-start bg-gray-700 hover:bg-gray-600 text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Kullanıcıları Görüntüle
                </Button>
                <Button className="w-full justify-start bg-gray-700 hover:bg-gray-600 text-white">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Siparişleri İncele
                </Button>
                <Button className="w-full justify-start bg-gray-700 hover:bg-gray-600 text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Sistem Ayarları
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity?.length > 0 ? (
                    recentActivity.slice(0, 5).map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-white">{activity.type}</p>
                            <p className="text-xs text-gray-400">{activity.message}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2" />
                      <p>Henüz aktivite bulunmuyor</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sistem Durumu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-green-400">Online</div>
                  <div className="text-sm text-gray-400">Server Status</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-blue-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime</div>
                </div>
                <div className="text-center p-4 bg-gray-700 rounded">
                  <div className="text-2xl font-bold text-purple-400">Fast</div>
                  <div className="text-sm text-gray-400">Response Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}