import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Key,
  ShoppingCart,
  TrendingUp,
  Activity,
  Settings,
  Plus,
  Eye,
  BarChart3,
  DollarSign,
  CheckCircle,
  Globe
} from "lucide-react";
import NewModernAdminLayout from "@/components/admin/NewModernAdminLayout";

// Simple Stats Card Component
const SimpleStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = "bg-slate-800" 
}: {
  title: string;
  value: string | number;
  icon: any;
  color?: string;
}) => {
  return (
    <Card className={`${color} border-slate-700 hover:border-slate-600 transition-colors`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Simple Activity Item Component
const SimpleActivityItem = ({ 
  type, 
  message, 
  time, 
  icon: Icon, 
  color = "text-slate-400" 
}: {
  type: string;
  message: string;
  time: string;
  icon: any;
  color?: string;
}) => {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{type}</p>
        <p className="text-xs text-slate-400 mt-1">{message}</p>
      </div>
      <div className="text-xs text-slate-500 flex-shrink-0">
        {time}
      </div>
    </div>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = "secondary" 
}: {
  icon: any;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}) => {
  return (
    <Button 
      onClick={onClick}
      className={`w-full h-16 flex flex-col items-center justify-center space-y-1 ${
        variant === "primary" 
          ? "bg-blue-600 hover:bg-blue-700 text-white" 
          : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
      }`}
      variant={variant === "primary" ? "default" : "outline"}
    >
      <Icon className="w-5 h-5" />
      <span className="text-xs">{label}</span>
    </Button>
  );
};

export default function SimpleDashboard() {
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
    <NewModernAdminLayout>
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-slate-400">OtoKiwi Yönetim Paneli</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {new Date().toLocaleTimeString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date().toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-slate-800 border-slate-700 text-slate-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Ayarlar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SimpleStatCard
              title="Toplam Kullanıcı"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="bg-slate-800"
            />
            <SimpleStatCard
              title="Aktif Anahtarlar"
              value={stats?.activeKeys || 0}
              icon={Key}
              color="bg-slate-800"
            />
            <SimpleStatCard
              title="Toplam Sipariş"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              color="bg-slate-800"
            />
            <SimpleStatCard
              title="Sistem Durumu"
              value="Aktif"
              icon={CheckCircle}
              color="bg-slate-800"
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Hızlı İşlemler
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <QuickActionButton
                      icon={Key}
                      label="Yeni Anahtar"
                      onClick={() => {}}
                      variant="primary"
                    />
                    <QuickActionButton
                      icon={Users}
                      label="Kullanıcılar"
                      onClick={() => {}}
                    />
                    <QuickActionButton
                      icon={BarChart3}
                      label="İstatistikler"
                      onClick={() => {}}
                    />
                    <QuickActionButton
                      icon={Settings}
                      label="Ayarlar"
                      onClick={() => {}}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Son Aktiviteler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity?.length > 0 ? (
                      recentActivity.map((activity: any, index: number) => (
                        <SimpleActivityItem
                          key={index}
                          type={activity.type}
                          message={activity.message}
                          time={activity.time}
                          icon={activity.icon === 'user' ? Users : activity.icon === 'key' ? Key : ShoppingCart}
                          color={activity.type === 'success' ? 'text-green-400' : 
                                 activity.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <Activity className="w-8 h-8 mx-auto mb-2" />
                        <p>Henüz aktivite bulunmuyor</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* System Info */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Sistem Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">99.9%</div>
                  <div className="text-sm text-slate-400">Uptime</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">5.2s</div>
                  <div className="text-sm text-slate-400">Avg Response</div>
                </div>
                <div className="text-center p-4 bg-slate-700/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">2.1GB</div>
                  <div className="text-sm text-slate-400">Memory Usage</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </NewModernAdminLayout>
  );
}