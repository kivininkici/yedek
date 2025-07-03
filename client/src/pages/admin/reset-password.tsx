import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle, Loader2, Shield } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  confirmPassword: z.string().min(6, "Şifre onayı en az 6 karakter olmalı"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// Get token from URL
function useTokenFromUrl() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  return params.get('token');
}

// Modern Background Component
const ModernResetPasswordBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-green-950 to-blue-950" />
      
      {/* Animated orbs */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(6, 182, 212, 0.2) 40%, transparent 70%)',
          filter: 'blur(60px)',
          bottom: '20%', 
          left: '10%'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
    </div>
  );
};

export default function AdminResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const token = useTokenFromUrl();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Verify token on page load
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['/api/admin/reset-password/verify', token],
    queryFn: async () => {
      if (!token) throw new Error('Token bulunamadı');
      const response = await fetch(`/api/admin/reset-password/verify/${token}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Token doğrulanamadı');
      }
      return response.json();
    },
    enabled: !!token,
    retry: false,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: ResetPasswordForm) => {
      const response = await apiRequest('POST', '/api/admin/reset-password', {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "Şifre Güncellendi",
        description: "Şifreniz başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.",
      });
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Hata",
        description: error.message || "Şifre güncellenemedi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ResetPasswordForm) => {
    setIsLoading(true);
    setIsSuccess(false);
    resetPasswordMutation.mutate(data);
  };

  // Show loading while verifying token
  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <ModernResetPasswordBackground />
        <div className="relative z-10 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/80">Token doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (tokenError || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <ModernResetPasswordBackground />
        <div className="relative z-10 w-full max-w-md">
          <Card className="bg-black/30 backdrop-blur-2xl border border-red-500/20 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Geçersiz Token
              </h2>
              
              <p className="text-white/80 mb-6 leading-relaxed">
                {tokenError?.message || 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeni bir şifre sıfırlama talebi oluşturun.'}
              </p>
              
              <div className="space-y-4">
                <Link href="/admin/forgot-password">
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl">
                    Şifre Sıfırlama Talebi
                  </Button>
                </Link>
                
                <Link href="/admin/login">
                  <Button
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 py-3 rounded-xl"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Giriş Sayfasına Dön
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background */}
      <ModernResetPasswordBackground />
      
      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            // Success State
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Şifre Güncellendi!
                  </h2>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    Şifreniz başarıyla güncellendi. Artık yeni şifrenizle admin paneline giriş yapabilirsiniz.
                  </p>
                  
                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/admin/login">
                        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl">
                          Admin Girişi Yap
                        </Button>
                      </Link>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Reset Password Form
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="bg-black/30 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
                <CardHeader className="text-center pb-6 pt-8">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 30px rgba(34, 197, 94, 0.3)",
                        "0 0 50px rgba(16, 185, 129, 0.4)",
                        "0 0 30px rgba(20, 184, 166, 0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Lock className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Şifre Sıfırla
                  </CardTitle>
                  <p className="text-white/60">
                    {tokenData?.email && (
                      <>
                        <strong>{tokenData.email}</strong> için yeni şifre belirleyin
                      </>
                    )}
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* New Password */}
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white font-medium">
                        Yeni Şifre
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          {...register("newPassword")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="En az 6 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-400 text-sm">{errors.newPassword.message}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white font-medium">
                        Şifreyi Doğrula
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          {...register("confirmPassword")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pr-12 py-3 rounded-xl"
                          placeholder="Şifreyi tekrar girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Güncelleniyor...
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 mr-2" />
                              Şifreyi Güncelle
                            </>
                          )}
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Link href="/admin/login">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 py-3 rounded-xl"
                          >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Giriş Sayfasına Dön
                          </Button>
                        </Link>
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