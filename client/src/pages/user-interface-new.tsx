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
  User,
  Home,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Globe,
  Hash,
  Calendar,
  PlayCircle
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
    if (!validatedKey) {
      toast({
        title: "Hata",
        description: "Key doğrulaması yapılmamış",
        variant: "destructive",
      });
      return;
    }
    
    // Check remaining quantity
    const maxAllowed = validatedKey.remainingQuantity || validatedKey.maxQuantity;
    
    if (data.quantity > maxAllowed) {
      toast({
        title: "Miktar Hatası",
        description: `Maksimum ${maxAllowed} sipariş verebilirsiniz`,
        variant: "destructive",
      });
      return;
    }
    
    // Send order with serviceId from validated key
    const serviceId = validatedKey.service?.id || 1;
    
    const orderData = {
      keyValue: validatedKey.value,
      serviceId: serviceId,
      quantity: data.quantity,
      targetUrl: data.targetUrl || ""
    };
    
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

  const resetForm = () => {
    setCurrentStep('key-entry');
    setValidatedKey(null);
    setOrderId(null);
    keyForm.reset();
    orderForm.reset();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  // Login required check
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md shadow-2xl border-0">
            <CardHeader className="text-center pb-4">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Giriş Gerekli
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Key kullanabilmek için hesabınıza giriş yapın
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => window.location.href = '/auth'}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                Giriş Yap / Kayıt Ol
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full h-12"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfaya Dön
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Key className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">Yükleniyor...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Modern Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Key className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">KeyPanel</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sosyal Medya Servis Platformu</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {currentStep !== 'key-entry' && activeTab === 'create-order' && (
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="h-10"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Yeni Sipariş
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="h-10"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create-order' | 'order-history')}>
              <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <TabsTrigger 
                  value="create-order" 
                  className="h-12 text-base font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Sipariş Oluştur
                </TabsTrigger>
                <TabsTrigger 
                  value="order-history" 
                  className="h-12 text-base font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <Clock className="w-5 h-5 mr-2" />
                  Sipariş Geçmişi
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="create-order" className="mt-8">
                {/* Progress Steps */}
                <motion.div 
                  className="mb-12"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center justify-center space-x-8">
                    <motion.div 
                      className={`flex items-center space-x-3 ${currentStep === 'key-entry' ? 'text-blue-600' : 'text-green-600'}`}
                      animate={{ scale: currentStep === 'key-entry' ? 1.05 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${currentStep === 'key-entry' ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {currentStep === 'key-entry' ? <Key className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                      </div>
                      <span className="font-semibold">Key Girişi</span>
                    </motion.div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    <motion.div 
                      className={`flex items-center space-x-3 ${currentStep === 'order-form' ? 'text-blue-600' : currentStep === 'order-tracking' ? 'text-green-600' : 'text-gray-400'}`}
                      animate={{ scale: currentStep === 'order-form' ? 1.05 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${currentStep === 'order-form' ? 'bg-blue-600' : currentStep === 'order-tracking' ? 'bg-green-600' : 'bg-gray-400'}`}>
                        {currentStep === 'order-tracking' ? <CheckCircle className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                      </div>
                      <span className="font-semibold">Sipariş</span>
                    </motion.div>
                    
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                    
                    <motion.div 
                      className={`flex items-center space-x-3 ${currentStep === 'order-tracking' ? 'text-blue-600' : 'text-gray-400'}`}
                      animate={{ scale: currentStep === 'order-tracking' ? 1.05 : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${currentStep === 'order-tracking' ? 'bg-blue-600' : 'bg-gray-400'}`}>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="font-semibold">Takip</span>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Step 1: Key Entry */}
                <AnimatePresence mode="wait">
                  {currentStep === 'key-entry' && (
                    <motion.div
                      key="key-entry"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="shadow-xl border-0 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        <CardHeader className="text-center pb-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                          <motion.div
                            className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                            animate={{ rotateY: [0, 180, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Search className="w-10 h-10 text-white" />
                          </motion.div>
                          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Key Doğrulama
                          </CardTitle>
                          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                            Servis anahtarınızı girerek doğrulayın
                          </p>
                        </CardHeader>
                        <CardContent className="p-8">
                          <form onSubmit={keyForm.handleSubmit(onKeySubmit)} className="space-y-6">
                            <div className="relative">
                              <Input
                                placeholder="Servis anahtarınızı buraya girin..."
                                className="h-16 text-lg text-center font-mono border-2 focus:border-blue-500 rounded-xl bg-gray-50 dark:bg-gray-800"
                                {...keyForm.register("keyValue")}
                              />
                              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                                <Key className="w-6 h-6 text-gray-400" />
                              </div>
                            </div>
                            {keyForm.formState.errors.keyValue && (
                              <motion.p
                                className="text-red-500 text-center font-medium flex items-center justify-center space-x-2"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                              >
                                <AlertCircle className="w-4 h-4" />
                                <span>{keyForm.formState.errors.keyValue.message}</span>
                              </motion.p>
                            )}
                            <Button
                              type="submit"
                              disabled={validateKeyMutation.isPending}
                              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg transition-all duration-200"
                            >
                              {validateKeyMutation.isPending ? (
                                <motion.div
                                  className="flex items-center space-x-3"
                                  animate={{ opacity: [1, 0.5, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                  <Activity className="w-6 h-6 animate-spin" />
                                  <span>Doğrulanıyor...</span>
                                </motion.div>
                              ) : (
                                <div className="flex items-center space-x-3">
                                  <Shield className="w-6 h-6" />
                                  <span>Key Doğrula</span>
                                </div>
                              )}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Step 2: Order Form */}
                  {currentStep === 'order-form' && validatedKey && (
                    <motion.div
                      key="order-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Key Info Card */}
                      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                              <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-green-800 dark:text-green-400 text-lg">
                                Key Doğrulandı
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-green-600 dark:text-green-400">Kategori</p>
                                  <p className="font-semibold text-green-800 dark:text-green-300">{validatedKey.category}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-green-600 dark:text-green-400">Kalan Miktar</p>
                                  <p className="font-semibold text-green-800 dark:text-green-300">{validatedKey.remainingQuantity.toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Order Form Card */}
                      <Card className="shadow-xl border-0 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>
                        <CardHeader className="text-center pb-6">
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center justify-center space-x-3">
                            <Package className="w-8 h-8 text-blue-600" />
                            <span>Sipariş Detayları</span>
                          </CardTitle>
                          <p className="text-gray-600 dark:text-gray-400">
                            Sipariş bilgilerinizi girin ve siparişinizi oluşturun
                          </p>
                        </CardHeader>
                        <CardContent className="p-8">
                          <form onSubmit={orderForm.handleSubmit(onOrderSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  <Hash className="w-4 h-4 inline mr-1" />
                                  Miktar
                                </label>
                                <Input
                                  type="number"
                                  placeholder="Örn: 1000"
                                  min={1}
                                  max={validatedKey.remainingQuantity}
                                  className="h-12 text-lg border-2 focus:border-blue-500 rounded-lg"
                                  {...orderForm.register("quantity", { valueAsNumber: true })}
                                />
                                {orderForm.formState.errors.quantity && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{orderForm.formState.errors.quantity.message}</span>
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                  <Target className="w-4 h-4 inline mr-1" />
                                  Hedef URL
                                </label>
                                <Input
                                  placeholder="https://instagram.com/kullanici"
                                  className="h-12 text-lg border-2 focus:border-blue-500 rounded-lg"
                                  {...orderForm.register("targetUrl")}
                                />
                                {orderForm.formState.errors.targetUrl && (
                                  <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{orderForm.formState.errors.targetUrl.message}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex space-x-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="flex-1 h-14 text-lg"
                              >
                                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                                Geri Dön
                              </Button>
                              <Button
                                type="submit"
                                disabled={createOrderMutation.isPending || isCreatingOrder}
                                className="flex-2 h-14 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                              >
                                {createOrderMutation.isPending || isCreatingOrder ? (
                                  <motion.div
                                    className="flex items-center space-x-3"
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Activity className="w-5 h-5 animate-spin" />
                                    <span>Oluşturuluyor...</span>
                                  </motion.div>
                                ) : (
                                  <div className="flex items-center space-x-3">
                                    <PlayCircle className="w-5 h-5" />
                                    <span>Sipariş Oluştur</span>
                                  </div>
                                )}
                              </Button>
                            </div>

                            {/* Progress Bar */}
                            {isCreatingOrder && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6"
                              >
                                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${orderProgress}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                                  Sipariş işleniyor... {Math.round(orderProgress)}%
                                </p>
                              </motion.div>
                            )}
                          </form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Step 3: Order Tracking */}
                  {currentStep === 'order-tracking' && orderId && (
                    <motion.div
                      key="order-tracking"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card className="shadow-xl border-0 overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
                        <CardHeader className="text-center pb-6">
                          <motion.div
                            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <TrendingUp className="w-10 h-10 text-white" />
                          </motion.div>
                          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Sipariş Oluşturuldu!
                          </CardTitle>
                          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                            Siparişiniz başarıyla oluşturuldu ve işleme alındı
                          </p>
                        </CardHeader>
                        <CardContent className="p-8">
                          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-center space-x-3 mb-4">
                              <Hash className="w-6 h-6 text-purple-600" />
                              <span className="text-2xl font-bold text-purple-800 dark:text-purple-400">
                                {orderId}
                              </span>
                            </div>
                            <p className="text-center text-purple-700 dark:text-purple-300 font-medium">
                              Bu numarayı not alın ve sipariş durumunu takip etmek için kullanın
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                              onClick={() => window.open(`/order-search?orderId=${orderId}`, '_blank')}
                              className="flex-1 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
                            >
                              <ExternalLink className="w-5 h-5 mr-2" />
                              Sipariş Sorgula
                            </Button>
                            <Button
                              variant="outline"
                              onClick={resetForm}
                              className="flex-1 h-14 text-lg"
                            >
                              <Zap className="w-5 h-5 mr-2" />
                              Yeni Sipariş
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
              
              <TabsContent value="order-history" className="mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="shadow-xl border-0">
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-3">
                        <Clock className="w-8 h-8 text-blue-600" />
                        <span>Sipariş Geçmişi</span>
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400">
                        Tüm sipariş işlemlerinizi buradan görüntüleyebilirsiniz
                      </p>
                    </CardHeader>
                    <CardContent>
                      {orderHistoryLoading ? (
                        <div className="text-center py-12">
                          <motion.div
                            className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <Activity className="w-6 h-6 text-white" />
                          </motion.div>
                          <p className="text-gray-600 dark:text-gray-400">Yükleniyor...</p>
                        </div>
                      ) : orderHistory && orderHistory.length > 0 ? (
                        <div className="space-y-4">
                          {orderHistory.map((order, index) => (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <Hash className="w-5 h-5 text-gray-500" />
                                  <span className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                    {order.orderId}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(order.status)}
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status === 'pending' && 'Bekliyor'}
                                    {order.status === 'processing' && 'İşleniyor'}
                                    {order.status === 'completed' && 'Tamamlandı'}
                                    {order.status === 'failed' && 'Başarısız'}
                                    {order.status === 'cancelled' && 'İptal'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Miktar</p>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">{order.quantity.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Tarih</p>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                                  </p>
                                </div>
                              </div>
                              
                              {order.targetUrl && (
                                <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <Globe className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Hedef URL:</span>
                                  </div>
                                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100 mt-1 break-all">
                                    {order.targetUrl}
                                  </p>
                                </div>
                              )}
                              
                              <div className="mt-4 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/order-search?orderId=${order.orderId}`, '_blank')}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Detay
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            Henüz sipariş yok
                          </h3>
                          <p className="text-gray-500 dark:text-gray-500 mb-6">
                            İlk siparişinizi oluşturmak için "Sipariş Oluştur" sekmesini kullanın
                          </p>
                          <Button
                            onClick={() => setActiveTab('create-order')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Sipariş Oluştur
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
}