import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Send, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

const forgotPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

// Modern Background Component
const ModernForgotPasswordBackground = () => {
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
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      
      {/* Additional smaller orbs */}
      <motion.div 
        className="absolute w-[200px] h-[200px] rounded-full opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)',
          filter: 'blur(40px)',
          top: '50%', 
          left: '50%'
        }}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -30, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
};

export default function AdminForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: ForgotPasswordForm) => {
      const response = await apiRequest('POST', '/api/admin/forgot-password', data);
      return response.json();
    },
    onSuccess: () => {
      setIsLoading(false);
      setIsSuccess(true);
      toast({
        title: "E-posta Gönderildi",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
      });
    },
    onError: (error: any) => {
      setIsLoading(false);
      toast({
        title: "Hata",
        description: error.message || "E-posta gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setIsSuccess(false);
    forgotPasswordMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Modern Background */}
      <ModernForgotPasswordBackground />
      
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
                    E-posta Gönderildi!
                  </h2>
                  
                  <p className="text-white/80 mb-6 leading-relaxed">
                    <strong>{getValues('email')}</strong> adresine şifre sıfırlama bağlantısı gönderildi. 
                    E-postanızı kontrol edin ve bağlantıya tıklayarak şifrenizi sıfırlayın.
                  </p>
                  
                  <div className="space-y-4">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link href="/admin/login">
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl">
                          Giriş Sayfasına Dön
                        </Button>
                      </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="button"
                        onClick={() => setIsSuccess(false)}
                        variant="outline"
                        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 py-3 rounded-xl"
                      >
                        Tekrar Gönder
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // Forgot Password Form
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
                    className="w-20 h-20 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                    animate={{ 
                      boxShadow: [
                        "0 0 30px rgba(249, 115, 22, 0.3)",
                        "0 0 50px rgba(239, 68, 68, 0.4)",
                        "0 0 30px rgba(236, 72, 153, 0.3)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Mail className="w-10 h-10 text-white" />
                  </motion.div>
                  <CardTitle className="text-2xl font-bold text-white mb-2">
                    Şifremi Unuttum
                  </CardTitle>
                  <p className="text-white/60">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
                  </p>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white font-medium">
                        E-posta Adresi
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 pl-12 py-3 rounded-xl"
                          placeholder="admin@example.com"
                        />
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                      </div>
                      {errors.email && (
                        <p className="text-red-400 text-sm">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Gönderiliyor...
                            </>
                          ) : (
                            <>
                              <Send className="w-5 h-5 mr-2" />
                              Şifre Sıfırlama Bağlantısı Gönder
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