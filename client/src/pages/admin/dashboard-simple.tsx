import { useQuery } from "@tanstack/react-query";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
import { Users, Key, ShoppingCart, Server, TrendingUp, Activity, Zap, Star } from "lucide-react";

export default function DashboardSimple() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats'],
    staleTime: 30000,
  });

  const statCards = [
    {
      title: "Toplam Kullanıcılar",
      value: stats?.totalUsers || "0",
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bg: "from-blue-500/20 to-cyan-500/20"
    },
    {
      title: "Aktif Anahtarlar", 
      value: stats?.totalKeys || "0",
      icon: Key,
      gradient: "from-yellow-500 to-orange-500",
      bg: "from-yellow-500/20 to-orange-500/20"
    },
    {
      title: "Toplam Siparişler",
      value: stats?.totalOrders || "0", 
      icon: ShoppingCart,
      gradient: "from-pink-500 to-rose-500",
      bg: "from-pink-500/20 to-rose-500/20"
    },
    {
      title: "Sistem Durumu",
      value: "Aktif",
      icon: Server,
      gradient: "from-green-500 to-emerald-500", 
      bg: "from-green-500/20 to-emerald-500/20"
    }
  ];

  return (
    <ModernAdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Hoş Geldiniz!</h1>
                <p className="text-purple-200">OtoKiwi Admin Paneli</p>
              </div>
            </div>
            <p className="text-white/80 max-w-2xl">
              Sistem kontrollerini ve istatistikleri buradan takip edebilirsiniz. 
              Tüm özellikler optimize edildi ve anında yükleniyor.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={`relative group overflow-hidden rounded-2xl bg-gradient-to-br ${card.bg} border border-white/10 p-6 hover:scale-105 transition-all duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{isLoading ? "..." : card.value}</div>
                    </div>
                  </div>
                  <h3 className="text-white/80 text-sm font-medium">{card.title}</h3>
                  <div className="mt-2 flex items-center text-xs text-green-400">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>Aktif</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Feed */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Son Aktiviteler</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Sistem başlatıldı</p>
                  <p className="text-gray-400 text-xs">Az önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Admin giriş yapıldı</p>
                  <p className="text-gray-400 text-xs">Birkaç dakika önce</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm">Navigasyon optimize edildi</p>
                  <p className="text-gray-400 text-xs">10 dakika önce</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white">Hızlı İşlemler</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl text-white hover:scale-105 transition-all duration-200">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Kullanıcılar</span>
              </button>
              <button className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl text-white hover:scale-105 transition-all duration-200">
                <Key className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Anahtarlar</span>
              </button>
              <button className="p-4 bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-xl text-white hover:scale-105 transition-all duration-200">
                <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Siparişler</span>
              </button>
              <button className="p-4 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl text-white hover:scale-105 transition-all duration-200">
                <Activity className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm">Servisler</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModernAdminLayout>
  );
}