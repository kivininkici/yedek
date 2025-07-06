// Configuration for OtoKiwi cPanel version

const config = {
    // Application settings
    app: {
        name: 'OtoKiwi',
        version: '1.0.0',
        description: 'Key Yönetim Sistemi',
        author: 'OtoKiwi Team'
    },
    
    // API configuration
    api: {
        baseUrl: '/api',
        timeout: 30000, // 30 seconds
        retries: 3,
        retryDelay: 1000 // 1 second
    },
    
    // UI configuration
    ui: {
        theme: 'dark',
        animations: true,
        notifications: true,
        autoRefresh: true,
        autoRefreshInterval: 30000 // 30 seconds
    },
    
    // Pagination settings
    pagination: {
        defaultLimit: 50,
        maxLimit: 100,
        showSizeOptions: [10, 25, 50, 100]
    },
    
    // Security settings
    security: {
        sessionTimeout: 7200000, // 2 hours in milliseconds
        passwordMinLength: 6,
        maxLoginAttempts: 5,
        lockoutDuration: 900000 // 15 minutes in milliseconds
    },
    
    // File upload settings
    upload: {
        maxFileSize: 10485760, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/json'],
        chunkedUpload: false
    },
    
    // Currency settings
    currency: {
        symbol: '₺',
        code: 'TRY',
        decimals: 2,
        thousandsSeparator: '.',
        decimalSeparator: ','
    },
    
    // Date/time settings
    datetime: {
        locale: 'tr-TR',
        timezone: 'Europe/Istanbul',
        dateFormat: 'dd.MM.yyyy',
        timeFormat: 'HH:mm',
        datetimeFormat: 'dd.MM.yyyy HH:mm'
    },
    
    // Social media platforms
    platforms: {
        instagram: {
            name: 'Instagram',
            icon: 'fab fa-instagram',
            color: '#E4405F',
            categories: ['followers', 'likes', 'views', 'comments']
        },
        youtube: {
            name: 'YouTube',
            icon: 'fab fa-youtube',
            color: '#FF0000',
            categories: ['subscribers', 'views', 'likes', 'comments']
        },
        twitter: {
            name: 'Twitter',
            icon: 'fab fa-twitter',
            color: '#1DA1F2',
            categories: ['followers', 'likes', 'retweets', 'views']
        },
        facebook: {
            name: 'Facebook',
            icon: 'fab fa-facebook',
            color: '#1877F2',
            categories: ['likes', 'followers', 'shares', 'comments']
        },
        tiktok: {
            name: 'TikTok',
            icon: 'fab fa-tiktok',
            color: '#000000',
            categories: ['followers', 'likes', 'views', 'shares']
        },
        spotify: {
            name: 'Spotify',
            icon: 'fab fa-spotify',
            color: '#1DB954',
            categories: ['followers', 'plays', 'saves']
        },
        telegram: {
            name: 'Telegram',
            icon: 'fab fa-telegram',
            color: '#0088CC',
            categories: ['members', 'views', 'reactions']
        },
        linkedin: {
            name: 'LinkedIn',
            icon: 'fab fa-linkedin',
            color: '#0A66C2',
            categories: ['connections', 'likes', 'shares', 'comments']
        }
    },
    
    // Order status mapping
    orderStatus: {
        pending: {
            label: 'Beklemede',
            color: 'warning',
            icon: 'fas fa-clock'
        },
        processing: {
            label: 'İşleniyor',
            color: 'info',
            icon: 'fas fa-spinner'
        },
        completed: {
            label: 'Tamamlandı',
            color: 'success',
            icon: 'fas fa-check-circle'
        },
        cancelled: {
            label: 'İptal Edildi',
            color: 'danger',
            icon: 'fas fa-times-circle'
        },
        partial: {
            label: 'Kısmi Tamamlandı',
            color: 'primary',
            icon: 'fas fa-check'
        }
    },
    
    // Key categories
    keyCategories: [
        { value: 'instagram', label: 'Instagram', icon: 'fab fa-instagram' },
        { value: 'youtube', label: 'YouTube', icon: 'fab fa-youtube' },
        { value: 'twitter', label: 'Twitter', icon: 'fab fa-twitter' },
        { value: 'facebook', label: 'Facebook', icon: 'fab fa-facebook' },
        { value: 'tiktok', label: 'TikTok', icon: 'fab fa-tiktok' },
        { value: 'spotify', label: 'Spotify', icon: 'fab fa-spotify' },
        { value: 'telegram', label: 'Telegram', icon: 'fab fa-telegram' },
        { value: 'linkedin', label: 'LinkedIn', icon: 'fab fa-linkedin' },
        { value: 'other', label: 'Diğer', icon: 'fas fa-globe' }
    ],
    
    // User roles
    userRoles: {
        user: {
            label: 'Kullanıcı',
            color: 'primary',
            permissions: ['view_own_orders', 'create_orders', 'view_services']
        },
        admin: {
            label: 'Admin',
            color: 'danger',
            permissions: ['*']
        }
    },
    
    // Notification types
    notificationTypes: {
        success: {
            icon: 'fas fa-check-circle',
            color: 'success',
            duration: 5000
        },
        error: {
            icon: 'fas fa-exclamation-circle',
            color: 'danger',
            duration: 10000
        },
        warning: {
            icon: 'fas fa-exclamation-triangle',
            color: 'warning',
            duration: 7000
        },
        info: {
            icon: 'fas fa-info-circle',
            color: 'info',
            duration: 5000
        }
    },
    
    // Chart colors
    chartColors: {
        primary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4',
        light: '#f8fafc',
        dark: '#0f172a'
    },
    
    // Avatar configuration
    avatar: {
        provider: 'dicebear',
        style: 'cats',
        variants: 24,
        size: 120
    },
    
    // External APIs
    externalApis: {
        medyabayim: {
            name: 'MedyaBayim',
            baseUrl: 'https://api.medyabayim.com/v2',
            endpoints: {
                balance: '/balance',
                services: '/services',
                order: '/order',
                status: '/status'
            }
        },
        resellerprovider: {
            name: 'ResellerProvider',
            baseUrl: 'https://api.resellerprovider.com/v2',
            endpoints: {
                balance: '/balance',
                services: '/services',
                order: '/order',
                status: '/status'
            }
        }
    },
    
    // Local storage keys
    storage: {
        user: 'otokiwi_user',
        theme: 'otokiwi_theme',
        language: 'otokiwi_language',
        settings: 'otokiwi_settings',
        loginTime: 'otokiwi_login_time'
    },
    
    // Regular expressions
    regex: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^https?:\/\/.+/,
        username: /^[a-zA-Z0-9_]{3,20}$/,
        password: /^.{6,}$/,
        key: /^[A-Za-z0-9-_]{8,}$/
    },
    
    // Error messages
    errors: {
        network: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
        server: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
        unauthorized: 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.',
        forbidden: 'Bu işlem için yetkiniz yok.',
        notFound: 'İstenen kaynak bulunamadı.',
        validation: 'Girilen bilgiler geçersiz.',
        timeout: 'İstek zaman aşımına uğradı.',
        rateLimited: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.'
    },
    
    // Success messages
    success: {
        login: 'Başarıyla giriş yapıldı.',
        register: 'Hesabınız başarıyla oluşturuldu.',
        logout: 'Başarıyla çıkış yapıldı.',
        save: 'Değişiklikler başarıyla kaydedildi.',
        delete: 'Kayıt başarıyla silindi.',
        update: 'Güncelleme başarıyla tamamlandı.',
        create: 'Kayıt başarıyla oluşturuldu.',
        copy: 'Panoya kopyalandı.'
    }
};

// Utility functions for configuration
const configUtils = {
    // Get platform by key
    getPlatform: function(key) {
        return config.platforms[key] || null;
    },
    
    // Get order status
    getOrderStatus: function(status) {
        return config.orderStatus[status] || {
            label: status,
            color: 'secondary',
            icon: 'fas fa-question'
        };
    },
    
    // Get user role
    getUserRole: function(role) {
        return config.userRoles[role] || config.userRoles.user;
    },
    
    // Format currency
    formatCurrency: function(amount) {
        return new Intl.NumberFormat(config.datetime.locale, {
            style: 'currency',
            currency: config.currency.code,
            minimumFractionDigits: config.currency.decimals,
            maximumFractionDigits: config.currency.decimals
        }).format(amount);
    },
    
    // Format date
    formatDate: function(date, includeTime = false) {
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return new Intl.DateTimeFormat(config.datetime.locale, options).format(new Date(date));
    },
    
    // Validate input
    validate: function(type, value) {
        const regex = config.regex[type];
        return regex ? regex.test(value) : true;
    },
    
    // Get avatar URL
    getAvatarUrl: function(seed = 1) {
        return `https://api.dicebear.com/7.x/${config.avatar.style}/svg?seed=${seed}`;
    },
    
    // Get chart color
    getChartColor: function(index) {
        const colors = Object.values(config.chartColors);
        return colors[index % colors.length];
    }
};

// Export configuration globally
window.config = config;
window.configUtils = configUtils;