import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield, Zap, Users, Star, CheckCircle, TrendingUp, Activity, LogIn, UserPlus, Crown, Sparkles, ShoppingCart, MessageCircle, Send, Heart } from "lucide-react";
import { useState } from "react";

import { FeedbackReminder } from "@/components/FeedbackReminder";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleFeedbackSubmit = async () => {
    if (!feedbackMessage.trim()) {
      alert("Lütfen geri bildirim mesajınızı yazın!");
      return;
    }

    setIsSubmittingFeedback(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: "",
          userName: "Ziyaretçi",
          message: feedbackMessage.trim(),
          satisfactionLevel: "satisfied"
        }),
      });

      const responseData = await response.json();
      if (response.ok) {
        // Check if user should be redirected to complaints
        if (responseData.redirectToComplaints) {
          window.location.href = '/complaints';
          return;
        }
        alert("Başarıyla Gönderildi! Teşekkür ederiz.");
        setFeedbackMessage("");
      } else {
        if (responseData.message && responseData.message.includes("Giriş yapmanız gerekli")) {
          alert("Geri bildirim göndermek için lütfen giriş yapın!");
          window.location.href = '/auth';
        } else {
          alert("Geri bildirim gönderilirken hata oluştu!");
        }
      }
    } catch (error) {
      console.error("Feedback error:", error);
      alert("Geri bildirim gönderilirken hata oluştu!");
    }
    setIsSubmittingFeedback(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large floating orbs */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/2 right-10 w-5 h-5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-bounce delay-500 opacity-50"></div>
        <div className="absolute bottom-20 right-1/3 w-2 h-2 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full animate-ping delay-1000"></div>
        
        {/* Small twinkling stars */}
        <div className="absolute top-16 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/3 left-20 w-1 h-1 bg-white rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-40 left-10 w-1 h-1 bg-white rounded-full animate-ping delay-1200"></div>
        <div className="absolute top-3/4 right-20 w-1 h-1 bg-white rounded-full animate-ping delay-1500"></div>
        
        {/* Moving dots */}
        <div className="absolute top-24 left-1/2 w-2 h-2 bg-blue-300 rounded-full animate-pulse delay-800"></div>
        <div className="absolute bottom-16 left-1/4 w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-1100"></div>
      </div>
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                  <KeyRound className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    OtoKiwi
                  </h1>
                  <p className="text-sm text-gray-400">Premium Key Yönetimi</p>
                </div>
              </div>
              {/* Modern Header Actions */}
              <div className="flex items-center space-x-2 md:space-x-3">
                
                {/* Satın Al Button - Always visible */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur-md opacity-60 group-hover:opacity-80 transition-all duration-300"></div>
                  <Button 
                    onClick={() => window.open('https://www.itemsatis.com/p/KiwiPazari', '_blank')}
                    className="relative bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-4 md:px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Satın Al</span>
                    <span className="sm:hidden">Al</span>
                  </Button>
                </div>

                {/* Geri Bildirim Button - Always visible */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                  <Button 
                    onClick={() => setShowFeedback(true)}
                    className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-4 md:px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm !important"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Geri Bildirim</span>
                    <span className="sm:hidden">Feedback</span>
                  </Button>
                </div>

                {/* Kullanıcı Adı/Profil - Authenticated users only */}
                {isAuthenticated && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                    <div className="relative flex items-center space-x-3 bg-gradient-to-r from-purple-500 to-violet-500 border border-white/20 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-white font-bold text-sm">{user?.username || 'Kullanıcı'}</p>
                        <p className="text-white/80 text-xs">{user?.email || 'Admin'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Panel Button - ONLY for admin users */}
                {isAuthenticated && user?.isAdmin && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                    <Button 
                      onClick={() => window.location.href = '/admin'}
                      className="relative bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold px-4 md:px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Admin Panel</span>
                      <span className="sm:hidden">Admin</span>
                    </Button>
                  </div>
                )}

                {/* Çıkış Button - Authenticated users only */}
                {isAuthenticated && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                    <Button 
                      onClick={() => {
                        fetch('/api/logout', { method: 'POST' })
                          .then(() => window.location.reload());
                      }}
                      className="relative bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white font-bold px-4 md:px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm"
                    >
                      <LogIn className="w-4 h-4 mr-2 rotate-180" />
                      <span className="hidden sm:inline">Çıkış</span>
                      <span className="sm:hidden">Çık</span>
                    </Button>
                  </div>
                )}

                {/* Giriş Yap Button - Non-authenticated users only */}
                {!isAuthenticated && (
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-300"></div>
                    <Button 
                      onClick={() => window.location.href = '/auth'}
                      className="relative bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold px-4 md:px-6 py-2.5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 border border-white/20 backdrop-blur-sm"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Giriş Yap</span>
                      <span className="sm:hidden">Giriş</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-full mb-8 backdrop-blur-sm">
                <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-white">
                  Türkiye'nin #1 Sosyal Medya Paneli
                </span>
              </div>
              
              <h2 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  OtoKiwi
                </span>
                <br />
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Premium Experience
                </span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-12 max-w-4xl mx-auto">
                <span className="text-blue-400 font-bold">5000+</span> aktif servis ile Instagram, TikTok, YouTube ve daha fazlası.
                <br />
                <span className="text-emerald-400 font-bold">Anlık teslimat</span> ve 
                <span className="text-purple-400 font-bold"> 7/24 güvenilir</span> hizmet.
              </p>
              
              {/* Enhanced Live Stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 to-green-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative flex items-center space-x-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 backdrop-blur-sm px-6 py-4 rounded-2xl hover:scale-105 transition-all duration-300">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold text-lg">5.847</p>
                      <p className="text-white text-sm">Aktif Servis</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative flex items-center space-x-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm px-6 py-4 rounded-2xl hover:scale-105 transition-all duration-300">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-lg">%99.8</p>
                      <p className="text-white text-sm">Başarı Oranı</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                  <div className="relative flex items-center space-x-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm px-6 py-4 rounded-2xl hover:scale-105 transition-all duration-300">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-purple-400 font-bold text-lg">2-30s</p>
                      <p className="text-white text-sm">Teslimat</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
              <Button 
                size="lg"
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
              >
                <UserPlus className="w-6 h-6 mr-3" />
                Kayıt Ol / Giriş Yap
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-12 py-6 text-xl rounded-2xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                onClick={() => window.location.href = '/user'}
              >
                <KeyRound className="w-6 h-6 mr-3" />
                Key Kullan
              </Button>
            </div>

            {/* Floating Service Icons */}
            <div className="relative max-w-4xl mx-auto h-32">
              <div className="absolute -top-4 left-16 w-16 h-16 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-pink-400/30 animate-bounce">
                <span className="text-2xl">📷</span>
              </div>
              <div className="absolute top-8 right-20 w-14 h-14 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30 animate-bounce delay-500">
                <span className="text-xl">🎵</span>
              </div>
              <div className="absolute -bottom-2 left-1/3 w-18 h-18 bg-gradient-to-br from-red-500/30 to-pink-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-400/30 animate-bounce delay-1000">
                <span className="text-2xl">📹</span>
              </div>
              <div className="absolute top-4 left-1/2 w-12 h-12 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm border border-purple-400/30 animate-bounce delay-1500">
                <span className="text-lg">💎</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-400/30 rounded-full mb-8 backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-white">SMMKİWİ</span>
              </div>
              <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Neden OtoKiwi?
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Sektörün en gelişmiş teknolojisi ile sosyal medya büyümenizi hızlandırın
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-400/50 hover:border-purple-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Güvenli Key Sistemi</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Tek kullanımlık anahtarlar ile maksimum güvenlik ve tam kontrol sağlar.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 border-emerald-400/50 hover:border-emerald-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Zap className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Anlık Teslimat</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    2-30 saniye içinde sipariş işleme ve gerçek zamanlı teslimat garantisi.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border-blue-400/50 hover:border-blue-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Çoklu Platform</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Instagram, YouTube, TikTok ve 100+ platform için kapsamlı hizmet.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/30 to-orange-500/30 border-amber-400/50 hover:border-amber-300/70 transition-all duration-500 hover:scale-105 backdrop-blur-sm shadow-lg">
                <CardHeader className="p-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <KeyRound className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-black text-white mb-3">Kolay Yönetim</CardTitle>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <p className="text-lg font-medium leading-relaxed text-[#3c445c]">
                    Gelişmiş admin paneli ile tam kontrol ve detaylı analitik.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Feedback Section - Only show for non-authenticated users */}
        {!isAuthenticated && (
        <section className="py-20 relative border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 rounded-full mb-8 backdrop-blur-sm">
                <MessageCircle className="w-5 h-5 text-emerald-400 mr-2" />
                <span className="text-sm font-medium text-white">GERİ BİLDİRİM</span>
              </div>
              <h3 className="text-5xl font-black mb-6 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Deneyiminizi Paylaşın
              </h3>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
                OtoKiwi ile ilgili görüşleriniz bizim için çok değerli. Önerilerinizi ve deneyimlerinizi paylaşın.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/30 hover:border-emerald-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <CardHeader className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Değerlendirme</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 text-center">
                    <p className="text-gray-300 mb-4">Hizmetimizi 1-5 yıldız ile değerlendirin</p>
                    <div className="flex justify-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-6 h-6 text-yellow-400 fill-current hover:scale-110 transition-transform cursor-pointer" />
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/30 hover:border-blue-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <CardHeader className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Yorum</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 text-center">
                    <p className="text-gray-300 mb-4">Deneyiminizi detaylı olarak paylaşın</p>
                    <Button 
                      variant="outline" 
                      className="border-blue-400/50 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 hover:text-blue-200"
                    >
                      Yorum Yaz
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-400/30 hover:border-purple-300/50 transition-all duration-300 hover:scale-105 backdrop-blur-sm">
                  <CardHeader className="p-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-white">Öneri</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 text-center">
                    <p className="text-gray-300 mb-4">Geliştirme önerilerinizi iletin</p>
                    <Button 
                      variant="outline" 
                      className="border-purple-400/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-purple-200"
                    >
                      Öneri Gönder
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <h4 className="text-2xl font-bold text-white mb-4">Hızlı Geri Bildirim</h4>
                  <p className="text-gray-300 mb-6">
                    OtoKiwi deneyiminizle ilgili hızlı bir geri bildirim gönderin
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input 
                      type="text" 
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder="Geri bildiriminizi yazın..."
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 backdrop-blur-sm"
                      disabled={isSubmittingFeedback}
                    />
                    <Button 
                      onClick={handleFeedbackSubmit}
                      disabled={!feedbackMessage.trim() || isSubmittingFeedback}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmittingFeedback ? "Gönderiliyor..." : "Gönder"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* Footer */}
        <footer className="border-t border-white/10 bg-black/20 py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OtoKiwi
                </h3>
              </div>
              <p className="text-gray-400 mb-8">
                Türkiye'nin en güvenilir sosyal medya paneli
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <span>© 2025 OtoKiwi</span>
                <span>•</span>
                <span>Tüm hakları saklıdır</span>
                <span>•</span>
                <span>Premium Hizmet</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
      {/* Enhanced Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800/95 via-blue-900/90 to-slate-800/95 border border-blue-400/30 rounded-3xl p-8 max-w-lg w-full relative shadow-2xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-red-500/20 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg hover:shadow-red-500/20 z-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative z-10">
              <div className="text-center mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <KeyRound className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-black text-white mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  OtoKiwi'e Hoş Geldin! 🎉
                </h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Premium sosyal medya deneyimine hazır mısın?
                  <br />
                  <span className="text-blue-400 font-semibold">Hemen başla</span> ve farkı hisset!
                </p>
              </div>

              <div className="space-y-6">
                <Button 
                  onClick={() => {
                    setShowAuthModal(false);
                    window.location.href = '/auth';
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 text-lg"
                >
                  <UserPlus className="w-6 h-6 mr-3" />
                  Şimdi Başla - Kayıt Ol / Giriş Yap
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-400 mb-4">Veya direkt key kullanmaya başla</p>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setShowAuthModal(false);
                      window.location.href = '/user';
                    }}
                    className="border-2 border-emerald-400/50 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-bold px-6 py-3 rounded-xl backdrop-blur-sm hover:scale-105 transition-all duration-300"
                  >
                    <KeyRound className="w-5 h-5 mr-2" />
                    Key Doğrula & Kullan
                  </Button>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="p-5 bg-gradient-to-r from-emerald-500/15 to-blue-500/15 border border-emerald-400/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-emerald-400 font-bold text-sm mb-1">%100 Güvenli Sistem</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Tek kullanımlık key sistemi ile maksimum güvenlik
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 bg-gradient-to-r from-blue-500/15 to-purple-500/15 border border-blue-400/30 rounded-2xl backdrop-blur-sm">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-sm mb-1">Anlık Teslimat</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        2-30 saniye içinde hızlı sonuç garantisi
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Reminder */}
      {showFeedback && (
        <FeedbackReminder
          onClose={() => setShowFeedback(false)}
          userEmail=""
          userName="Ziyaretçi"
        />
      )}
    </div>
  );
}