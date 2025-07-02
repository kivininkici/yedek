import { useState } from 'react';
import { Link } from 'wouter';

export default function HostingDemo() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderHomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                🔑
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OtoKiwi
                </h1>
                <p className="text-xs text-gray-400">cPanel Hosting Demo</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => setCurrentPage('user')}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm"
              >
                Key Kullan
              </button>
              <button 
                onClick={() => setCurrentPage('admin')}
                className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              OtoKiwi
            </span>
            <br />
            <span className="text-3xl bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Hosting Demo
            </span>
          </h2>
          
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Bu demo, hosting klasöründeki PHP sisteminin nasıl çalışacağını gösterir.
            <br />
            <span className="text-blue-400 font-bold">cPanel hosting</span> ortamında 
            <span className="text-purple-400 font-bold"> tam fonksiyonel</span> olarak çalışır.
          </p>

          {/* Demo Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-3">🔐</div>
              <h3 className="font-bold mb-2 text-blue-300">Güvenli Key Sistemi</h3>
              <p className="text-sm text-gray-300">Tek kullanımlık anahtarlar ve admin paneli</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold mb-2 text-purple-300">PHP/MySQL Backend</h3>
              <p className="text-sm text-gray-300">cPanel hosting için optimize edilmiş</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-bold mb-2 text-green-300">Responsive UI</h3>
              <p className="text-sm text-gray-300">Mobil uyumlu modern tasarım</p>
            </div>
          </div>

          {/* Demo Navigation */}
          <div className="mt-12 space-y-4">
            <p className="text-gray-400">Demo sayfalarını test edin:</p>
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setCurrentPage('user')}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                👤 Kullanıcı Arayüzü
              </button>
              <button 
                onClick={() => setCurrentPage('admin')}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                🛠️ Admin Paneli
              </button>
              <button 
                onClick={() => setCurrentPage('order')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                🔍 Sipariş Sorgula
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderUserPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm">
                🔑
              </div>
              <h1 className="text-xl font-bold text-gray-800">OtoKiwi - Key Kullanım</h1>
            </div>
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Ana Sayfa
            </button>
          </div>
        </div>
      </header>

      {/* User Interface */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔑 Key Doğrulama</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Değeri
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="DEMO-KEY-123456"
                  defaultValue="DEMO-KEY-123456"
                />
              </div>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-semibold">
                Key'i Doğrula
              </button>
            </div>
          </div>

          {/* Demo Key Result */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-green-800">Key Doğrulandı!</h3>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <p><span className="font-medium">Kategori:</span> Instagram</p>
              <p><span className="font-medium">Maksimum Miktar:</span> 1000</p>
              <p><span className="font-medium">Durum:</span> Aktif</p>
            </div>
          </div>

          {/* Service Selection */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Servis Seçimi</h3>
            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Instagram Takipçi</h4>
                    <p className="text-sm text-gray-600">Gerçek ve aktif takipçiler</p>
                  </div>
                  <div className="text-blue-600 font-bold">₺5.00</div>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-800">Instagram Beğeni</h4>
                    <p className="text-sm text-gray-600">Hızlı ve güvenli beğeniler</p>
                  </div>
                  <div className="text-blue-600 font-bold">₺2.50</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hedef URL
                </label>
                <input 
                  type="url" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="https://instagram.com/username"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miktar
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  min="1"
                  max="1000"
                />
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold">
                Siparişi Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminPage = () => (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                👑
              </div>
              <h1 className="text-xl font-bold text-gray-800">OtoKiwi Admin</h1>
            </div>
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-purple-600 hover:text-purple-800"
            >
              ← Ana Sayfa
            </button>
          </div>
        </div>
      </header>

      {/* Admin Dashboard */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Key</p>
                <p className="text-3xl font-bold text-blue-600">1,247</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                🔑
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktif Servis</p>
                <p className="text-3xl font-bold text-green-600">3,429</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                ⚡
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Sipariş</p>
                <p className="text-3xl font-bold text-purple-600">8,921</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kullanıcılar</p>
                <p className="text-3xl font-bold text-orange-600">542</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                👥
              </div>
            </div>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">🔑 Key Yönetimi</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 text-left">
                + Yeni Key Oluştur
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 text-left">
                📋 Key Listesi
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 text-left">
                📊 Key İstatistikleri
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">⚙️ Sistem Yönetimi</h3>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 text-left">
                🔧 API Yönetimi
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 text-left">
                🌐 Servis Yönetimi
              </button>
              <button className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 text-left">
                👥 Kullanıcı Yönetimi
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Son Aktiviteler</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  ✓
                </div>
                <div>
                  <p className="font-medium text-gray-800">Yeni sipariş tamamlandı</p>
                  <p className="text-sm text-gray-600">#ORD-123456 - Instagram Takipçi</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">2 dk önce</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  🔑
                </div>
                <div>
                  <p className="font-medium text-gray-800">Yeni key oluşturuldu</p>
                  <p className="text-sm text-gray-600">Instagram kategorisi</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">5 dk önce</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  👤
                </div>
                <div>
                  <p className="font-medium text-gray-800">Yeni kullanıcı kaydı</p>
                  <p className="text-sm text-gray-600">user@example.com</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">10 dk önce</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
                🔍
              </div>
              <h1 className="text-xl font-bold text-gray-800">Sipariş Sorgulama</h1>
            </div>
            <button 
              onClick={() => setCurrentPage('home')}
              className="text-green-600 hover:text-green-800"
            >
              ← Ana Sayfa
            </button>
          </div>
        </div>
      </header>

      {/* Order Search */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Sipariş Durumu Sorgula</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sipariş ID
                </label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="#ORD-123456"
                  defaultValue="#ORD-123456"
                />
              </div>
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-semibold">
                Siparişi Sorgula
              </button>
            </div>
          </div>

          {/* Demo Order Result */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">Sipariş Detayları</h3>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Tamamlandı
              </span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Sipariş ID</p>
                  <p className="font-semibold text-gray-800">#ORD-123456</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarih</p>
                  <p className="font-semibold text-gray-800">2 Temmuz 2025</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Servis</p>
                  <p className="font-semibold text-gray-800">Instagram Takipçi</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Miktar</p>
                  <p className="font-semibold text-gray-800">500</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Hedef URL</p>
                <p className="font-semibold text-gray-800">https://instagram.com/demo_account</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Key Bilgisi</p>
                <p className="font-semibold text-gray-800">DEMO-KEY-123456 (Instagram)</p>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">İlerleme</span>
                  <span className="text-sm text-green-600 font-medium">100% Tamamlandı</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-green-800 font-medium">✅ Sipariş başarıyla tamamlandı!</p>
                <p className="text-green-700 text-sm mt-1">
                  Tüm takipçiler hesabınıza eklendi. Teşekkür ederiz!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <Link 
          href="/" 
          className="bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-lg shadow-lg hover:bg-white transition-all"
        >
          ← Ana Sayfaya Dön
        </Link>
      </div>

      {/* Demo Navigation */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-2 flex space-x-2">
          <button 
            onClick={() => setCurrentPage('home')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              currentPage === 'home' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Ana Sayfa
          </button>
          <button 
            onClick={() => setCurrentPage('user')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              currentPage === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Kullanıcı
          </button>
          <button 
            onClick={() => setCurrentPage('admin')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              currentPage === 'admin' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => setCurrentPage('order')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              currentPage === 'order' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Sipariş
          </button>
        </div>
      </div>

      {/* Page Content */}
      {currentPage === 'home' && renderHomePage()}
      {currentPage === 'user' && renderUserPage()}
      {currentPage === 'admin' && renderAdminPage()}
      {currentPage === 'order' && renderOrderPage()}
    </div>
  );
}