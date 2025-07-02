import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, User, Shield, ArrowLeft, Sparkles, CheckCircle, Loader2, Lock, Unlock, Crown, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

// Modern Background Component
const ModernLoginBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
      
      {/* Animated orbs */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, rgba(147, 51, 234, 0.2) 40%, transparent 70%)',
          filter: 'blur(80px)',
          top: '10%', 
          right: '10%'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '20%', 
          left: '10%'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
};

// Success Animation Component
const SuccessAnimation = () => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
        animate={{ 
          scale: [1, 1.2, 1],
          boxShadow: [
            "0 0 30px rgba(16, 185, 129, 0.5)",
            "0 0 60px rgba(16, 185, 129, 0.8)",
            "0 0 30px rgba(16, 185, 129, 0.5)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <CheckCircle className="w-12 h-12 text-white" />
      </motion.div>
      <motion.h2 
        className="text-3xl font-bold text-white mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Giriş Başarılı!
      </motion.h2>
      <motion.p 
        className="text-white/70 text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Admin paneline yönlendiriliyorsunuz...
      </motion.p>
    </motion.div>
  </motion.div>
);

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState<string>("Güvenlik sorusu yükleniyor...");
  
  // Master password state
  const [masterPasswordStep, setMasterPasswordStep] = useState(true);
  const [masterPassword, setMasterPassword] = useState("");
  const [showMasterPassword, setShowMasterPassword] = useState(false);
  const [masterPasswordLoading, setMasterPasswordLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
  });

  // Set securityQuestion value when it changes
  useEffect(() => {
    if (securityQuestion && securityQuestion !== "Güvenlik sorusu yükleniyor...") {
      setValue("securityQuestion", securityQuestion);
    }
  }, [securityQuestion, setValue]);

  // Fetch security question when moving to admin login step
  const fetchSecurityQuestion = async () => {
    try {
      const response = await apiRequest('/api/admin/security-question');
      setSecurityQuestion(response.question);
    } catch (error) {
      console.error("Error fetching security question:", error);
      setSecurityQuestion("Güvenlik sorusu yüklenemedi");
      toast({
        title: "Hata",
        description: "Güvenlik sorusu alınamadı",
        variant: "destructive",
      });
    }
  };

  // Master password verification
  const masterPasswordMutation = useMutation({
    mutationFn: async (password: string) => {
      const response = await apiRequest('/api/admin/verify-master-password', {
        method: 'POST',
        body: JSON.stringify({ masterPassword: password }),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      setMasterPasswordStep(false);
      fetchSecurityQuestion();
      toast({
        title: "Başarılı",
        description: "Master şifre doğrulandı",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Master şifre hatalı",
        variant: "destructive",
      });
    },
  });

  // Admin login mutation
  const adminLoginMutation = useMutation({
    mutationFn: async (data: AdminLogin) => {
      const response = await apiRequest('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      return response;
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Başarılı",
        description: "Admin girişi başarılı",
      });
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    },
    onError: (error: any) => {
      setIsLoading(false);
      // Fetch new security question on error
      fetchSecurityQuestion();
      toast({
        title: "Giriş Hatası",
        description: error.message || "Geçersiz kullanıcı adı, şifre veya güvenlik cevabı",
        variant: "destructive",
      });
    },
  });

  const handleMasterPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMasterPasswordLoading(true);
    masterPasswordMutation.mutate(masterPassword);
  };

  const onSubmit = (data: AdminLogin) => {
    setIsLoading(true);
    setIsSuccess(false);
    adminLoginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background */}
      <ModernLoginBackground />

      {/* Success Animation */}
      <AnimatePresence>
        {isSuccess && <SuccessAnimation />}
      </AnimatePresence>

      {/* Main Content */}
      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {masterPasswordStep ? (
            // Master Password Step
            <motion.div
              key="master-password"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 30px rgba(239, 68, 68, 0.3)",
                        "0 0 50px rgba(245, 101, 101, 0.4)",
                        "0 0 30px rgba(251, 191, 36, 0.3)"
                      ],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Lock className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Güvenlik Şifresi
                  </CardTitle>
                  <p className="text-white/60">
                    Devam etmek için master şifreyi girin
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleMasterPasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="masterPassword" className="text-white font-medium">
                        Master Şifre
                      </Label>
                      <div className="relative">
                        <Input
                          id="masterPassword"
                          type={showMasterPassword ? "text" : "password"}
                          value={masterPassword}
                          onChange={(e) => setMasterPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="Master şifreyi girin"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowMasterPassword(!showMasterPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showMasterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={masterPasswordMutation.isPending || !masterPassword}
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        >
                          {masterPasswordMutation.isPending ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Doğrulanıyor...
                            </>
                          ) : (
                            <>
                              <Unlock className="w-5 h-5 mr-2" />
                              Şifreyi Doğrula
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 py-3 rounded-xl"
                          >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Ana Sayfaya Dön
                          </Button>
                        </Link>
                      </motion.div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Admin Login Step
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 30px rgba(59, 130, 246, 0.3)",
                        "0 0 50px rgba(147, 51, 234, 0.4)",
                        "0 0 30px rgba(236, 72, 153, 0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Crown className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Admin Girişi
                  </CardTitle>
                  <p className="text-white/60">
                    Yönetici bilgilerinizi girin
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white font-medium">
                        Kullanıcı Adı
                      </Label>
                      <div className="relative">
                        <Input
                          id="username"
                          type={showUsername ? "text" : "password"}
                          {...register("username")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="Admin kullanıcı adı"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUsername(!showUsername)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showUsername ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.username && (
                        <p className="text-red-400 text-sm">{errors.username.message}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-white font-medium">
                        Şifre
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          {...register("password")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="Admin şifresi"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-red-400 text-sm">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Security Question */}
                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer" className="text-white font-medium">
                        Güvenlik Sorusu
                      </Label>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-2">
                        <p className="text-white/80 text-sm">{securityQuestion}</p>
                      </div>
                      <div className="relative">
                        <Input
                          id="securityAnswer"
                          type={showSecurityAnswer ? "text" : "password"}
                          {...register("securityAnswer")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="Güvenlik sorusunun cevabı"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showSecurityAnswer ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.securityAnswer && (
                        <p className="text-red-400 text-sm">{errors.securityAnswer.message}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Giriş yapılıyor...
                            </>
                          ) : (
                            <>
                              <Shield className="w-5 h-5 mr-2" />
                              Admin Girişi
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          onClick={() => setMasterPasswordStep(true)}
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 py-3 rounded-xl"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Geri Dön
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}