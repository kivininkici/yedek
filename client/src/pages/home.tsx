import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Star, TrendingUp, Activity, LogOut, User, ExternalLink, Search, ShoppingCart, Crown, Sparkles, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { UserCursorFollower } from "@/hooks/useMouseTracking";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Floating Particles Component
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large Background Particles */}
      <motion.div 
        className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div 
        className="absolute w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
        animate={{ 
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '60%', right: '15%' }}
      />
      <motion.div 
        className="absolute w-64 h-64 bg-cyan-500/8 rounded-full blur-2xl"
        animate={{ 
          x: [0, 60, 0],
          y: [0, -40, 0],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ top: '40%', left: '60%' }}
      />
      
      {/* Small Floating Icons */}
      <motion.div 
        className="absolute w-8 h-8 bg-blue-400/20 rounded-lg flex items-center justify-center"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '20%', left: '20%' }}
      >
        <KeyRound className="w-4 h-4 text-blue-400" />
      </motion.div>
      
      <motion.div 
        className="absolute w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center"
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, -15, 15, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ top: '70%', right: '25%' }}
      >
        <Star className="w-4 h-4 text-purple-400" />
      </motion.div>
      
      <motion.div 
        className="absolute w-8 h-8 bg-emerald-400/20 rounded-lg flex items-center justify-center"
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ top: '45%', right: '40%' }}
      >
        <Zap className="w-4 h-4 text-emerald-400" />
      </motion.div>
      
      <motion.div 
        className="absolute w-8 h-8 bg-pink-400/20 rounded-lg flex items-center justify-center"
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 20, -20, 0]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        style={{ top: '15%', right: '30%' }}
      >
        <Shield className="w-4 h-4 text-pink-400" />
      </motion.div>
      
      {/* Tiny sparkles */}
      <motion.div 
        className="absolute w-2 h-2 bg-blue-300 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '25%', left: '70%' }}
      />
      
      <motion.div 
        className="absolute w-2 h-2 bg-purple-300 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        style={{ top: '80%', left: '30%' }}
      />
      
      <motion.div 
        className="absolute w-2 h-2 bg-cyan-300 rounded-full"
        animate={{ 
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        style={{ top: '60%', left: '80%' }}
      />
    </div>
  );
};

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { admin } = useAdminAuth();

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div 
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <KeyRound className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Additional Static Particles like in auth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradual orbs */}
        <motion.div 
          className="absolute w-80 h-80 bg-blue-500/6 rounded-full blur-3xl"
          animate={{ 
            x: [0, 40, 0],
            y: [0, -30, 0],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '10%', left: '5%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
          animate={{ 
            x: [0, -35, 0],
            y: [0, 25, 0],
            scale: [1, 0.85, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '50%', right: '5%' }}
        />
        
        {/* Small floating dots */}
        <motion.div 
          className="absolute w-3 h-3 bg-blue-400/50 rounded-full"
          animate={{ 
            y: [0, -40, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '25%', left: '20%' }}
        />
        
        <motion.div 
          className="absolute w-2 h-2 bg-purple-400/60 rounded-full"
          animate={{ 
            y: [0, -25, 0],
            x: [0, 15, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ top: '70%', left: '80%' }}
        />
        
        <motion.div 
          className="absolute w-4 h-4 bg-cyan-400/40 rounded-full"
          animate={{ 
            y: [0, -35, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ top: '80%', left: '15%' }}
        />
        
        <motion.div 
          className="absolute w-3 h-3 bg-pink-400/50 rounded-full"
          animate={{ 
            y: [0, -45, 0],
            x: [0, -20, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ top: '30%', right: '20%' }}
        />
        
        <motion.div 
          className="absolute w-2 h-2 bg-emerald-400/70 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{ top: '85%', right: '35%' }}
        />
      </div>
      
      {/* User Cursor Effect */}
      <UserCursorFollower />
      
      {/* Header */}
      <motion.header 
        className="border-b border-white/10 backdrop-blur-xl bg-black/20 relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(147, 51, 234, 0.4)",
                    "0 0 20px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <KeyRound className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  KeyPanel
                </motion.h1>
                <motion.p 
                  className="text-blue-200 text-sm flex items-center space-x-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Crown className="w-3 h-3" />
                  <span>Premium Experience</span>
                </motion.p>
              </div>
            </motion.div>

            {/* User Info & Actions */}
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Satın Al</span>
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{user?.username || 'Kullanıcı'}</span>
              </motion.div>
              
              {/* Admin Panel Button - Only for users who are admins */}
              {user?.isAdmin && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline"
                    className="border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300"
                    onClick={() => window.location.href = '/admin'}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </motion.div>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={async () => {
                    try {
                      await fetch('/api/logout', { method: 'POST' });
                      window.location.href = '/auth';
                    } catch (error) {
                      window.location.href = '/auth';
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-red-400/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Premium Badge */}
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 px-4 py-2 rounded-full border border-blue-400/30 backdrop-blur-sm mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-blue-200 text-sm font-medium">Türkiye'nin #1 Sosyal Medya Paneli</span>
          </motion.div>

          <motion.h2 
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            KeyPanel
          </motion.h2>
          
          <motion.h3
            className="text-2xl md:text-3xl font-semibold mb-4 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            Premium Experience
          </motion.h3>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <span className="text-blue-400 font-semibold">5000+</span> aktif servis ile Instagram, TikTok, YouTube ve daha fazlası. 
            <span className="text-emerald-400 font-semibold"> Anlık teslimat</span> ve 
            <span className="text-purple-400 font-semibold"> 7/24 güvenilir hizmet.</span>
          </motion.p>
          
          {/* Service Stats Badge */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-400/20">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-blue-200 text-sm">5.847 Aktif Servis</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-500/10 rounded-full border border-purple-400/20">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200 text-sm">%99.8 Başarı Oranı</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-400/20">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-200 text-sm">2-30 Sn Teslimat</span>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            {/* Only show register/login button for non-authenticated users */}
            {!user && (
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl transition-all duration-300 flex items-center space-x-3"
                  onClick={() => window.location.href = '/user'}
                >
                  <KeyRound className="w-6 h-6" />
                  <span>Kayıt Ol / Giriş Yap</span>
                  <Sparkles className="w-5 h-5" />
                </Button>
              </motion.div>
            )}
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                size="lg" 
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-cyan-200 font-bold px-12 py-6 text-xl rounded-2xl transition-all duration-300 flex items-center space-x-3"
                style={{
                  boxShadow: '0 0 0 2px rgba(34, 211, 238, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-6 h-6" />
                <span>Key Kullan</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ 
                scale: 1.05,
                y: -5,
                boxShadow: "0 20px 40px rgba(34, 197, 94, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                size="lg" 
                className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-bold px-12 py-6 text-xl rounded-2xl transition-all duration-300 flex items-center space-x-3"
                style={{
                  boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3), 0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => window.location.href = '/order-search'}
              >
                <Search className="w-6 h-6" />
                <span>Sipariş Sorgula</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          {[
            {
              icon: Zap,
              title: "Hızlı İşlem",
              description: "Key kodunuzu girin ve hemen sosyal medya hizmetlerinize başlayın. Anında işlem garantisi.",
              color: "blue",
              gradient: "from-blue-500 to-cyan-500"
            },
            {
              icon: Users,
              title: "Güvenilir Hizmet", 
              description: "Instagram, YouTube, Twitter ve daha fazla platform için güvenli ve kaliteli hizmetler.",
              color: "purple",
              gradient: "from-purple-500 to-pink-500"
            },
            {
              icon: Activity,
              title: "Canlı Takip",
              description: "Siparişlerinizi gerçek zamanlı olarak takip edin ve durumunu anında öğrenin.",
              color: "emerald",
              gradient: "from-emerald-500 to-teal-500"
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 2.2 + index * 0.2 }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardHeader>
                  <CardTitle className={`flex items-center text-${feature.color}-400`}>
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="w-6 h-6 mr-2" />
                    </motion.div>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Service Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.8 }}
        >
          {[
            { stat: "5.847", label: "Aktif Servis", color: "blue", icon: Activity },
            { stat: "50K+", label: "Tamamlanan Sipariş", color: "purple", icon: TrendingUp },
            { stat: "24/7", label: "Destek", color: "emerald", icon: Shield },
            { stat: "⭐ 4.9", label: "Müşteri Memnuniyeti", color: "yellow", icon: Star }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 3 + index * 0.1 }}
              whileHover={{ 
                y: -5,
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-${item.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <motion.div
                className="relative z-10"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <item.icon className={`w-6 h-6 text-${item.color}-400 mx-auto mb-2`} />
                <motion.div 
                  className={`text-3xl font-bold text-${item.color}-400 mb-2`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 3.2 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {item.stat}
                </motion.div>
                <div className="text-gray-300 text-sm">{item.label}</div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
}