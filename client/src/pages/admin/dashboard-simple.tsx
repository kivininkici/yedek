import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";

export default function DashboardSimple() {
  return (
    <SimpleAdminLayout title="Dashboard">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-gray-400 text-sm">Toplam Kullanıcı</h3>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-gray-400 text-sm">Aktif Anahtarlar</h3>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-gray-400 text-sm">Toplam Sipariş</h3>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
          <div className="bg-gray-800 p-6 rounded border border-gray-700">
            <h3 className="text-gray-400 text-sm">Sistem Durumu</h3>
            <p className="text-2xl font-bold text-green-400">Çevrimiçi</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Son Aktiviteler</h3>
          <p className="text-gray-400">Henüz aktivite bulunmuyor.</p>
        </div>
      </div>
    </SimpleAdminLayout>
  );
}