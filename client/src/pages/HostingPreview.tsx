import { Link } from 'wouter';

export default function HostingPreview() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">🔑 KeyPanel</h1>
          <p className="text-xl text-gray-600">cPanel Hosting Uyumlu - Profesyonel Anahtar Yönetim Sistemi</p>
          <Link href="/" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">📋 Hosting Klasörü Preview</h2>
          <p className="text-gray-700 mb-4">
            Bu sayfa, hosting klasöründe bulunan PHP tabanlı KeyPanel sisteminin özelliklerini göstermektedir. 
            cPanel hosting ortamına yüklendiğinde aynı özellikler ile çalışacaktır.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/hosting-php-preview" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              📄 PHP Dosyasını Gör
            </Link>
            <a 
              href="/hosting-php-preview" 
              target="_blank"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              🔗 Yeni Sekmede Aç
            </a>
            <Link 
              href="/hosting-demo" 
              className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🚀 Canlı Demo
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">🔐 Güvenli Admin Sistemi</h3>
            <p className="text-gray-600 text-sm">
              Multi-layered güvenlik ile admin girişi, IP tracking ve session management
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">⚡ PHP/MySQL Backend</h3>
            <p className="text-gray-600 text-sm">
              cPanel hosting için optimize edilmiş PHP 8.0+ ve MySQL 5.7+ desteği
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">📱 Responsive Frontend</h3>
            <p className="text-gray-600 text-sm">
              Vanilla JavaScript ile modern SPA deneyimi, mobil uyumlu tasarım
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">🔄 API Entegrasyonu</h3>
            <p className="text-gray-600 text-sm">
              MedyaBayim, ResellerProvider ve diğer popüler API'ler için hazır entegrasyon
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">📊 Detaylı Raporlama</h3>
            <p className="text-gray-600 text-sm">
              Key kullanımı, sipariş takibi ve admin dashboard ile kapsamlı analitik
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-blue-600 mb-3">🛡️ Production Ready</h3>
            <p className="text-gray-600 text-sm">
              SSL, HTTPS, güvenlik headers ve production optimizasyonları
            </p>
          </div>
        </div>

        <div className="bg-gray-800 text-white rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">🛠️ Teknoloji Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">Backend:</strong> PHP 8.0+
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">Database:</strong> MySQL 5.7+
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">Frontend:</strong> Vanilla JS
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">CSS:</strong> Custom Utility
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">Security:</strong> PDO + Sessions
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <strong className="text-green-400">Hosting:</strong> cPanel Ready
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">🚀 Kurulum Adımları</h2>
          
          <div className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-400 mb-2">1. Dosyaları Yükle</h4>
              <p className="text-sm mb-2">hosting/public_html/ klasöründeki tüm dosyaları cPanel File Manager ile yükleyin</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                cp -r hosting/public_html/* /your/hosting/public_html/
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-400 mb-2">2. Database Kur</h4>
              <p className="text-sm mb-2">cPanel phpMyAdmin'de database_setup.sql dosyasını çalıştırın</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                mysql -u kullanici -p veritabani &lt; database_setup.sql
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-400 mb-2">3. Ayarları Yap</h4>
              <p className="text-sm mb-2">api/config/database.php dosyasında database bilgilerini güncelleyin</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                define('DB_HOST', 'localhost');<br/>
                define('DB_NAME', 'keypanel_db');<br/>
                define('DB_USER', 'keypanel_user');
              </div>
            </div>

            <div className="bg-white/10 p-4 rounded-lg border-l-4 border-green-400">
              <h4 className="font-semibold text-green-400 mb-2">4. Test Et</h4>
              <p className="text-sm mb-2">Sitenizi ziyaret ederek kurulumun başarılı olduğunu kontrol edin</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                https://yoursite.com &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Ana sayfa<br/>
                https://yoursite.com#admin &nbsp;&nbsp;&nbsp;&nbsp;# Admin paneli
              </div>
            </div>

            <div className="bg-yellow-500 text-gray-900 p-4 rounded-lg">
              <strong className="block mb-2">⚠️ Önemli Güvenlik Notu:</strong>
              İlk kurulum sonrası admin şifresini mutlaka değiştirin ve database bilgilerini güvenlik altına alın.
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">🎯 Varsayılan Giriş Bilgileri</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            <strong>Admin URL:</strong> https://yoursite.com#admin<br/>
            <strong>Kullanıcı:</strong> admin<br/>
            <strong>Şifre:</strong> admin123<br/>
            <strong>Güvenlik Sorusu:</strong> Kiwi doğum tarihi (29/05/2020)
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">📁 Dosya Yapısı</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
            hosting/<br/>
            ├── public_html/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Web dosyaları<br/>
            │ &nbsp;&nbsp;├── index.php &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Ana sayfa (PHP Router)<br/>
            │ &nbsp;&nbsp;├── .htaccess &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Apache yapılandırması<br/>
            │ &nbsp;&nbsp;├── api/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Backend API<br/>
            │ &nbsp;&nbsp;│ &nbsp;&nbsp;├── index.php &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# API Gateway<br/>
            │ &nbsp;&nbsp;│ &nbsp;&nbsp;├── config/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Database config<br/>
            │ &nbsp;&nbsp;│ &nbsp;&nbsp;├── routes/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# API Routes<br/>
            │ &nbsp;&nbsp;│ &nbsp;&nbsp;└── includes/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Helper functions<br/>
            │ &nbsp;&nbsp;└── assets/ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# CSS, JS, resimler<br/>
            ├── database_setup.sql &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# MySQL kurulum scripti<br/>
            ├── KURULUM_TALIMATLARI.md # Detaylı kurulum rehberi<br/>
            └── README.md &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;# Dokümantasyon
          </div>
        </div>
      </div>
    </div>
  );
}