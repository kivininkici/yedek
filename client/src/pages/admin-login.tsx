import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLogin } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, User, Shield, ArrowLeft, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { AdminCursorFollower } from "@/hooks/useMouseTracking";

export default function AdminLogin() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showUsername, setShowUsername] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLogin>({
    resolver: zodResolver(adminLoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLogin) => {
      const res = await apiRequest("POST", "/api/admin/login", credentials);
      return await res.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Yetkili Girişi Başarılı",
        description: "Admin paneline yönlendiriliyorsunuz...",
      });
      // Redirect to admin dashboard after animation
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 2000);
    },
    onError: (error: Error) => {
      setIsLoading(false);
      setIsSuccess(false);
      toast({
        title: "Giriş başarısız",
        description: error.message || "Kullanıcı adı veya şifre hatalı",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AdminLogin) => {
    setIsLoading(true);
    setIsSuccess(false);
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Admin Blue Cursor Effect */}
      <AdminCursorFollower />
      
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradual orbs with smooth animations */}
        <motion.div 
          className="absolute w-80 h-80 bg-blue-500/8 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -40, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '5%', left: '10%' }}
        />
        <motion.div 
          className="absolute w-96 h-96 bg-cyan-500/6 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            scale: [1, 0.8, 1]
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '60%', right: '8%' }}
        />
        <motion.div 
          className="absolute w-72 h-72 bg-emerald-500/4 rounded-full blur-3xl"
          animate={{ 
            x: [0, 25, 0],
            y: [0, -25, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '45%', left: '45%' }}
        />
        
        {/* Floating particles */}
        <motion.div 
          className="absolute w-4 h-4 bg-blue-400/40 rounded-full"
          animate={{ 
            y: [0, -50, 0],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '20%', left: '25%' }}
        />
        
        <motion.div 
          className="absolute w-3 h-3 bg-cyan-400/50 rounded-full"
          animate={{ 
            y: [0, -35, 0],
            x: [0, 20, 0],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{ top: '75%', left: '75%' }}
        />
        
        <motion.div 
          className="absolute w-2 h-2 bg-emerald-400/60 rounded-full"
          animate={{ 
            y: [0, -30, 0],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          style={{ top: '85%', left: '20%' }}
        />
        
        <motion.div 
          className="absolute w-3 h-3 bg-blue-300/45 rounded-full"
          animate={{ 
            y: [0, -40, 0],
            x: [0, -15, 0],
            opacity: [0.45, 1, 0.45]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ top: '35%', right: '25%' }}
        />
        
        <motion.div 
          className="absolute w-2 h-2 bg-cyan-300/55 rounded-full"
          animate={{ 
            y: [0, -25, 0],
            opacity: [0.55, 1, 0.55]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          style={{ top: '90%', right: '40%' }}
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </Link>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            <Card className="backdrop-blur-xl bg-slate-900/70 border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center pb-8">
              {/* Logo */}
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 relative group">
                <Shield className="w-8 h-8 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <Sparkles className="w-4 h-4 text-blue-300 absolute -top-1 -right-1 animate-pulse" />
              </div>

              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent mb-2">
                Admin Paneli
              </CardTitle>
              <p className="text-slate-400 text-lg">
                Yönetim paneline güvenli erişim
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="admin-success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8 space-y-4 relative"
                  >
                    {/* Success Wave Effect - Around Card, Behind It */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 8, 12], opacity: [0, 0.08, 0] }}
                      transition={{ duration: 2.5, ease: "easeOut" }}
                      className="fixed inset-0 -z-10 bg-gradient-radial from-green-400/15 via-green-500/8 to-transparent pointer-events-none"
                      style={{ transformOrigin: 'center center' }}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 6, 10], opacity: [0, 0.12, 0] }}
                      transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                      className="fixed inset-0 -z-10 bg-gradient-radial from-emerald-400/20 via-green-400/10 to-transparent pointer-events-none"
                      style={{ transformOrigin: 'center center' }}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 4, 8], opacity: [0, 0.15, 0] }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                      className="fixed inset-0 -z-10 bg-gradient-radial from-green-300/25 via-emerald-400/12 to-transparent pointer-events-none"
                      style={{ transformOrigin: 'center center' }}
                    />
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [0, 2, 5], opacity: [0, 0.18, 0] }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
                      className="fixed inset-0 -z-10 bg-gradient-radial from-green-200/30 via-green-300/15 to-transparent pointer-events-none"
                      style={{ transformOrigin: 'center center' }}
                    />
                    
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="relative z-10 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/50"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      className="text-xl font-semibold text-green-400 relative z-10"
                    >
                      Yetkili Girişi Başarılı!
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="text-slate-400 relative z-10"
                    >
                      Admin paneline yönlendiriliyor...
                    </motion.p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="admin-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-slate-300 text-sm font-medium">
                        Kullanıcı Adı
                      </Label>
                      <div className="relative group">
                        <User className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                          id="username"
                          type={showUsername ? "text" : "password"}
                          placeholder=""
                          className="pl-11 pr-11 h-12 border-slate-600/50 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 bg-[#1e293b80]"
                          {...register("username")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowUsername(!showUsername)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {showUsername ? (
                            <Eye className="w-5 h-5" />
                          ) : (
                            <EyeOff className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.username && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.username.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-slate-300 text-sm font-medium">
                        Şifre
                      </Label>
                      <div className="relative group">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder=""
                          className="pr-11 h-12 bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                          {...register("password")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-blue-400 transition-colors"
                        >
                          {showPassword ? (
                            <Eye className="w-5 h-5" />
                          ) : (
                            <EyeOff className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="securityAnswer" className="text-slate-300 text-sm font-medium">
                        Güvenlik Sorusu: En sevdiğiniz renk nedir?
                      </Label>
                      <div className="relative group">
                        <Shield className="w-5 h-5 absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                        <Input
                          id="securityAnswer"
                          type="text"
                          placeholder="Güvenlik sorusu cevabı"
                          className="pl-11 h-12 bg-slate-800/50 border-slate-600/50 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300"
                          {...register("securityAnswer")}
                        />
                      </div>
                      {errors.securityAnswer && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-400 text-sm"
                        >
                          {errors.securityAnswer.message}
                        </motion.p>
                      )}
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-white font-medium shadow-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-blue-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      disabled={isLoading || loginMutation.isPending}
                    >
                      {isLoading || loginMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Giriş yapılıyor...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Giriş Yap
                        </div>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
          </motion.div>

          {/* Security Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/30 rounded-full border border-slate-700/30 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300">Güvenli Bağlantı</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}