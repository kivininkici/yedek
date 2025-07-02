import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, FileText, Clock, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

const complaintSchema = z.object({
  orderId: z.string().min(1, "Sipariş ID gerekli"),
  subject: z.string().min(5, "Konu en az 5 karakter olmalı"),
  message: z.string().min(20, "Mesaj en az 20 karakter olmalı"),
  category: z.string().min(1, "Kategori seçimi gerekli"),
  priority: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export default function Complaints() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      orderId: "",
      subject: "",
      message: "",
      category: "",
      priority: "medium",
    },
  });

  // Check if user has orders
  const { data: orderCount = 0, isLoading: isCheckingOrders } = useQuery({
    queryKey: ["/api/user/orders/count"],
    enabled: isAuthenticated,
  });

  const submitComplaintMutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      return await apiRequest("/api/complaints", "POST", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Şikayet Gönderildi",
        description: "Şikayetiniz başarıyla kaydedildi. En kısa sürede değerlendirilecektir.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Şikayet gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ComplaintFormData) => {
    submitComplaintMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Giriş Gerekli</h2>
          <p className="text-gray-300 mb-6">
            Şikayet göndermek için giriş yapmanız gerekmektedir.
          </p>
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Giriş Yap
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isCheckingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Clock className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-300">Sipariş geçmişiniz kontrol ediliyor...</p>
        </motion.div>
      </div>
    );
  }

  if (orderCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <FileText className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">Sipariş Gerekli</h2>
          <p className="text-gray-300 mb-6">
            Şikayet göndermek için en az bir siparişiniz olmalı. Önce bir key kullanarak sipariş oluşturun.
          </p>
          <Button 
            onClick={() => window.location.href = '/user'}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
          >
            Key Kullan
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div 
          className="max-w-md w-full bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Send className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-4">Şikayet Gönderildi</h2>
          <p className="text-gray-300 mb-6">
            Şikayetiniz başarıyla kaydedildi. Ekibimiz en kısa sürede değerlendirecek ve size geri dönecektir.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            Ana Sayfaya Dön
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-20">
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Şikayet Formu</h1>
            <p className="text-gray-300">
              Yaşadığınız sorunu detaylı bir şekilde bildirin
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Sipariş ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Örnek: KP123456"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-400/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Şikayet Kategorisi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="service_quality">Servis Kalitesi</SelectItem>
                        <SelectItem value="delivery_time">Teslimat Süresi</SelectItem>
                        <SelectItem value="billing">Faturalandırma</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Öncelik Seviyesi</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="Öncelik seçin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Konu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Şikayetinizin konusunu özetleyin"
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-400/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Detaylı Açıklama</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Yaşadığınız sorunu detaylı bir şekilde açıklayın..."
                        rows={6}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-red-400/50 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="flex-1 border-white/20 text-white hover:bg-white/10"
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  disabled={submitComplaintMutation.isPending}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {submitComplaintMutation.isPending ? "Gönderiliyor..." : "Şikayet Gönder"}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}