import { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.tokenChecker': 'Token Checker',
    'nav.history': 'History',
    'nav.premium': 'Premium',
    'nav.logout': 'Logout',
    
    // Dashboard Stats
    'stats.totalChecks': 'Total Checks',
    'stats.validTokens': 'Valid Tokens',
    'stats.invalidTokens': 'Invalid Tokens',
    'stats.successRate': 'Success Rate',
    
    // Token Checker
    'checker.title': 'Token Checker',
    'checker.description': 'Validate your tokens with our advanced checking system',
    'checker.filterType': 'Filter Type',
    'checker.all': 'All',
    'checker.outlook': 'Outlook',
    'checker.token': 'Token',
    'checker.singleCheck': 'Single Token Check',
    'checker.tokenPlaceholder': 'Enter token (format: outlook:pass:token)',
    'checker.check': 'Check',
    'checker.bulkCheck': 'Bulk Token Check',
    'checker.bulkPlaceholder': 'Enter multiple tokens (one per line)',
    'checker.premium': 'PREMIUM',
    'checker.upgradeForBulk': 'Upgrade to Premium for bulk checking',
    'checker.upgradeNow': 'Upgrade Now',
    
    // Token Parser
    'parser.title': 'Token Information Parser',
    'parser.description': 'Extract and organize token information automatically',
    'parser.extractOutlook': 'Extract Outlook',
    'parser.extractTokens': 'Extract Tokens',
    'parser.extractAll': 'Extract All',
    
    // Account Status
    'account.status': 'Account Status',
    'account.plan': 'Plan',
    'account.checksToday': 'Checks Today',
    'account.free': 'Free',
    'account.premium': 'Premium',
    
    // Premium Upgrade
    'premium.title': 'Upgrade to Premium',
    'premium.description': 'Unlock unlimited checks, bulk processing, and advanced features',
    'premium.unlimited': 'Unlimited token checks',
    'premium.bulk': 'Bulk token processing',
    'premium.parser': 'Token information parser',
    'premium.support': 'Priority support',
    'premium.price': 'Upgrade Now - $9.99/month',
    
    // Results
    'results.title': 'Recent Results',
    'results.clearAll': 'Clear All',
    'results.token': 'Token',
    'results.type': 'Type',
    'results.status': 'Status',
    'results.checked': 'Checked',
    'results.actions': 'Actions',
    'results.copy': 'Copy',
    'results.retry': 'Retry',
    'results.valid': 'Valid',
    'results.invalid': 'Invalid',
    'results.checking': 'Checking...',
    'results.processing': 'Processing',
    'results.noResults': 'No results yet',
    'results.startChecking': 'Start checking tokens to see results here',
    
    // Messages
    'message.copied': 'Successfully copied',
    'message.invalidFormat': 'Invalid token format. Use: outlook:password:token',
    'message.premiumRequired': 'Premium subscription required',
    'message.dailyLimitReached': 'Daily check limit reached',
    'message.checkingToken': 'Checking token...',
    'message.tokenValid': 'Token is valid',
    'message.tokenInvalid': 'Token is invalid',
    
    // Quick Actions
    'actions.title': 'Quick Actions',
    'actions.viewHistory': 'View Check History',
    'actions.exportResults': 'Export Results',
    'actions.settings': 'Settings',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.totalUsers': 'Total Users',
    'admin.premiumUsers': 'Premium Users',
    'admin.revenue': 'Monthly Revenue',
    'admin.userManagement': 'User Management',
    'admin.createKey': 'Create Premium Key',
    'admin.duration': 'Duration (days)',
    'admin.generateKey': 'Generate Key',
    'admin.availableKeys': 'Available Keys',
    
    // Admin Panel - Enhanced
    adminDashboard: 'Admin Dashboard',
    overview: 'Overview',
    userManagement: 'User Management',
    keyManagement: 'Key Management',
    statistics: 'Statistics',
    systemSettings: 'System Settings',
    
    // Admin Stats
    totalUsers: 'Total Users',
    premiumUsers: 'Premium Users',
    freeUsers: 'Free Users',
    totalKeys: 'Total Keys',
    usedKeys: 'Used Keys',
    activeKeys: 'Active Keys',
    dailyChecks: 'Daily Checks',
    monthlyRevenue: 'Monthly Revenue',
    
    // User Management
    users: 'Users',
    allUsers: 'All Users',
    searchUsers: 'Search users...',
    role: 'Role',
    joinDate: 'Join Date',
    lastActivity: 'Last Activity',
    checksToday: 'Checks Today',
    premiumUntil: 'Premium Until',
    makeAdmin: 'Make Admin',
    makePremium: 'Make Premium',
    makeFree: 'Make Free',
    resetChecks: 'Reset Daily Checks',
    banUser: 'Ban User',
    unbanUser: 'Unban User',
    
    // Key Management
    premiumKeys: 'Premium Keys',
    allKeys: 'All Keys',
    createKey: 'Create Premium Key',
    generateKeys: 'Generate Keys',
    keyDuration: 'Duration (days)',
    keyCount: 'Number of Keys',
    generateKey: 'Generate Key',
    bulkGenerate: 'Bulk Generate',
    keyString: 'Key',
    duration: 'Duration',
    createdDate: 'Created',
    usedDate: 'Used',
    usedBy: 'Used By',
    copyKey: 'Copy Key',
    deleteKey: 'Delete Key',
    exportKeys: 'Export Keys',
    
    // Key Status
    unused: 'Unused',
    used: 'Used',
    expired: 'Expired',
    days: 'days',
    
    // Actions
    actions: 'Actions',
    view: 'View',
    promote: 'Promote',
    demote: 'Demote',
    ban: 'Ban',
    unban: 'Unban',
    refresh: 'Refresh',
    export: 'Export',
    filter: 'Filter',
    
    // Notifications
    keysGenerated: 'Premium keys generated successfully',
    userUpdated: 'User updated successfully',
    keyDeleted: 'Key deleted successfully',
    userPromoted: 'User promoted successfully',
    userDemoted: 'User demoted successfully',
    checksReset: 'Daily checks reset successfully',
    keyCopied: 'Key copied to clipboard',
    
    // Errors
    invalidDuration: 'Please enter a valid duration',
    invalidKeyCount: 'Please enter a valid number of keys',
    
    // Landing Page
    'landing.title': 'QuantumChecker',
    'landing.subtitle': 'Professional Token Validation Platform',
    'landing.description': 'Validate Discord tokens with our advanced checking system. Get detailed information including server count, friend count, and more.',
    'landing.features.title': 'Features',
    'landing.features.singleCheck': 'Single Token Validation',
    'landing.features.bulkCheck': 'Bulk Token Processing',
    'landing.features.parser': 'Information Parser',
    'landing.features.secure': 'Secure & Fast',
    'landing.getStarted': 'Get Started',
    'landing.login': 'Login',
  },
  tr: {
    // Navigation
    'nav.dashboard': 'Gösterge Paneli',
    'nav.tokenChecker': 'Token Kontrol',
    'nav.history': 'Geçmiş',
    'nav.premium': 'Premium',
    'nav.logout': 'Çıkış',
    
    // Dashboard Stats
    'stats.totalChecks': 'Toplam Kontrol',
    'stats.validTokens': 'Geçerli Token',
    'stats.invalidTokens': 'Geçersiz Token',
    'stats.successRate': 'Başarı Oranı',
    
    // Token Checker
    'checker.title': 'Token Kontrol',
    'checker.description': 'Gelişmiş kontrol sistemimizle tokenlerinizi doğrulayın',
    'checker.filterType': 'Filtre Türü',
    'checker.all': 'Hepsi',
    'checker.outlook': 'Outlook',
    'checker.token': 'Token',
    'checker.singleCheck': 'Tekil Token Kontrol',
    'checker.tokenPlaceholder': 'Token girin (format: outlook:şifre:token)',
    'checker.check': 'Kontrol Et',
    'checker.bulkCheck': 'Toplu Token Kontrol',
    'checker.bulkPlaceholder': 'Birden fazla token girin (her satıra bir tane)',
    'checker.premium': 'PREMIUM',
    'checker.upgradeForBulk': 'Toplu kontrol için Premium\'a yükseltin',
    'checker.upgradeNow': 'Şimdi Yükselt',
    
    // Token Parser
    'parser.title': 'Token Bilgi Ayırıcı',
    'parser.description': 'Token bilgilerini otomatik olarak ayırın ve düzenleyin',
    'parser.extractOutlook': 'Outlook Çıkar',
    'parser.extractTokens': 'Token Çıkar',
    'parser.extractAll': 'Hepsini Çıkar',
    
    // Account Status
    'account.status': 'Hesap Durumu',
    'account.plan': 'Plan',
    'account.checksToday': 'Bugünkü Kontroller',
    'account.free': 'Ücretsiz',
    'account.premium': 'Premium',
    
    // Premium Upgrade
    'premium.title': 'Premium\'a Yükselt',
    'premium.description': 'Sınırsız kontrol, toplu işleme ve gelişmiş özelliklerin kilidini açın',
    'premium.unlimited': 'Sınırsız token kontrolü',
    'premium.bulk': 'Toplu token işleme',
    'premium.parser': 'Token bilgi ayırıcı',
    'premium.support': 'Öncelikli destek',
    'premium.price': 'Şimdi Yükselt - Ayda $9.99',
    
    // Results
    'results.title': 'Son Sonuçlar',
    'results.clearAll': 'Hepsini Temizle',
    'results.token': 'Token',
    'results.type': 'Tür',
    'results.status': 'Durum',
    'results.checked': 'Kontrol Edildi',
    'results.actions': 'İşlemler',
    'results.copy': 'Kopyala',
    'results.retry': 'Tekrar Dene',
    'results.valid': 'Geçerli',
    'results.invalid': 'Geçersiz',
    'results.checking': 'Kontrol Ediliyor...',
    'results.processing': 'İşleniyor',
    'results.noResults': 'Henüz sonuç yok',
    'results.startChecking': 'Sonuçları görmek için token kontrolüne başlayın',
    
    // Messages
    'message.copied': 'Başarıyla kopyalandı',
    'message.invalidFormat': 'Geçersiz token formatı. Kullanın: outlook:şifre:token',
    'message.premiumRequired': 'Premium abonelik gerekli',
    'message.dailyLimitReached': 'Günlük kontrol sınırına ulaşıldı',
    'message.checkingToken': 'Token kontrol ediliyor...',
    'message.tokenValid': 'Token geçerli',
    'message.tokenInvalid': 'Token geçersiz',
    
    // Quick Actions
    'actions.title': 'Hızlı İşlemler',
    'actions.viewHistory': 'Kontrol Geçmişini Görüntüle',
    'actions.exportResults': 'Sonuçları Dışa Aktar',
    'actions.settings': 'Ayarlar',
    
    // Admin Panel
    'admin.title': 'Admin Paneli',
    'admin.totalUsers': 'Toplam Kullanıcı',
    'admin.premiumUsers': 'Premium Kullanıcı',
    'admin.revenue': 'Aylık Gelir',
    'admin.userManagement': 'Kullanıcı Yönetimi',
    'admin.createKey': 'Premium Anahtar Oluştur',
    'admin.duration': 'Süre (gün)',
    'admin.generateKey': 'Anahtar Oluştur',
    'admin.availableKeys': 'Mevcut Anahtarlar',
    
    // Landing Page
    'landing.title': 'QuantumChecker',
    'landing.subtitle': 'Profesyonel Token Doğrulama Platformu',
    'landing.description': 'Gelişmiş kontrol sistemimizle Discord tokenlerini doğrulayın. Sunucu sayısı, arkadaş sayısı ve daha fazlasını içeren detaylı bilgi alın.',
    'landing.features.title': 'Özellikler',
    'landing.features.singleCheck': 'Tekil Token Doğrulama',
    'landing.features.bulkCheck': 'Toplu Token İşleme',
    'landing.features.parser': 'Bilgi Ayırıcı',
    'landing.features.secure': 'Güvenli ve Hızlı',
    'landing.getStarted': 'Başlayın',
    'landing.login': 'Giriş Yap',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('tr'); // Default to Turkish

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
