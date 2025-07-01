import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  RotateCcw,
  CheckCircle2,
  Tag,
  Calendar,
  Link,
  Sparkles,
  Zap,
  ArrowLeft,
  Package,
  Shield,
  Activity,
  Globe,
  Hash,
  AlertTriangle,
  CheckCircle as CheckIcon,
  Timer,
  TrendingUp
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeProvider } from "@/hooks/use-theme";

const searchSchema = z.object({
  orderId: z.string().min(1, "Sipariş ID gerekli"),
});

type SearchData = z.infer<typeof searchSchema>;

interface OrderDetails {
  id: number;
  orderId: string;
  keyId: number;
  serviceId: number;
  quantity: number;
  targetUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'partial' | 'in_progress';
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
    category: string;
    value: string;
    name: string;
  };
}

export default function OrderSearchPage() {
  const { toast } = useToast();
  const [searchedOrder, setSearchedOrder] = useState<OrderDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [orderNotFound, setOrderNotFound] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);

  const searchForm = useForm<SearchData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      orderId: ""
    }
  });

  // Auto-populate order ID from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdParam = urlParams.get('orderId');
    if (orderIdParam) {
      searchForm.setValue('orderId', orderIdParam);
      searchOrderMutation.mutate({ orderId: orderIdParam });
    }
  }, []);

  // Auto-refresh order status every 10 seconds if order is found and not completed
  useEffect(() => {
    if (searchedOrder && !['completed', 'failed', 'cancelled'].includes(searchedOrder.status)) {
      setIsAutoRefreshing(true);
      const interval = setInterval(() => {
        searchOrderMutation.mutate({ orderId: searchedOrder.orderId });
      }, 10000);

      return () => {
        clearInterval(interval);
        setIsAutoRefreshing(false);
      };
    } else {
      setIsAutoRefreshing(false);
    }
  }, [searchedOrder]);

  // Search order mutation
  const searchOrderMutation = useMutation({
    mutationFn: async (data: SearchData) => {
      setIsSearching(true);
      setOrderNotFound(false);
      const response = await apiRequest("GET", `/api/orders/search/${data.orderId}`);
      return response.json();
    },
    onSuccess: (data: OrderDetails) => {
      setSearchedOrder(data);
      setLastUpdated(new Date());
      setIsSearching(false);
    },
    onError: (error) => {
      console.error("Order search error:", error);
      setOrderNotFound(true);
      setSearchedOrder(null);
      setIsSearching(false);
      toast({
        title: "Sipariş bulunamadı",
        description: "Girdiğiniz sipariş ID'si bulunamadı. Lütfen kontrol edip tekrar deneyin.",
        variant: "destructive",
      });
    }
  });

  const onSearch = (data: SearchData) => {
    searchOrderMutation.mutate(data);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      case 'processing':
        return 'İşleniyor';
      case 'pending':
        return 'Beklemede';
      case 'partial':
        return 'Kısmi Tamamlandı';
      case 'in_progress':
        return 'Devam Ediyor';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            ✅ Tamamlandı
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            ❌ Başarısız
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            🚫 İptal Edildi
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-pulse">
            ⚡ İşleniyor
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-lg animate-pulse">
            🔄 Devam Ediyor
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            🕐 Sipariş Alındı
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            ⚡ Kısmi
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-medium shadow-lg">
            ❓ Bilinmiyor
          </Badge>
        );
    }
  };

  const getProgressSteps = (status: string) => {
    const steps = [
      { key: 'pending', label: 'Sipariş Alındı', icon: CheckCircle2 },
      { key: 'processing', label: 'İşleniyor', icon: Settings },
      { key: 'in_progress', label: 'Devam Ediyor', icon: RotateCcw },
      { key: 'completed', label: 'Tamamlandı', icon: CheckCircle }
    ];

    return steps.map((step, index) => {
      const isActive = 
        (status === 'pending' && index === 0) ||
        (status === 'processing' && index === 1) ||
        (status === 'in_progress' && index === 2) ||
        (status === 'completed' && index === 3) ||
        (status === 'partial' && index === 2) ||
        (status === 'failed' && index === 1) ||
        (status === 'cancelled' && index === 1);

      const isCompleted = 
        (status === 'processing' && index === 0) ||
        (status === 'in_progress' && index <= 1) ||
        (status === 'completed' && index <= 2) ||
        (status === 'partial' && index <= 1);

      const isFailed = (status === 'failed' || status === 'cancelled') && index > 1;

      return {
        ...step,
        isActive,
        isCompleted,
        isFailed
      };
    });
  };

  // Progress Component with Enhanced Animations
  const ProgressSteps = ({ order }: { order: OrderDetails }) => {
    const steps = getProgressSteps(order.status);
    const completedSteps = steps.filter(step => step.isCompleted).length;
    const activeStepIndex = steps.findIndex(step => step.isActive);
    
    return (
      <div className="w-full py-8">
        <div className="relative flex items-center justify-between">
          {/* Background Line */}
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full transform -translate-y-1/2 z-0" />
          
          {/* Animated Progress Line */}
          <motion.div
            className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transform -translate-y-1/2 z-10"
            initial={{ width: "0%" }}
            animate={{ 
              width: activeStepIndex >= 0 
                ? `${((completedSteps + 0.5) / steps.length) * 100}%`
                : `${(completedSteps / steps.length) * 100}%`
            }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
          
          {/* Steps */}
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="relative z-20 flex flex-col items-center">
                {/* Step Circle */}
                <motion.div
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg transition-all duration-500 ease-in-out ${
                    step.isCompleted 
                      ? 'bg-green-500 border-green-500 text-white shadow-green-200 dark:shadow-green-800' 
                      : step.isActive 
                        ? 'bg-blue-500 border-blue-500 text-white shadow-blue-200 dark:shadow-blue-800' 
                        : step.isFailed
                          ? 'bg-red-500 border-red-500 text-white shadow-red-200 dark:shadow-red-800'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 shadow-gray-100 dark:shadow-gray-900'
                  }`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: step.isActive ? 1.1 : 1,
                    opacity: 1,
                    rotateY: step.isCompleted ? 360 : 0
                  }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.2,
                    rotateY: { duration: 0.8, delay: step.isCompleted ? 0.3 : 0 }
                  }}
                >
                  {/* Pulsing ring for active state */}
                  {step.isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-blue-500"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.7, 0, 0.7]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                  
                  {/* Icon with animation */}
                  <AnimatePresence mode="wait">
                    {step.isCompleted ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className={`w-6 h-6 ${step.isActive ? 'animate-spin' : ''}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Step Label */}
                <motion.p
                  className={`mt-4 text-sm font-medium text-center transition-colors duration-300 ${
                    step.isCompleted ? 'text-green-600 dark:text-green-400' : 
                    step.isActive ? 'text-blue-600 dark:text-blue-400' : 
                    step.isFailed ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                >
                  {step.label}
                </motion.p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-100 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 transition-all duration-500 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-xl opacity-30"
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -180, -360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border-b border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center space-x-6"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <div className="relative">
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Search className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-3 h-3 text-white" />
                  </motion.div>
                </div>
                <div>
                  <motion.h1 
                    className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    🔍 Sipariş Sorgulama
                  </motion.h1>
                  <motion.p 
                    className="text-slate-600 dark:text-slate-300 font-medium text-lg mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    Siparişinizin durumunu gerçek zamanlı takip edin
                  </motion.p>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center space-x-4"
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-300 dark:border-gray-600 hover:bg-white/80 dark:hover:bg-gray-800/80"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
                <ThemeToggle />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-12">
          {/* Search Form */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-2"></div>
              <CardContent className="p-12">
                <div className="text-center mb-10">
                  <motion.h2 
                    className="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <Zap className="inline w-8 h-8 mr-3 text-yellow-500" />
                    Hızlı Sipariş Arama
                  </motion.h2>
                  <motion.p 
                    className="text-slate-600 dark:text-slate-300 text-lg max-w-2xl mx-auto"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    Sipariş ID'nizi girerek siparişinizin güncel durumunu öğrenin ve sürecini takip edin
                  </motion.p>
                </div>
                
                <motion.form 
                  onSubmit={searchForm.handleSubmit(onSearch)} 
                  className="space-y-8"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                      <Search className="h-7 w-7 text-slate-400" />
                    </div>
                    <Input
                      placeholder="Sipariş ID'nizi buraya girin (örn: ORD-123456)"
                      className="h-20 pl-20 pr-8 text-xl font-medium border-3 border-slate-200 dark:border-slate-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-slate-400 focus:ring-6 focus:ring-blue-500/20 focus:border-blue-500 rounded-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-500 shadow-inner"
                      {...searchForm.register("orderId")}
                    />
                    {searchForm.formState.errors.orderId && (
                      <motion.p 
                        className="text-red-500 text-sm mt-3 ml-4"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {searchForm.formState.errors.orderId.message}
                      </motion.p>
                    )}
                  </div>
                  
                  <motion.div className="flex justify-center">
                    <Button 
                      type="submit" 
                      disabled={isSearching}
                      className="h-20 px-16 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-xl shadow-2xl hover:shadow-3xl rounded-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transform-gpu"
                    >
                      {isSearching ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="w-7 h-7 mr-4" />
                          </motion.div>
                          Aranıyor...
                        </>
                      ) : (
                        <>
                          <Search className="w-7 h-7 mr-4" />
                          🚀 Sorgula
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <AnimatePresence>
            {searchedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 h-2"></div>
                  <CardContent className="p-12">
                    <div className="space-y-10">
                      {/* Order Header */}
                      <motion.div 
                        className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-6 lg:space-y-0"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      >
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            📦 Sipariş Detayları
                          </h3>
                          <p className="text-4xl font-mono font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            #{searchedOrder.orderId}
                          </p>
                        </div>
                        <div className="text-center lg:text-right space-y-3">
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Durum:</p>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            {getStatusBadge(searchedOrder.status)}
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Progress Steps */}
                      <motion.div 
                        className="my-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                      >
                        <ProgressSteps order={searchedOrder} />
                      </motion.div>

                      {/* Auto-refresh indicator */}
                      {isAutoRefreshing && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-center space-x-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            <RefreshCw className="w-5 h-5" />
                          </motion.div>
                          <span className="font-medium">Otomatik güncelleme aktif</span>
                          {lastUpdated && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Son güncelleme: {lastUpdated.toLocaleTimeString('tr-TR')}
                            </span>
                          )}
                        </motion.div>
                      )}

                      {/* Order Details Grid */}
                      <motion.div 
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <div className="space-y-6">
                          <motion.div 
                            className="flex items-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Tag className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-4" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Kategori:</p>
                              <p className="font-bold text-gray-900 dark:text-white text-lg">{searchedOrder.key.category}</p>
                            </div>
                          </motion.div>
                          <motion.div 
                            className="flex items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Calendar className="w-6 h-6 text-green-600 dark:text-green-400 mr-4" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Miktar:</p>
                              <p className="font-bold text-gray-900 dark:text-white text-lg">{searchedOrder.quantity}</p>
                            </div>
                          </motion.div>
                        </div>
                        <div className="space-y-6">
                          <motion.div 
                            className="flex items-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Link className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-4" />
                            <div className="flex-1">
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Hedef URL:</p>
                              <p className="font-bold text-gray-900 dark:text-white text-sm break-all">{searchedOrder.targetUrl}</p>
                            </div>
                          </motion.div>
                          <motion.div 
                            className="flex items-center p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl shadow-lg"
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CheckCircle2 className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-4" />
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Anahtar:</p>
                              <p className="font-bold text-gray-900 dark:text-white font-mono text-sm">{searchedOrder.key.value}</p>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Timestamp */}
                      <motion.div 
                        className="text-center pt-6 border-t border-gray-200 dark:border-gray-700"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                      >
                        <p className="text-lg text-gray-700 dark:text-gray-300">
                          📅 Oluşturulma: <span className="font-bold text-blue-600 dark:text-blue-400">
                            {searchedOrder.createdAt 
                              ? new Date(searchedOrder.createdAt).toLocaleString('tr-TR', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Bilinmiyor'
                            }
                          </span>
                        </p>
                      </motion.div>

                      {/* Manual Refresh Button */}
                      <motion.div 
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 1 }}
                      >
                        <Button 
                          onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                          disabled={searchOrderMutation.isPending}
                          variant="outline"
                          className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-blue-200 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 rounded-xl px-8 py-3"
                        >
                          <RefreshCw className={`w-5 h-5 mr-3 ${searchOrderMutation.isPending ? 'animate-spin' : ''}`} />
                          Manuel Yenile
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Order Not Found */}
          <AnimatePresence>
            {orderNotFound && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 h-2"></div>
                  <CardContent className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: "spring" }}
                    >
                      <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">❌ Sipariş Bulunamadı</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-lg max-w-md mx-auto">
                      Girdiğiniz sipariş ID'si bulunamadı. Lütfen kontrol edip tekrar deneyin.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ThemeProvider>
  );
}