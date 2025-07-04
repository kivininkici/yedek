import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Home, LogIn, UserPlus, Shield } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// Schema definitions with hCaptcha validation
const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
  hcaptcha: z.string().min(1, "CAPTCHA doğrulaması gerekli"),
});

const registerSchema = z
  .object({
    username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
    confirmPassword: z.string(),
    hcaptcha: z.string().min(1, "CAPTCHA doğrulaması gerekli"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

// Modern Background effects
const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "10%" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "60%", right: "10%" }}
      />
      <motion.div
        className="absolute w-3 h-3 bg-blue-400/60 rounded-full"
        animate={{
          y: [0, -20, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "20%", left: "30%" }}
      />
      <motion.div
        className="absolute w-2 h-2 bg-purple-400/50 rounded-full"
        animate={{
          y: [0, 15, 0],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        style={{ top: "70%", left: "70%" }}
      />

      {/* Additional floating particles */}
      <motion.div
        className="absolute w-4 h-4 bg-gradient-to-r from-cyan-400/40 to-blue-400/40 rounded-full"
        animate={{
          x: [0, 30, 0],
          y: [0, -25, 0],
          rotate: [0, 180, 360],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        style={{ top: "15%", right: "25%" }}
      />

      <motion.div
        className="absolute w-1 h-1 bg-white/80 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        style={{ top: "40%", left: "15%" }}
      />

      <motion.div
        className="absolute w-1 h-1 bg-white/70 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
        style={{ top: "80%", right: "40%" }}
      />

      <motion.div
        className="absolute w-5 h-5 bg-gradient-to-r from-indigo-400/30 to-purple-400/30 rounded-full"
        animate={{
          x: [0, -20, 0],
          y: [0, 20, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 3,
        }}
        style={{ top: "50%", left: "5%" }}
      />
    </div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
      <FloatingOrbs />
      {/* Additional background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
    </div>
  );
};

// Success animation component
const SuccessAnimation = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none bg-black/30 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="bg-white rounded-2xl p-8 shadow-2xl"
          >
            {/* Success checkmark */}
            <motion.svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              className="text-green-500 mx-auto"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="currentColor"
                opacity="0.1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              />
              <motion.path
                d="M30 50 L43 63 L70 35"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              />
            </motion.svg>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="text-slate-700 text-center mt-4 font-medium"
            >
              Başarılı!
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  const [loginCaptcha, setLoginCaptcha] = useState<string>("");
  const [registerCaptcha, setRegisterCaptcha] = useState<string>("");
  const { toast } = useToast();

  // hCaptcha site key - bu anahtarı hCaptcha dashboard'dan alabilirsiniz
  const HCAPTCHA_SITE_KEY = "10000000-ffff-ffff-ffff-000000000001"; // Test key - production için değiştirin

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      hcaptcha: "",
    },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      hcaptcha: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Giriş başarısız");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoginSuccess(true);
      toast({
        title: "Giriş Başarılı",
        description: `Hoş geldin, ${data.username}!`,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Kayıt başarısız");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setIsRegisterSuccess(true);
      toast({
        title: "Kayıt Başarılı",
        description: `Hoş geldin, ${data.username}! Otomatik giriş yapılıyor...`,
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = async (data: LoginData) => {
    setIsLoginLoading(true);
    setLoginProgress(0);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setLoginProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await loginMutation.mutateAsync(data);
      setLoginProgress(100);
    } catch (error) {
      setLoginProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsLoginLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterData) => {
    setIsRegisterLoading(true);
    setRegisterProgress(0);

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setRegisterProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      await registerMutation.mutateAsync(data);
      setRegisterProgress(100);
    } catch (error) {
      setRegisterProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <SuccessAnimation isVisible={isLoginSuccess || isRegisterSuccess} />

      <div className="w-full max-w-2xl relative">
        {/* Header with home button */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="mb-4 bg-white/10 hover:bg-white/20 border-white/30 text-white hover:text-white shadow-lg backdrop-blur-sm rounded-2xl px-8 py-3 font-semibold transition-all duration-300 hover:scale-105"
            >
              <Home className="h-5 w-5 mr-3" />
              Ana Sayfaya Dön
            </Button>
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          {/* Enhanced Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-blue-400/30 rounded-3xl blur-2xl"></div>

          <Card className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/95 via-blue-900/90 to-slate-800/95 border border-blue-400/30 shadow-2xl rounded-3xl overflow-hidden">
            {/* Animated header section */}
            <CardHeader className="text-center pb-8 pt-12 relative">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                className="relative w-24 h-24 bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-white"
                >
                  <path
                    d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="relative z-10"
              >
                <CardTitle className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-4">
                  OtoKiwi
                </CardTitle>
                <CardDescription className="text-xl text-gray-300 font-medium">
                  Premium sosyal medya deneyimine hoş geldin! 🚀
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="px-10 pb-10 relative z-10">
              <div className="w-full">
                <div className="flex w-full mb-10 bg-white/10 backdrop-blur-sm rounded-2xl p-1 h-16 border border-white/20">
                  <button
                    onClick={() => setActiveTab("login")}
                    className={`w-full h-12 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <LogIn className="w-5 h-5" />
                    <span>Giriş Yap</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("register")}
                    className={`w-full h-12 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                      activeTab === "register"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Kayıt Ol</span>
                  </button>
                </div>

                <div className="min-h-[450px]">
                  {activeTab === "login" && (
                    <div className="space-y-4 mt-0">
                      <AnimatePresence mode="wait">
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <Form {...loginForm}>
                          <form
                            onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                            className="space-y-4"
                          >
                            {/* hCaptcha - Login Form */}
                            <FormField
                              control={loginForm.control}
                              name="hcaptcha"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-blue-400" />
                                    Güvenlik Doğrulaması
                                  </FormLabel>
                                  <FormControl>
                                    <div className="flex justify-center p-4 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-sm">
                                      <HCaptcha
                                        sitekey={HCAPTCHA_SITE_KEY}
                                        onVerify={(token) => {
                                          setLoginCaptcha(token);
                                          field.onChange(token);
                                        }}
                                        onExpire={() => {
                                          setLoginCaptcha("");
                                          field.onChange("");
                                        }}
                                        onError={() => {
                                          setLoginCaptcha("");
                                          field.onChange("");
                                        }}
                                        theme="dark"
                                        size="normal"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    Kullanıcı Adı
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={isLoginLoading}
                                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                                      placeholder="Kullanıcı adınızı girin"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    Şifre
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={
                                          showLoginPassword
                                            ? "text"
                                            : "password"
                                        }
                                        disabled={isLoginLoading}
                                        className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 pr-14"
                                        placeholder="Şifrenizi girin"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                                        onClick={() =>
                                          setShowLoginPassword(
                                            !showLoginPassword,
                                          )
                                        }
                                        disabled={isLoginLoading}
                                      >
                                        {showLoginPassword ? (
                                          <EyeOff className="h-5 w-5" />
                                        ) : (
                                          <Eye className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {isLoginLoading && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4 p-4 bg-blue-500/10 border border-blue-400/30 rounded-2xl backdrop-blur-sm"
                              >
                                <div className="flex items-center justify-between text-blue-300 font-semibold">
                                  <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                                    <span>Giriş yapılıyor...</span>
                                  </span>
                                  <span className="text-blue-400">
                                    {loginProgress}%
                                  </span>
                                </div>
                                <Progress
                                  value={loginProgress}
                                  className="w-full h-3 bg-white/10"
                                />
                              </motion.div>
                            )}

                            <Button
                              type="submit"
                              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 text-white rounded-2xl shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                              disabled={isLoginLoading}
                            >
                              {isLoginLoading ? (
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Giriş Yapılıyor...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-3">
                                  <LogIn className="w-6 h-6" />
                                  <span>Giriş Yap</span>
                                </div>
                              )}
                            </Button>

                            {/* Forgot Password Button - Red Box */}
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3, duration: 0.5 }}
                              className="flex justify-center mt-6"
                            >
                              <Link href="/forgot-password">
                                <motion.div
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="inline-block px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl border-2 border-red-500 shadow-lg shadow-red-500/25 backdrop-blur-sm transition-all duration-300 cursor-pointer"
                                >
                                  <span className="text-white font-medium text-sm">
                                    Şifremi Unuttum
                                  </span>
                                </motion.div>
                              </Link>
                            </motion.div>
                          </form>
                        </Form>
                      </motion.div>
                    </AnimatePresence>
                    </div>
                  )}

                  {activeTab === "register" && (
                    <div className="space-y-4 mt-0">
                      <AnimatePresence mode="wait">
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <Form {...registerForm}>
                          <form
                            onSubmit={registerForm.handleSubmit(
                              onRegisterSubmit,
                            )}
                            className="space-y-4"
                          >
                            {/* hCaptcha - Register Form */}
                            <FormField
                              control={registerForm.control}
                              name="hcaptcha"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-purple-400" />
                                    Güvenlik Doğrulaması
                                  </FormLabel>
                                  <FormControl>
                                    <div className="flex justify-center p-4 bg-white/5 rounded-2xl border border-white/20 backdrop-blur-sm">
                                      <HCaptcha
                                        sitekey={HCAPTCHA_SITE_KEY}
                                        onVerify={(token) => {
                                          setRegisterCaptcha(token);
                                          field.onChange(token);
                                        }}
                                        onExpire={() => {
                                          setRegisterCaptcha("");
                                          field.onChange("");
                                        }}
                                        onError={() => {
                                          setRegisterCaptcha("");
                                          field.onChange("");
                                        }}
                                        theme="dark"
                                        size="normal"
                                      />
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    Kullanıcı Adı
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={isRegisterLoading}
                                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                                      placeholder="Kullanıcı adınızı belirleyin"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    E-posta
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      disabled={isRegisterLoading}
                                      className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15"
                                      placeholder="E-posta adresinizi girin"
                                    />
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    Şifre
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={
                                          showRegisterPassword
                                            ? "text"
                                            : "password"
                                        }
                                        disabled={isRegisterLoading}
                                        className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 pr-14"
                                        placeholder="Güçlü bir şifre oluşturun"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                                        onClick={() =>
                                          setShowRegisterPassword(
                                            !showRegisterPassword,
                                          )
                                        }
                                        disabled={isRegisterLoading}
                                      >
                                        {showRegisterPassword ? (
                                          <EyeOff className="h-5 w-5" />
                                        ) : (
                                          <Eye className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel className="text-white font-semibold text-lg">
                                    Şifre Tekrarı
                                  </FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={
                                          showConfirmPassword
                                            ? "text"
                                            : "password"
                                        }
                                        disabled={isRegisterLoading}
                                        className="h-14 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400/20 rounded-2xl backdrop-blur-sm transition-all duration-300 hover:bg-white/15 pr-14"
                                        placeholder="Şifrenizi tekrar girin"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300"
                                        onClick={() =>
                                          setShowConfirmPassword(
                                            !showConfirmPassword,
                                          )
                                        }
                                        disabled={isRegisterLoading}
                                      >
                                        {showConfirmPassword ? (
                                          <EyeOff className="h-5 w-5" />
                                        ) : (
                                          <Eye className="h-5 w-5" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage className="text-red-400" />
                                </FormItem>
                              )}
                            />

                            {isRegisterLoading && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="space-y-4 p-4 bg-purple-500/10 border border-purple-400/30 rounded-2xl backdrop-blur-sm"
                              >
                                <div className="flex items-center justify-between text-purple-300 font-semibold">
                                  <span className="flex items-center space-x-2">
                                    <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                                    <span>Hesap oluşturuluyor...</span>
                                  </span>
                                  <span className="text-purple-400">
                                    {registerProgress}%
                                  </span>
                                </div>
                                <Progress
                                  value={registerProgress}
                                  className="w-full h-3 bg-white/10"
                                />
                              </motion.div>
                            )}

                            <Button
                              type="submit"
                              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
                              disabled={isRegisterLoading}
                            >
                              {isRegisterLoading ? (
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                  <span>Hesap Oluşturuluyor...</span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-3">
                                  <UserPlus className="w-6 h-6" />
                                  <span>Kayıt Ol</span>
                                </div>
                              )}
                            </Button>
                          </form>
                        </Form>
                      </motion.div>
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
