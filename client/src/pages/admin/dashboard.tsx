import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Key,
  ShoppingCart,
  Activity,
  Plus,
  Calendar,
  Database,
  CheckCircle
} from "lucide-react";
import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";

export default function Dashboard() {
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

  return (
    <SimpleAdminLayout title="Dashboard">
      <div className="space-y-6">
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
                  <p className="text-sm font-medium text-gray-400">Sistem Durumu</p>
                  <p className="text-2xl font-bold text-white">Aktif</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
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
                <Database className="w-4 h-4 mr-2" />
                API Yönetimi
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
    </SimpleAdminLayout>
  );
}