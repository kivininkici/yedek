import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link } from "wouter";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

// Schema definitions without math validation
const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
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
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '10%', left: '10%' }}
      />
      <motion.div 
        className="absolute w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"
        animate={{ 
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '60%', right: '10%' }}
      />
      <motion.div 
        className="absolute w-3 h-3 bg-blue-400/60 rounded-full"
        animate={{ 
          y: [0, -20, 0],
          opacity: [0.4, 1, 0.4]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: '20%', left: '30%' }}
      />
      <motion.div 
        className="absolute w-2 h-2 bg-purple-400/50 rounded-full"
        animate={{ 
          y: [0, 15, 0],
          opacity: [0.3, 0.8, 0.3]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        style={{ top: '70%', left: '70%' }}
      />
    </div>
  );
};

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100" />
      <FloatingOrbs />
    </div>
  );
};

// Success animation component
const SuccessAnimation = ({ isVisible }: { isVisible: boolean }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            {/* Success checkmark */}
            <motion.svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              className="text-blue-600"
            >
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
              <motion.path
                d="M25 50 L40 65 L75 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              />
            </motion.svg>
            
            {/* Ripple effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0.8 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-blue-200"
            />
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
        window.location.href = "/user";
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
        window.location.href = "/user";
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
      setLoginProgress(prev => {
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
      setRegisterProgress(prev => {
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
              size="sm"
              className="mb-4 bg-white/90 hover:bg-white border-blue-200 text-blue-700 hover:text-blue-800 shadow-sm"
            >
              <Home className="h-4 w-4 mr-2" />
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
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-300/20 via-blue-400/20 to-purple-300/20 rounded-3xl blur-xl"></div>
          
          <Card className="relative backdrop-blur-xl bg-white/90 shadow-2xl border-0 rounded-3xl overflow-hidden">
            {/* Header section */}
            <CardHeader className="text-center pb-6 pt-10 bg-gradient-to-br from-blue-50/50 to-purple-50/30">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                </svg>
              </motion.div>
              
              <CardTitle className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text mb-3">
                OtoKiwi
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 font-medium">
                Hesabınıza giriş yapın veya yeni hesap oluşturun
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80 rounded-2xl p-1 h-14">
                  <TabsTrigger 
                    value="login" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-xl font-semibold text-base transition-all duration-300"
                  >
                    Giriş Yap
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register" 
                    className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-xl font-semibold text-base transition-all duration-300"
                  >
                    Kayıt Ol
                  </TabsTrigger>
                </TabsList>

                <div className="min-h-[420px]">
                  <TabsContent value="login" className="space-y-4 mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">Kullanıcı Adı</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={isLoginLoading}
                                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">Şifre</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={showLoginPassword ? "text" : "password"}
                                        disabled={isLoginLoading}
                                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 pr-10"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-blue-600 hover:text-blue-800"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        disabled={isLoginLoading}
                                      >
                                        {showLoginPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {isLoginLoading && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-blue-600">
                                  <span>Giriş yapılıyor...</span>
                                  <span>{loginProgress}%</span>
                                </div>
                                <Progress value={loginProgress} className="w-full h-2" />
                              </div>
                            )}

                            <Button
                              type="submit"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isLoginLoading}
                            >
                              {isLoginLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                            </Button>
                          </form>
                        </Form>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="register" className="space-y-4 mt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">Kullanıcı Adı</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      disabled={isRegisterLoading}
                                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">E-posta</FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      disabled={isRegisterLoading}
                                      className="border-blue-200 focus:border-blue-400 focus:ring-blue-200"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">Şifre</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={showRegisterPassword ? "text" : "password"}
                                        disabled={isRegisterLoading}
                                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 pr-10"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-blue-600 hover:text-blue-800"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        disabled={isRegisterLoading}
                                      >
                                        {showRegisterPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-blue-900">Şifre Tekrarı</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <Input
                                        {...field}
                                        type={showConfirmPassword ? "text" : "password"}
                                        disabled={isRegisterLoading}
                                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 pr-10"
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-blue-600 hover:text-blue-800"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={isRegisterLoading}
                                      >
                                        {showConfirmPassword ? (
                                          <EyeOff className="h-4 w-4" />
                                        ) : (
                                          <Eye className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {isRegisterLoading && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm text-blue-600">
                                  <span>Kayıt oluşturuluyor...</span>
                                  <span>{registerProgress}%</span>
                                </div>
                                <Progress value={registerProgress} className="w-full h-2" />
                              </div>
                            )}

                            <Button
                              type="submit"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                              disabled={isRegisterLoading}
                            >
                              {isRegisterLoading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol"}
                            </Button>
                          </form>
                        </Form>
                      </motion.div>
                    </AnimatePresence>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}