import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Star, TrendingUp, Activity, LogOut, User, ExternalLink, Search, ShoppingCart, Crown, Sparkles, CheckCircle, Send, MessageCircle, Frown, Meh, Smile, BarChart3, Globe, Clock, Award } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { UserCursorFollower } from "@/hooks/useMouseTracking";
import { motion, AnimatePresence } from "framer-motion";
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
    </div>
  );
};

export default function Home() {
  const { user, isLoading: userLoading } = useAuth();
  const { admin } = useAdminAuth();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) {
      alert("Lütfen geri bildirim mesajınızı yazın!");
      return;
    }
    
    if (!satisfactionLevel) {
      alert("Lütfen memnuniyet düzeyinizi seçin!");
      return;
    }
    
    setIsSubmittingFeedback(true);
    try {
      const payload = {
        userEmail: user?.email || "",
        userName: user?.username || "Kullanıcı",
        message: feedbackMessage.trim(),
        satisfactionLevel,
      };
      
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const responseData = await response.json();
      if (response.ok) {
        // Check if user should be redirected to complaints
        if (responseData.redirectToComplaints) {
          setShowFeedback(false);
          window.location.href = '/complaints';
          return;
        }
        setFeedbackSubmitted(true);
        setFeedbackMessage("");
        setSatisfactionLevel("");
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackSubmitted(false);
        }, 2000);
      } else {
        throw new Error(responseData.message || "Geri bildirim gönderilirken hata oluştu");
      }
    } catch (error) {
      alert("Geri bildirim gönderilirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

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
                  OtoKiwi
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setShowFeedback(true)}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 flex items-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Geri Bildirim</span>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 relative z-10">
        {/* Hero Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full mb-6 border border-blue-400/30"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Crown className="w-4 h-4 text-yellow-400 mr-2" />
            <span className="text-blue-200 text-sm font-medium">Türkiye'nin #1 Sosyal Medya Paneli</span>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
          >
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              OtoKiwi
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-2xl text-blue-200 mb-8 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            Premium Experience
          </motion.p>
          
          <motion.p 
            className="text-lg text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <span className="text-blue-300 font-semibold">5000+</span> aktif servis ile Instagram, TikTok, YouTube ve daha fazlası. 
            <span className="text-emerald-300 font-semibold"> Anlık teslimat</span> ve 
            <span className="text-purple-300 font-semibold"> 7/24</span> güvenilir hizmet.
          </motion.p>

          {/* Stats */}
          <motion.div 
            className="flex flex-wrap justify-center gap-6 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.3 }}
          >
            <motion.div 
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-3 rounded-full border border-blue-400/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(59, 130, 246, 0.3)" }}
            >
              <span className="text-blue-300 font-semibold">✓ 5.847 Aktif Servis</span>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-6 py-3 rounded-full border border-purple-400/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(147, 51, 234, 0.3)" }}
            >
              <span className="text-purple-300 font-semibold">📈 %99.8 Başarı Oranı</span>
            </motion.div>
            
            <motion.div 
              className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 px-6 py-3 rounded-full border border-emerald-400/30"
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(16, 185, 129, 0.3)" }}
            >
              <span className="text-emerald-300 font-semibold">⚡ 2-30 Sn Teslimat</span>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => window.location.href = '/user'}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 min-w-[200px]"
              >
                <KeyRound className="w-6 h-6" />
                <span>Key Kullan</span>
              </Button>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                onClick={() => window.location.href = '/order-search'}
                variant="outline"
                className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-1 flex items-center space-x-3 min-w-[200px]"
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
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.7 }}
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-400/30 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-3">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold text-white">⚡ Hızlı İşlem</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-blue-200">
                  Key kodunuzu girin ve hemen sosyal medya hizmetlerinize başlayın. Anında işlem garantisi.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border border-purple-400/30 backdrop-blur-xl hover:border-purple-400/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-3">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: -10 }}
                >
                  <Shield className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold text-white">🛡️ Güvenilir Hizmet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-purple-200">
                  Instagram, YouTube, Twitter ve daha fazla platform için güvenli ve kaliteli hizmetler.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <Card className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 border border-emerald-400/30 backdrop-blur-xl hover:border-emerald-400/50 transition-all duration-300 group">
              <CardHeader className="text-center pb-3">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 10 }}
                >
                  <Clock className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold text-white">📊 Canlı Takip</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-emerald-200">
                  Siparişlerinizi gerçek zamanlı olarak takip edin ve durumunu anında öğrenin.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.9 }}
        >
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-4xl font-bold text-blue-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            >
              5.847
            </motion.div>
            <p className="text-blue-200">Aktif Servis</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-4xl font-bold text-purple-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              50K+
            </motion.div>
            <p className="text-purple-200">Tamamlanan Sipariş</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-4xl font-bold text-emerald-400 mb-2"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              24/7
            </motion.div>
            <p className="text-emerald-200">Destek</p>
          </motion.div>
          
          <motion.div 
            className="text-center"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div 
              className="text-4xl font-bold text-yellow-400 mb-2 flex items-center justify-center"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            >
              <Star className="w-8 h-8 mr-1" />
              4.9
            </motion.div>
            <p className="text-yellow-200">Müşteri Memnuniyeti</p>
          </motion.div>
        </motion.div>
      </main>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFeedback(false)}
          >
            <motion.div 
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {feedbackSubmitted ? (
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Teşekkürler!</h3>
                  <p className="text-gray-300">Geri bildiriminiz başarıyla gönderildi.</p>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">Geri Bildirim</h3>
                  
                  {/* Satisfaction Level */}
                  <div className="mb-6">
                    <label className="block text-white mb-3 font-medium">Memnuniyet Düzeyiniz:</label>
                    <div className="flex justify-center space-x-4">
                      {[
                        { value: "dissatisfied", icon: Frown, color: "text-red-400", label: "Memnun Değilim" },
                        { value: "neutral", icon: Meh, color: "text-yellow-400", label: "Orta" },
                        { value: "satisfied", icon: Smile, color: "text-emerald-400", label: "Memnunum" }
                      ].map(({ value, icon: Icon, color, label }) => (
                        <motion.button
                          key={value}
                          onClick={() => setSatisfactionLevel(value)}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            satisfactionLevel === value 
                              ? `border-current ${color} bg-current/10` 
                              : "border-gray-600 text-gray-400 hover:border-gray-500"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-8 h-8" />
                          <div className="text-xs mt-1">{label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label className="block text-white mb-2 font-medium">Mesajınız:</label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Geri bildiriminizi yazın..."
                      className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex space-x-3">
                    <motion.button
                      onClick={() => setShowFeedback(false)}
                      className="flex-1 py-3 px-4 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      İptal
                    </motion.button>
                    <motion.button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmittingFeedback ? (
                        <motion.div 
                          className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gönder</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}