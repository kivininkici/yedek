import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Key, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Search,
  Package,
  ShoppingCart,
  Clock,
  ExternalLink,
  MessageCircle,
  Send,
  Frown,
  Meh,
  Smile
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

const keyValidationSchema = z.object({
  keyValue: z.string().min(1, "Key değeri gerekli"),
});

const orderSchema = z.object({
  keyValue: z.string().min(1),
  serviceId: z.number().min(1),
  quantity: z.number().min(1, "Miktar en az 1 olmalı"),
  targetUrl: z.string().optional().refine((val) => !val || val === "" || /^https?:\/\//.test(val), {
    message: "Geçerli bir URL giriniz"
  }),
});

type KeyValidationData = z.infer<typeof keyValidationSchema>;
type OrderData = z.infer<typeof orderSchema>;

interface ValidatedKey {
  id: number;
  value: string;
  category: string;
  maxQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  service: {
    id: number;
    name: string;
    platform: string;
    type: string;
  };
}

interface OrderHistory {
  id: number;
  orderId: string;
  keyId: number;
  serviceId: number;
  quantity: number;
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  response?: any;
  createdAt: string;
  completedAt?: string;
  service: {
    id: number;
    name: string;
    platform: string;
    type: string;
  };
  key: {
    id: number;
    value: string;
    name: string;
  };
}

export default function UserInterface() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState<'key-entry' | 'order-form' | 'order-tracking'>('key-entry');
  const [validatedKey, setValidatedKey] = useState<ValidatedKey | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create-order' | 'order-history'>('create-order');
  const [orderProgress, setOrderProgress] = useState(0);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [satisfactionLevel, setSatisfactionLevel] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Form configurations
  const keyForm = useForm<KeyValidationData>({
    resolver: zodResolver(keyValidationSchema),
  });

  const orderForm = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
  });

  // Key validation mutation
  const validateKeyMutation = useMutation({
    mutationFn: async (data: KeyValidationData) => {
      const response = await fetch(`/api/validate-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: data.keyValue }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Key doğrulama hatası');
      }
      
      return response.json();
    },
    onSuccess: (data: ValidatedKey) => {
      setValidatedKey(data);
      setCurrentStep('order-form');
      orderForm.setValue('keyValue', data.value);
      orderForm.setValue('serviceId', data.service.id);
      
      toast({
        title: "Key Doğrulandı",
        description: `Key geçerli. Kalan miktar: ${data.remainingQuantity}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Key Doğrulama Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Order creation mutation
  const createOrderMutation = useMutation({
    mutationFn: async (data: OrderData) => {
      const response = await fetch(`/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Sipariş oluşturma hatası');
      }
      
      return response.json();
    },
    onSuccess: (data: any) => {
      setOrderId(data.orderId);
      setCurrentStep('order-tracking');
      
      toast({
        title: "Sipariş Başarıyla Oluşturuldu",
        description: `Sipariş numaranız: ${data.orderId}`,
        action: (
          <Button
            size="sm"
            onClick={() => window.open(`/order-search?orderId=${data.orderId}`, '_blank')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Sipariş Sorgula
          </Button>
        ),
      });
    },
    onError: (error: any, variables, context) => {
      const errorOrderId = error.message?.match(/Sipariş numaranız: ([A-Z0-9-]+)/)?.[1];

      if (errorOrderId) {
        setOrderId(errorOrderId);
        setCurrentStep('order-tracking');
      }

      if (error.message.includes("bakım modunda")) {
        toast({
          title: "Bakım Modu",
          description: "Sistem şu anda bakım modunda. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sipariş Oluşturma Hatası",
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  // Type for order status response
  interface OrderStatus {
    orderId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    message?: string;
    createdAt: string;
    completedAt?: string;
  }

  // Order status query
  const { data: orderStatus, isLoading: orderStatusLoading } = useQuery<OrderStatus>({
    queryKey: [`/api/orders/status/${orderId}`],
    enabled: !!orderId && currentStep === 'order-tracking',
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Order history query  
  const { data: orderHistory, isLoading: orderHistoryLoading } = useQuery<OrderHistory[]>({
    queryKey: ['/api/user/orders'],
    enabled: isAuthenticated && activeTab === 'order-history',
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const simulateOrderProgress = (duration: number = 3000) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 12 + 3; // Random progress between 3-15%
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setOrderProgress(progress);
    }, duration / 15);
    return interval;
  };

  const onKeySubmit = (data: KeyValidationData) => {
    validateKeyMutation.mutate(data);
  };

  const onOrderSubmit = (data: OrderData) => {
    console.log("Order submit clicked with data:", data);
    console.log("Validated key:", validatedKey);
    
    if (!validatedKey) {
      console.log("No validated key found");
      toast({
        title: "Hata",
        description: "Key doğrulaması yapılmamış",
        variant: "destructive",
      });
      return;
    }
    
    // Check remaining quantity
    const maxAllowed = validatedKey.remainingQuantity || validatedKey.maxQuantity;
    console.log("Max allowed quantity:", maxAllowed, "Requested:", data.quantity);
    
    if (data.quantity > maxAllowed) {
      console.log("Quantity check failed");
      toast({
        title: "Miktar Hatası",
        description: `Maksimum ${maxAllowed} sipariş verebilirsiniz`,
        variant: "destructive",
      });
      return;
    }
    
    // Send order with serviceId from validated key
    const serviceId = validatedKey.service?.id || 1; // Use default service ID if none available
    console.log("Creating order with serviceId:", serviceId);
    
    const orderData = {
      keyValue: validatedKey.value,
      serviceId: serviceId,
      quantity: data.quantity,
      targetUrl: data.targetUrl || ""
    };
    
    console.log("Final order data:", orderData);
    
    setIsCreatingOrder(true);
    setOrderProgress(0);
    
    // Start progress animation
    const progressInterval = simulateOrderProgress(2500);
    
    createOrderMutation.mutate(orderData);
    
    // Clear interval on completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setIsCreatingOrder(false);
    }, 3000);
  };

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
        userEmail: isAuthenticated ? "user@example.com" : "",
        userName: isAuthenticated ? "Kullanıcı" : "Ziyaretçi",
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
      
      if (response.ok) {
        setFeedbackSubmitted(true);
        setFeedbackMessage("");
        setSatisfactionLevel("");
        setTimeout(() => {
          setShowFeedback(false);
          setFeedbackSubmitted(false);
        }, 2000);
      } else {
        throw new Error("Geri bildirim gönderilirken hata oluştu");
      }
    } catch (error) {
      alert("Geri bildirim gönderilirken hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetForm = () => {
    setCurrentStep('key-entry');
    setValidatedKey(null);
    setOrderId(null);
    keyForm.reset();
    orderForm.reset();
  };

  // Login required check
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-bounce"></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10"
        >
          {/* Enhanced Card Design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400/30 via-pink-400/30 to-red-400/30 rounded-3xl blur-2xl"></div>
            
            <Card className="relative w-full max-w-lg bg-gradient-to-br from-slate-800/95 via-red-900/90 to-slate-800/95 border border-red-400/30 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl">
              {/* Background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5"></div>
              <div className="absolute top-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl"></div>
              
              <CardHeader className="text-center pb-8 pt-12 relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.11 7 14 7.9 14 9C14 10.11 13.11 11 12 11C10.9 11 10 10.11 10 9C10 7.9 10.9 7 12 7M12 14C13.5 14 15.91 14.5 16.5 16V17H7.5V16C8.09 14.5 10.5 14 12 14Z" fill="currentColor"/>
                  </svg>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <CardTitle className="text-4xl font-black text-transparent bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text mb-4">
                    Giriş Gerekli
                  </CardTitle>
                  <p className="text-xl text-gray-300 font-medium leading-relaxed">
                    Key kullanabilmek için hesabınıza giriş yapın
                  </p>
                </motion.div>
              </CardHeader>
              
              <CardContent className="text-center space-y-6 px-10 pb-10 relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="space-y-4"
                >
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full h-16 text-xl font-bold bg-gradient-to-r from-red-500 via-pink-500 to-red-600 hover:from-red-600 hover:via-pink-600 hover:to-red-700 text-white rounded-2xl shadow-2xl hover:shadow-red-500/30 transition-all duration-300 transform hover:scale-105"
                  >
                    🚀 Giriş Yap / Kayıt Ol
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="w-full h-14 text-lg font-semibold border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white hover:text-white rounded-2xl backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  >
                    🏠 Ana Sayfaya Dön
                  </Button>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="mt-8 p-5 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-400/30 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9C15 10.66 13.66 12 12 12S9 10.66 9 12V9L3 7.5V9C3 12.31 5.69 15 9 15V19L10.5 20.5L12 19L13.5 20.5L15 19V15C18.31 15 21 12.31 21 9Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-400 font-bold text-sm mb-1">Güvenli Key Sistemi</p>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Hızlı kayıt olun ve premium key deneyimi yaşayın
                      </p>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Key className="w-8 h-8 text-white" />
          </div>
          <p className="text-white text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl animate-bounce"></div>
      </div>
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-cyan-400 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-blue-300 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-60 right-1/3 w-2 h-2 bg-cyan-300 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-blue-500 rounded-full animate-ping delay-300"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-blue-950/50 backdrop-blur-sm border-b border-blue-800/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-50">OtoKiwi</h1>
                <p className="text-slate-400">Sosyal Medya Servis Platformu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowFeedback(true)}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Geri Bildirim
              </Button>
              {currentStep !== 'key-entry' && activeTab === 'create-order' && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Yeni Sipariş
                </Button>
              )}
            </div>
          </div>
        </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create-order' | 'order-history')}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50 border-slate-700">
              <TabsTrigger value="create-order" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Sipariş Oluştur
              </TabsTrigger>
              <TabsTrigger value="order-history" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" />
                Sipariş Geçmişi
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create-order" className="mt-6">
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`flex items-center space-x-2 ${currentStep === 'key-entry' ? 'text-blue-400' : 'text-green-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'key-entry' ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {currentStep === 'key-entry' ? '1' : <CheckCircle className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-medium">Key Girişi</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div className={`flex items-center space-x-2 ${currentStep === 'order-form' ? 'text-blue-400' : currentStep === 'order-tracking' ? 'text-green-400' : 'text-slate-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'order-form' ? 'bg-blue-600' : currentStep === 'order-tracking' ? 'bg-green-600' : 'bg-slate-600'}`}>
                      {currentStep === 'order-tracking' ? <CheckCircle className="w-4 h-4" /> : '2'}
                    </div>
                    <span className="text-sm font-medium">Sipariş</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                  <div className={`flex items-center space-x-2 ${currentStep === 'order-tracking' ? 'text-blue-400' : 'text-slate-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'order-tracking' ? 'bg-blue-600' : 'bg-slate-600'}`}>
                      3
                    </div>
                    <span className="text-sm font-medium">Takip</span>
                  </div>
                </div>
              </div>

              {/* Step 1: Key Entry */}
              {currentStep === 'key-entry' && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader className="text-center">
                    <CardTitle className="text-slate-50 flex items-center justify-center space-x-2">
                      <Search className="w-5 h-5" />
                      <span>Key Doğrulama</span>
                    </CardTitle>
                    <p className="text-slate-400">Servis key'inizi girin</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={keyForm.handleSubmit(onKeySubmit)} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Key değerini giriniz..."
                          className="bg-slate-700 border-slate-600 text-slate-50 text-center text-lg h-12"
                          {...keyForm.register("keyValue")}
                        />
                        {keyForm.formState.errors.keyValue && (
                          <p className="text-red-400 text-sm mt-1 text-center">
                            {keyForm.formState.errors.keyValue.message}
                          </p>
                        )}
                      </div>
                      <Button
                        type="submit"
                        disabled={validateKeyMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 h-12"
                      >
                        {validateKeyMutation.isPending ? "Doğrulanıyor..." : "Key Doğrula"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Order Form */}
              {currentStep === 'order-form' && validatedKey && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-slate-50 flex items-center space-x-2">
                      <Package className="w-5 h-5" />
                      <span>Sipariş Detayları</span>
                    </CardTitle>
                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Key:</span>
                        <Badge variant="outline" className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-mono text-[#f8fafc]">{validatedKey.value}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Kalan Miktar:</span>
                        <span className="text-slate-50 font-medium">{validatedKey.remainingQuantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300">Kategori:</span>
                        <span className="text-slate-50">{validatedKey.category}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <AnimatePresence mode="wait">
                      {isCreatingOrder ? (
                        <motion.div
                          key="order-loading"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="text-center py-8 space-y-6"
                        >
                          {/* Animated Shopping Cart */}
                          <motion.div
                            className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              rotate: [0, 10, -10, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <ShoppingCart className="w-8 h-8 text-white" />
                          </motion.div>
                          
                          {/* Progress Bar */}
                          <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-green-400">
                              Sipariş Oluşturuluyor...
                            </h3>
                            
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${orderProgress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                              />
                            </div>
                            
                            <motion.p 
                              className="text-slate-400 text-sm"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 1.8, repeat: Infinity }}
                            >
                              Sipariş sisteme gönderiliyor...
                            </motion.p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.form
                          key="order-form"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onSubmit={orderForm.handleSubmit(onOrderSubmit)} 
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Miktar *
                            </label>
                            <Input
                              type="number"
                              min="1"
                              max={validatedKey.remainingQuantity}
                              placeholder="Sipariş miktarını giriniz"
                              className="bg-slate-700 border-slate-600 text-slate-50"
                              {...orderForm.register("quantity", { valueAsNumber: true })}
                            />
                            {orderForm.formState.errors.quantity && (
                              <p className="text-red-400 text-sm mt-1">
                                {orderForm.formState.errors.quantity.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                              Hedef URL
                            </label>
                            <Input
                              placeholder="https://instagram.com/username/post/..."
                              className="bg-slate-700 border-slate-600 text-slate-50"
                              {...orderForm.register("targetUrl")}
                            />
                            {orderForm.formState.errors.targetUrl && (
                              <p className="text-red-400 text-sm mt-1">
                                {orderForm.formState.errors.targetUrl.message}
                              </p>
                            )}
                          </div>

                          <Button
                            type="submit"
                            disabled={createOrderMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700 h-12"
                          >
                            {createOrderMutation.isPending ? "Sipariş Oluşturuluyor..." : "Sipariş Oluştur"}
                          </Button>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Order Tracking */}
              {currentStep === 'order-tracking' && orderId && (
                <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                  <CardHeader className="text-center">
                    <CardTitle className="text-slate-50 flex items-center justify-center space-x-2">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Sipariş Takibi</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-mono text-blue-400 mb-2">
                        #{orderId}
                      </div>
                      <p className="text-slate-400">Sipariş Numarası</p>
                    </div>

                    <Separator className="bg-slate-600" />

                    <div className="space-y-3">
                      {orderStatusLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-slate-400">Sipariş durumu kontrol ediliyor...</p>
                        </div>
                      ) : orderStatus ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Durum:</span>
                            <Badge variant={orderStatus.status === 'completed' ? 'default' : 'secondary'}>
                              {orderStatus.status === 'pending' && 'Beklemede'}
                              {orderStatus.status === 'processing' && 'İşleniyor'}
                              {orderStatus.status === 'completed' && 'Tamamlandı'}
                              {orderStatus.status === 'failed' && 'Başarısız'}
                            </Badge>
                          </div>
                          {orderStatus.message && (
                            <div className="bg-slate-700/50 rounded p-3">
                              <p className="text-slate-300 text-sm">{orderStatus.message}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                          <p className="text-slate-400">Sipariş durumu alınamadı</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="order-history" className="mt-6">
              <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-50 flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Sipariş Geçmişi</span>
                  </CardTitle>
                  <p className="text-slate-400">Son siparişlerinizi görüntüleyin</p>
                </CardHeader>
                <CardContent>
                  {orderHistoryLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-slate-400">Sipariş geçmişi yükleniyor...</p>
                    </div>
                  ) : orderHistory && orderHistory.length > 0 ? (
                    <div className="space-y-4">
                      {orderHistory.map((order) => (
                        <Card key={order.id} className="bg-slate-700/50 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                                  {order.status === 'pending' && 'Beklemede'}
                                  {order.status === 'processing' && 'İşleniyor'}
                                  {order.status === 'completed' && 'Tamamlandı'}
                                  {order.status === 'failed' && 'Başarısız'}
                                  {order.status === 'cancelled' && 'İptal'}
                                </Badge>
                                <span className="text-sm text-slate-400">
                                  #{order.orderId}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">Miktar:</span>
                                <p className="text-slate-200">{order.quantity}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">URL:</span>
                                <p className="text-slate-200 truncate">
                                  {order.targetUrl ? (
                                    <a 
                                      href={order.targetUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:text-blue-400 flex items-center"
                                    >
                                      {order.targetUrl.length > 30 ? order.targetUrl.substring(0, 30) + '...' : order.targetUrl}
                                      <ExternalLink className="w-3 h-3 ml-1" />
                                    </a>
                                  ) : (
                                    'Belirtilmemiş'
                                  )}
                                </p>
                              </div>
                            </div>

                            {order.message && (
                              <div className="mt-3 p-2 bg-slate-600/50 rounded text-xs text-slate-300">
                                {order.message}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                      <h3 className="text-slate-300 font-medium mb-2">Henüz sipariş yok</h3>
                      <p className="text-slate-500 text-sm">
                        İlk siparişinizi oluşturmak için "Sipariş Oluştur" sekmesini kullanın.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}