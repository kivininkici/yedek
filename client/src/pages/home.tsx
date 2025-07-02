import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, Shield, Zap, Users, Star, TrendingUp, Activity, LogOut, User, ExternalLink, Search, ShoppingCart, Crown, Sparkles, CheckCircle, Send, MessageCircle, Frown, Meh, Smile, BarChart3, Globe, Clock, Award, Rocket, Target, Fingerprint, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { UserCursorFollower } from "@/hooks/useMouseTracking";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Advanced Floating Background
const AdvancedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Multiple Gradient Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950" />
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/50 via-transparent to-violet-950/50" />
      <div className="absolute inset-0 bg-gradient-to-bl from-blue-950/30 via-transparent to-purple-950/30" />
      
      {/* Animated Gradient Orbs */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.1) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: [100, 300, 100],
          y: [100, 200, 100],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.08) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{
          x: [400, 100, 400],
          y: [300, 100, 300],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.05) 40%, transparent 70%)',
          filter: 'blur(35px)',
        }}
        animate={{
          x: [200, 500, 200],
          y: [400, 150, 400],
          scale: [0.8, 1.3, 0.8],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

// Improved Stats Card Component
const StatsCard = ({ icon: Icon, number, label, color, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="relative group"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
    <Card className="relative bg-black/20 border border-white/10 backdrop-blur-xl rounded-2xl group-hover:border-white/20 transition-all duration-300">
      <CardContent className="p-6 text-center">
        <motion.div 
          className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 5 }}
        >
          <Icon className="w-7 h-7 text-white" />
        </motion.div>
        <motion.div 
          className="text-3xl font-bold text-white mb-2"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {number}
        </motion.div>
        <p className="text-white/70 font-medium">{label}</p>
      </CardContent>
    </Card>
  </motion.div>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, gradient, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay }}
    whileHover={{ scale: 1.02, y: -10 }}
    className="group"
  >
    <Card className="h-full bg-black/30 border border-white/10 backdrop-blur-xl rounded-3xl group-hover:border-white/20 transition-all duration-500 overflow-hidden">
      <div className={`absolute inset-0 ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      <CardHeader className="relative z-10 pb-4">
        <motion.div 
          className={`w-16 h-16 ${gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
          whileHover={{ rotate: 10 }}
        >
          <Icon className="w-8 h-8 text-white" />
        </motion.div>
        <CardTitle className="text-xl font-bold text-white group-hover:text-white transition-colors">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-white/80 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 360],
              boxShadow: [
                "0 0 30px rgba(59, 130, 246, 0.3)",
                "0 0 50px rgba(147, 51, 234, 0.5)",
                "0 0 30px rgba(236, 72, 153, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <KeyRound className="w-10 h-10 text-white" />
          </motion.div>
          <motion.p 
            className="text-white text-xl font-medium"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            OtoKiwi Yükleniyor...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative">
      {/* Advanced Background */}
      <AdvancedBackground />
      
      {/* User Cursor Effect */}
      <UserCursorFollower />
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-2xl bg-black/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.div 
                className="relative w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
                whileHover={{ rotate: 5 }}
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(147, 51, 234, 0.4)",
                    "0 0 25px rgba(236, 72, 153, 0.3)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <KeyRound className="w-7 h-7 text-white" />
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-30" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  OtoKiwi
                </motion.h1>
                <motion.p 
                  className="text-white/60 text-sm flex items-center space-x-1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Crown className="w-3 h-3" />
                  <span>Premium Experience</span>
                </motion.p>
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Button 
                onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Satın Al
              </Button>
              
              <Button 
                onClick={() => setShowFeedback(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Geri Bildirim
              </Button>
              
              <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-medium">{user?.username || 'Kullanıcı'}</span>
              </div>
              
              {user?.isAdmin && (
                <Button 
                  variant="outline"
                  className="border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-xl"
                  onClick={() => window.location.href = '/admin'}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
              
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
                className="border-red-400/50 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full border border-white/20 backdrop-blur-sm mb-8"
            >
              <Crown className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white/90 font-medium">Türkiye'nin #1 Sosyal Medya Paneli</span>
              <Sparkles className="w-5 h-5 text-yellow-400 ml-2" />
            </motion.div>

            {/* Main Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-7xl md:text-9xl font-black mb-6 leading-none">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  OtoKiwi
                </span>
              </h1>
              <motion.p 
                className="text-3xl md:text-4xl font-light text-white/90 mb-6"
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(90deg, #60A5FA, #A78BFA, #F472B6, #34D399)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Premium Experience
              </motion.p>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <p className="text-xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-8">
                <span className="text-blue-300 font-semibold">5000+</span> aktif servis ile Instagram, TikTok, YouTube ve daha fazlası. 
                <span className="text-emerald-300 font-semibold"> Anlık teslimat</span> ve 
                <span className="text-purple-300 font-semibold"> 7/24</span> güvenilir hizmet ile sosyal medya hedeflerinize ulaşın.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            >
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => window.location.href = '/user'}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold px-10 py-4 rounded-2xl text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 min-w-[250px] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <KeyRound className="w-6 h-6 relative z-10" />
                  <span className="relative z-10">Key Kullan</span>
                  <Rocket className="w-6 h-6 relative z-10" />
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => window.location.href = '/order-search'}
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold px-10 py-4 rounded-2xl text-lg backdrop-blur-sm transition-all duration-300 flex items-center space-x-3 min-w-[250px] hover:border-white/50"
                >
                  <Search className="w-6 h-6" />
                  <span>Sipariş Sorgula</span>
                  <Target className="w-6 h-6" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <StatsCard 
                icon={Activity} 
                number="5.847" 
                label="Aktif Servis" 
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                delay={0.1}
              />
              <StatsCard 
                icon={TrendingUp} 
                number="50K+" 
                label="Tamamlanan Sipariş" 
                color="bg-gradient-to-r from-purple-500 to-pink-500"
                delay={0.2}
              />
              <StatsCard 
                icon={Clock} 
                number="24/7" 
                label="Canlı Destek" 
                color="bg-gradient-to-r from-emerald-500 to-teal-500"
                delay={0.3}
              />
              <StatsCard 
                icon={Star} 
                number="4.9" 
                label="Müşteri Memnuniyeti" 
                color="bg-gradient-to-r from-yellow-500 to-orange-500"
                delay={0.4}
              />
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Neden OtoKiwi?
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Sosyal medya hedeflerinize ulaşmak için ihtiyacınız olan her şey burada
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon={Zap}
              title="⚡ Anlık Teslimat"
              description="Key kodunuzu girdikten sonra siparişiniz anında işleme alınır. 2-30 saniye içinde teslimat garantisi ile hızlı sonuçlar alın."
              gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
              delay={0.2}
            />
            
            <FeatureCard 
              icon={Shield}
              title="🛡️ Güvenli Hizmet"
              description="Instagram, YouTube, TikTok ve daha fazla platform için %100 güvenli ve kaliteli hizmetler. Hesap güvenliğiniz bizim önceliğimiz."
              gradient="bg-gradient-to-r from-purple-500 to-pink-500"
              delay={0.4}
            />
            
            <FeatureCard 
              icon={Heart}
              title="💎 Premium Kalite"
              description="Gerçek ve aktif kullanıcılardan gelen etkileşimler. Botlarla değil, gerçek kişilerle sosyal medya hesabınızı büyütün."
              gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
              delay={0.6}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative max-w-4xl mx-auto text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />
            <Card className="relative bg-black/30 border border-white/20 backdrop-blur-xl rounded-3xl p-12">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <Fingerprint className="w-10 h-10 text-white" />
              </motion.div>
              
              <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Hemen Başlayın!
              </h3>
              
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Key kodunuzla sosyal medya hedeflerinize ulaşın. Binlerce kullanıcının tercih ettiği güvenilir platform.
              </p>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={() => window.location.href = '/user'}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold px-12 py-4 rounded-2xl text-xl shadow-2xl hover:shadow-3xl transition-all duration-300"
                >
                  <KeyRound className="w-6 h-6 mr-3" />
                  Key Kodumu Kullan
                  <Sparkles className="w-6 h-6 ml-3" />
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </section>
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
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-md w-full border border-white/20 shadow-2xl"
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
                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8 }}
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-3xl font-bold text-white mb-4">Teşekkürler!</h3>
                  <p className="text-gray-300 text-lg">Geri bildiriminiz başarıyla gönderildi.</p>
                </motion.div>
              ) : (
                <>
                  <h3 className="text-3xl font-bold text-white mb-8 text-center">Geri Bildirim</h3>
                  
                  <div className="mb-8">
                    <label className="block text-white mb-4 font-medium text-lg">Memnuniyet Düzeyiniz:</label>
                    <div className="flex justify-center space-x-6">
                      {[
                        { value: "dissatisfied", icon: Frown, color: "text-red-400", label: "Memnun Değilim" },
                        { value: "neutral", icon: Meh, color: "text-yellow-400", label: "Orta" },
                        { value: "satisfied", icon: Smile, color: "text-emerald-400", label: "Memnunum" }
                      ].map(({ value, icon: Icon, color, label }) => (
                        <motion.button
                          key={value}
                          onClick={() => setSatisfactionLevel(value)}
                          className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                            satisfactionLevel === value 
                              ? `border-current ${color} bg-current/10` 
                              : "border-gray-600 text-gray-400 hover:border-gray-500"
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Icon className="w-8 h-8" />
                          <div className="text-sm mt-2 font-medium">{label}</div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-8">
                    <label className="block text-white mb-3 font-medium text-lg">Mesajınız:</label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Geri bildiriminizi yazın..."
                      className="w-full h-32 px-4 py-3 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-lg"
                    />
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      onClick={() => setShowFeedback(false)}
                      className="flex-1 py-3 px-6 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors text-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      İptal
                    </motion.button>
                    <motion.button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmittingFeedback ? (
                        <motion.div 
                          className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
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