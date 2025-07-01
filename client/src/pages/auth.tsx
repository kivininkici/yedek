import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  KeyRound,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  LogIn,
  CheckCircle,
  Loader2,
  UserPlus,
  Mail,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { UserCursorFollower } from "@/hooks/useMouseTracking";

const loginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  confirmPassword: z.string().min(6, "Şifre tekrarı gereklidir"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

// Floating Particles Component 
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large gradual orbs */}
      <motion.div 
        className="absolute w-72 h-72 bg-blue-500/8 rounded-full blur-3xl"
        animate={{ 
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '15%', left: '10%' }}
      />
      <motion.div 
        className="absolute w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"
        animate={{ 
          x: [0, -25, 0],
          y: [0, 15, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '40%', right: '10%' }}
      />
      
      {/* Small floating dots */}
      <motion.div 
        className="absolute w-3 h-3 bg-blue-400/60 rounded-full"
        animate={{ 
          y: [0, -30, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '20%', left: '15%' }}
      />
      
      <motion.div 
        className="absolute w-2 h-2 bg-purple-400/70 rounded-full"
        animate={{ 
          y: [0, -20, 0],
          x: [0, 10, 0],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{ top: '60%', left: '85%' }}
      />
      
      <motion.div 
        className="absolute w-4 h-4 bg-cyan-400/50 rounded-full"
        animate={{ 
          y: [0, -25, 0],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ top: '70%', left: '20%' }}
      />
      
      <motion.div 
        className="absolute w-3 h-3 bg-pink-400/60 rounded-full"
        animate={{ 
          y: [0, -35, 0],
          x: [0, -15, 0],
          opacity: [0.6, 1, 0.6]
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        style={{ top: '25%', right: '25%' }}
      />
      
      <motion.div 
        className="absolute w-2 h-2 bg-emerald-400/80 rounded-full"
        animate={{ 
          y: [0, -15, 0],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        style={{ top: '80%', right: '40%' }}
      />
    </div>
  );
};

export default function Auth() {
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isLoginSuccess, setIsLoginSuccess] = useState(false);
  const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [registerProgress, setRegisterProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error:", error, "Response text:", responseText);
        throw new Error("Server response format error");
      }
    },
    onSuccess: (data: any) => {
      setIsLoginLoading(false);
      setIsLoginSuccess(true);
      setTimeout(() => {
        if (data.user?.isAdmin) {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }, 2000);
    },
    onError: (error: any) => {
      setIsLoginLoading(false);
      setLoginProgress(0);
      toast({
        title: "Giriş hatası",
        description: error?.message || "Giriş yapılırken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error:", error, "Response text:", responseText);
        throw new Error("Server response format error");
      }
    },
    onSuccess: (data: any) => {
      setIsRegisterLoading(false);
      setIsRegisterSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: any) => {
      setIsRegisterLoading(false);
      setRegisterProgress(0);
      toast({
        title: "Kayıt hatası",
        description: error?.message || "Kayıt olurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = async (data: LoginData) => {
    setIsLoginLoading(true);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setLoginProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    setTimeout(() => {
      loginMutation.mutate(data);
      setLoginProgress(100);
      clearInterval(progressInterval);
    }, 1500);
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    setIsRegisterLoading(true);
    
    // Progress animation  
    const progressInterval = setInterval(() => {
      setRegisterProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + Math.random() * 12;
      });
    }, 400);

    setTimeout(() => {
      registerMutation.mutate(data);
      setRegisterProgress(100);
      clearInterval(progressInterval);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* User Cursor Effect */}
      <UserCursorFollower />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Ana Sayfaya Dön Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 w-full"
        >
          <motion.div
            whileHover={{ 
              scale: 1.01,
              y: -1,
              boxShadow: "0 8px 20px rgba(59, 130, 246, 0.25)"
            }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white hover:text-white backdrop-blur-sm rounded-xl px-6 py-4 transition-all duration-200 font-medium shadow-lg border border-blue-400/20"
            >
              <motion.div
                className="flex items-center justify-center"
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                ANA SAYFAYA DÖN
              </motion.div>
            </Button>
          </motion.div>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[700px]">
            <CardHeader className="text-center pb-4 pt-8">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6"
                animate={{ 
                  boxShadow: [
                    "0 0 30px rgba(59, 130, 246, 0.3)",
                    "0 0 40px rgba(147, 51, 234, 0.4)",
                    "0 0 30px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <KeyRound className="w-8 h-8 text-white" />
              </motion.div>
              
              <CardTitle className="text-3xl font-bold text-white mb-2">
                KeyPanel
              </CardTitle>
              <p className="text-slate-400 text-sm">
                Hesabınıza giriş yapın veya yeni hesap oluşturun
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-8 pb-8">
              {/* Tab Switcher */}
              <div className="relative bg-slate-700/30 rounded-2xl p-0 backdrop-blur-sm">
                <motion.div
                  className="absolute top-0 bottom-0 bg-blue-500 rounded-2xl shadow-lg"
                  animate={{
                    left: activeTab === "login" ? "0%" : "50%",
                    width: "50%"
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 35,
                    duration: 0.5
                  }}
                />
                
                <div className="grid grid-cols-2 relative z-10">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`py-4 px-4 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                      activeTab === "login" 
                        ? "text-white" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`py-4 px-4 rounded-2xl text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                      activeTab === "register" 
                        ? "text-white" 
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Kayıt Ol
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="min-h-[550px] relative pb-4">
                <AnimatePresence mode="wait">
                  {activeTab === "login" ? (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="absolute inset-0"
                    >
                      <AnimatePresence mode="wait">
                        {isLoginSuccess ? (
                          <>
                            {/* Blue Wave Effect - emanating from viewport center */}
                            <motion.div
                              initial={{ scale: 0, opacity: 0.7 }}
                              animate={{ scale: 25, opacity: 0 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="fixed bg-blue-500 rounded-full z-50 pointer-events-none"
                              style={{
                                width: "100px",
                                height: "100px",
                                left: "50vw",
                                top: "50vh",
                                transform: "translate(-50%, -50%)"
                              }}
                            />
                            
                            <motion.div
                              key="login-success"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-12 space-y-6 relative z-10"
                            >
                              {/* Animated Check Mark */}
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  delay: 0.2,
                                  type: "spring", 
                                  stiffness: 200, 
                                  damping: 15 
                                }}
                                className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                              >
                                <motion.div
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                                >
                                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <motion.path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                                    />
                                  </svg>
                                </motion.div>
                              </motion.div>
                              
                              <motion.h3 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-xl font-semibold text-blue-400"
                              >
                                Giriş Başarılı!
                              </motion.h3>
                              <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="text-slate-300"
                              >
                                Yönlendiriliyor...
                              </motion.p>
                            </motion.div>
                          </>
                        ) : isLoginLoading ? (
                          <motion.div
                            key="login-loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 space-y-6"
                          >
                            <motion.div
                              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            >
                              <KeyRound className="w-8 h-8 text-white" />
                            </motion.div>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-blue-400">
                                Giriş Yapılıyor...
                              </h3>
                              
                              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${loginProgress}%` }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                              </div>
                              
                              <p className="text-slate-400 text-sm">
                                Kimlik doğrulanıyor...
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="login-form"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.5, 
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                            className="space-y-6 mt-6"
                          >
                            <div className="space-y-3">
                              <Label htmlFor="login-username" className="text-slate-300 text-sm">
                                Kullanıcı Adı
                              </Label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="login-username"
                                  placeholder="Kullanıcı adınız"
                                  className="pl-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...loginForm.register("username")}
                                />
                              </div>
                              {loginForm.formState.errors.username && (
                                <p className="text-red-400 text-sm ml-1">
                                  {loginForm.formState.errors.username.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="login-password" className="text-slate-300 text-sm">
                                Şifre
                              </Label>
                              <div className="relative">
                                <Input
                                  id="login-password"
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="Şifreniz"
                                  className="pr-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...loginForm.register("password")}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400 transition-colors"
                                >
                                  {showLoginPassword ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {loginForm.formState.errors.password && (
                                <p className="text-red-400 text-sm ml-1">
                                  {loginForm.formState.errors.password.message}
                                </p>
                              )}
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                type="submit"
                                disabled={isLoginLoading || loginMutation.isPending}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-14 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-8"
                              >
                                {isLoginLoading || loginMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Giriş Yapılıyor...
                                  </>
                                ) : (
                                  <>
                                    <LogIn className="w-5 h-5 mr-2" />
                                    Giriş Yap
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ 
                        duration: 0.5, 
                        ease: [0.16, 1, 0.3, 1]
                      }}
                      className="absolute inset-0"
                    >
                      <AnimatePresence mode="wait">
                        {isRegisterSuccess ? (
                          <>
                            {/* Blue Wave Effect - emanating from viewport center */}
                            <motion.div
                              initial={{ scale: 0, opacity: 0.7 }}
                              animate={{ scale: 25, opacity: 0 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="fixed bg-blue-500 rounded-full z-50 pointer-events-none"
                              style={{
                                width: "100px",
                                height: "100px",
                                left: "50vw",
                                top: "50vh",
                                transform: "translate(-50%, -50%)"
                              }}
                            />
                            
                            <motion.div
                              key="register-success"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-center py-12 space-y-6 relative z-10"
                            >
                              {/* Animated Check Mark */}
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                  delay: 0.2,
                                  type: "spring", 
                                  stiffness: 200, 
                                  damping: 15 
                                }}
                                className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto shadow-2xl"
                              >
                                <motion.div
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                                >
                                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <motion.path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                      initial={{ pathLength: 0 }}
                                      animate={{ pathLength: 1 }}
                                      transition={{ delay: 0.5, duration: 0.8, ease: "easeInOut" }}
                                    />
                                  </svg>
                                </motion.div>
                              </motion.div>
                              
                              <motion.h3 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 0.5 }}
                                className="text-xl font-semibold text-blue-400"
                              >
                                Kayıt Başarılı!
                              </motion.h3>
                              <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1, duration: 0.5 }}
                                className="text-slate-300"
                              >
                                Otomatik giriş yapılıyor...
                              </motion.p>
                            </motion.div>
                          </>
                        ) : isRegisterLoading ? (
                          <motion.div
                            key="register-loading"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12 space-y-6"
                          >
                            <motion.div
                              className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                              animate={{ rotate: -360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                              <UserPlus className="w-8 h-8 text-white" />
                            </motion.div>
                            
                            <div className="space-y-4">
                              <h3 className="text-lg font-semibold text-purple-400">
                                Hesap Oluşturuluyor...
                              </h3>
                              
                              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                <motion.div
                                  className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500 rounded-full"
                                  initial={{ width: "0%" }}
                                  animate={{ width: `${registerProgress}%` }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                />
                              </div>
                              
                              <p className="text-slate-400 text-sm">
                                Bilgiler doğrulanıyor...
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.form
                            key="register-form"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ 
                              duration: 0.5, 
                              ease: [0.25, 0.46, 0.45, 0.94]
                            }}
                            onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                            className="space-y-5 mt-6"
                          >
                            <div className="space-y-3">
                              <Label htmlFor="register-username" className="text-slate-300 text-sm">
                                Kullanıcı Adı
                              </Label>
                              <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="register-username"
                                  placeholder="Kullanıcı adınız"
                                  className="pl-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...registerForm.register("username")}
                                />
                              </div>
                              {registerForm.formState.errors.username && (
                                <p className="text-red-400 text-sm ml-1">
                                  {registerForm.formState.errors.username.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="register-email" className="text-slate-300 text-sm">
                                E-posta
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                  id="register-email"
                                  type="email"
                                  placeholder="E-posta adresiniz"
                                  className="pl-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...registerForm.register("email")}
                                />
                              </div>
                              {registerForm.formState.errors.email && (
                                <p className="text-red-400 text-sm ml-1">
                                  {registerForm.formState.errors.email.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="register-password" className="text-slate-300 text-sm">
                                Şifre
                              </Label>
                              <div className="relative">
                                <Input
                                  id="register-password"
                                  type={showRegisterPassword ? "text" : "password"}
                                  placeholder="Şifreniz"
                                  className="pr-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...registerForm.register("password")}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
                                >
                                  {showRegisterPassword ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {registerForm.formState.errors.password && (
                                <p className="text-red-400 text-sm ml-1">
                                  {registerForm.formState.errors.password.message}
                                </p>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="confirm-password" className="text-slate-300 text-sm">
                                Şifre Tekrarı
                              </Label>
                              <div className="relative">
                                <Input
                                  id="confirm-password"
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Şifrenizi tekrar giriniz"
                                  className="pr-12 bg-slate-700/50 border-slate-600 text-slate-50 placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent h-12 rounded-xl transition-all duration-300"
                                  {...registerForm.register("confirmPassword")}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-colors"
                                >
                                  {showConfirmPassword ? (
                                    <Eye className="w-4 h-4" />
                                  ) : (
                                    <EyeOff className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                              {registerForm.formState.errors.confirmPassword && (
                                <p className="text-red-400 text-sm ml-1">
                                  {registerForm.formState.errors.confirmPassword.message}
                                </p>
                              )}
                            </div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                type="submit"
                                disabled={isRegisterLoading || registerMutation.isPending}
                                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white h-14 font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
                              >
                                {isRegisterLoading || registerMutation.isPending ? (
                                  <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Hesap Oluşturuluyor...
                                  </>
                                ) : (
                                  <>
                                    <UserPlus className="w-5 h-5 mr-2" />
                                    <span>Kayıt Ol</span>
                                    <Sparkles className="w-4 h-4 ml-2" />
                                  </>
                                )}
                              </Button>
                            </motion.div>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}