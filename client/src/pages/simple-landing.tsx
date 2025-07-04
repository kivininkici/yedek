import { KeyRound, Shield, Zap } from "lucide-react";

export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                OtoKiwi
              </h1>
            </div>
            <p className="text-xl text-gray-300 mb-4">Premium Key Yönetim Sistemi</p>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Sosyal medya hizmetleri için güvenli, hızlı ve güvenilir key yönetimi platformu
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <Zap className="w-10 h-10 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Hızlı İşlem</h3>
              <p className="text-gray-400 text-sm">Anında key doğrulama ve sipariş işleme</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <Shield className="w-10 h-10 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Güvenli</h3>
              <p className="text-gray-400 text-sm">Gelişmiş güvenlik ve şifreleme sistemi</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300">
              <KeyRound className="w-10 h-10 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Takip</h3>
              <p className="text-gray-400 text-sm">Gerçek zamanlı sipariş durumu takibi</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <a 
              href="/user" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Key Kullan
            </a>
            <a 
              href="/auth" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Giriş Yap / Kayıt Ol
            </a>
            <a 
              href="/admin" 
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Admin Panel
            </a>
          </div>

          {/* Stats */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-6 text-sm text-gray-400 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
              <span>5,847 aktif servis</span>
              <span>•</span>
              <span>50K+ tamamlanan sipariş</span>
              <span>•</span>
              <span>7/24 destek</span>
              <span>•</span>
              <span>4.9 ⭐ rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}