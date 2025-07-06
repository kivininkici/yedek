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
  Package,
  Activity,
  Globe,
  Timer,
  TrendingUp,
  Home,
  Hash,
  Eye,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

// Clean Modern Background
const CleanBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800" />
      
      {/* Subtle floating orbs */}
      <motion.div 
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          top: '10%', 
          left: '10%'
        }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-80 h-80 rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          filter: 'blur(40px)',
          bottom: '20%', 
          right: '10%'
        }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1.1, 0.9, 1.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { bg: "bg-emerald-500", icon: CheckCircle, text: "Tamamlandı" },
      failed: { bg: "bg-red-500", icon: XCircle, text: "Başarısız" },
      cancelled: { bg: "bg-gray-500", icon: XCircle, text: "İptal Edildi" },
      processing: { bg: "bg-blue-500", icon: Activity, text: "İşleniyor" },
      in_progress: { bg: "bg-purple-500", icon: Timer, text: "Devam Ediyor" },
      pending: { bg: "bg-orange-500", icon: Clock, text: "Beklemede" },
      partial: { bg: "bg-yellow-500", icon: TrendingUp, text: "Kısmi Tamamlandı" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { bg: "bg-gray-500", icon: Hash, text: "Bilinmiyor" };

    const Icon = config.icon;

    return (
      <Badge className={`${config.bg} hover:${config.bg} text-white px-4 py-2 text-sm font-semibold shadow-lg`}>
        <Icon className="w-4 h-4 mr-2" />
        {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Modern Progress Tracker Component
  const renderProgressTracker = (status: string) => {
    const steps = [
      { 
        id: 'received', 
        label: 'Sipariş Alındı', 
        icon: CheckCircle,
        statuses: ['pending', 'processing', 'in_progress', 'completed', 'partial', 'failed', 'cancelled']
      },
      { 
        id: 'processing', 
        label: 'İşleniyor', 
        icon: Activity,
        statuses: ['processing', 'in_progress', 'completed', 'partial']
      },
      { 
        id: 'progress', 
        label: 'Devam Ediyor', 
        icon: TrendingUp,
        statuses: ['in_progress', 'completed', 'partial']
      },
      { 
        id: 'completed', 
        label: 'Tamamlandı', 
        icon: Package,
        statuses: ['completed']
      }
    ];

    const getCurrentStepIndex = () => {
      if (status === 'completed') return 3;
      if (status === 'in_progress' || status === 'partial') return 2;
      if (status === 'processing') return 1;
      return 0;
    };

    const currentStep = getCurrentStepIndex();

    return (
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-6 right-6 h-1 bg-gray-700 rounded-full">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ 
              width: status === 'failed' || status === 'cancelled' ? '25%' : `${(currentStep / 3) * 100}%` 
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            const isCompleted = index < currentStep || status === 'completed';
            const isFailed = (status === 'failed' || status === 'cancelled') && index > 0;
            
            const IconComponent = step.icon;

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center relative z-10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                {/* Step Circle */}
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isFailed
                      ? 'bg-gray-600 border-gray-500'
                      : isCompleted
                      ? 'bg-green-500 border-green-400 shadow-lg shadow-green-500/30'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/30'
                      : isActive
                      ? 'bg-blue-500/20 border-blue-400'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                  animate={isCurrent ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 30px rgba(59, 130, 246, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.3)'
                    ]
                  } : {}}
                  transition={isCurrent ? {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}}
                >
                  <IconComponent 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      isFailed
                        ? 'text-gray-400'
                        : isCompleted
                        ? 'text-white'
                        : isCurrent
                        ? 'text-white'
                        : isActive
                        ? 'text-blue-300'
                        : 'text-gray-500'
                    }`} 
                  />
                </motion.div>

                {/* Step Label */}
                <motion.div 
                  className="mt-3 text-center"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                >
                  <p className={`text-sm font-medium transition-colors duration-300 ${
                    isFailed
                      ? 'text-gray-500'
                      : isActive
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </motion.div>

                {/* Current Step Indicator */}
                {isCurrent && !isFailed && (
                  <motion.div
                    className="absolute -bottom-6 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Status Message */}
        {(status === 'failed' || status === 'cancelled') && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <div className="flex items-center justify-center space-x-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">
                {status === 'failed' ? 'Sipariş başarısız oldu' : 'Sipariş iptal edildi'}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen text-white relative">
      <CleanBackground />
      
      {/* Header */}
      <motion.header 
        className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Sipariş Takip</h1>
                <p className="text-gray-400 text-sm">Anlık durum sorgulama</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30 mb-6">
              <Package className="w-4 h-4 text-blue-300 mr-2" />
              <span className="text-blue-200 text-sm font-medium">Canlı Sipariş Takibi</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Sipariş Durumu Sorgula
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Sipariş numaranızı girerek güncel durumu ve detayları görüntüleyin
            </p>

            {/* Search Form */}
            <Card className="bg-black/30 border border-white/20 backdrop-blur-xl max-w-2xl mx-auto">
              <CardContent className="p-6">
                <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
                  <div className="relative">
                    <Input
                      {...searchForm.register("orderId")}
                      placeholder="Sipariş ID girin (örn: 458465)"
                      className="h-14 text-lg bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-400"
                    />
                    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSearching}
                    className="w-full h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold text-lg"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Aranıyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Sipariş Sorgula</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Results */}
          <AnimatePresence mode="wait">
            {searchedOrder && (
              <motion.div
                key="order-found"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                {/* Order Header */}
                <Card className="bg-black/30 border border-white/20 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <Package className="w-8 h-8 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-white mb-2">
                            Sipariş #{searchedOrder.orderId}
                          </CardTitle>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(searchedOrder.status)}
                            {isAutoRefreshing && (
                              <div className="flex items-center text-blue-300 text-sm">
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                Otomatik güncelleniyor
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                        disabled={isSearching}
                        variant="outline"
                        className="border-white/20 bg-white/10 hover:bg-white/20 text-white"
                      >
                        <RefreshCw className={`w-4 h-4 mr-2 ${isSearching ? 'animate-spin' : ''}`} />
                        Yenile
                      </Button>
                    </div>
                  </CardHeader>
                </Card>

                {/* Order Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Order Progress Tracker */}
                  <Card className="bg-black/30 border border-white/20 backdrop-blur-xl md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Activity className="w-5 h-5 mr-2 text-blue-400" />
                        Sipariş Durumu
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {renderProgressTracker(searchedOrder.status)}
                    </CardContent>
                  </Card>

                  {/* Service Info - Simplified */}
                  <Card className="bg-black/30 border border-white/20 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Package className="w-5 h-5 mr-2 text-blue-400" />
                        Sipariş Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm">Kategori</p>
                        <p className="text-white font-medium">{searchedOrder.key.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Miktar</p>
                        <p className="text-white font-medium">{searchedOrder.quantity.toLocaleString()}</p>
                      </div>
                      {searchedOrder.targetUrl && (
                        <div>
                          <p className="text-gray-400 text-sm">Hedef URL</p>
                          <p className="text-white font-medium break-all text-sm">{searchedOrder.targetUrl}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Key Info */}
                  <Card className="bg-black/30 border border-white/20 backdrop-blur-xl">
                    <CardHeader>
                      <CardTitle className="flex items-center text-white">
                        <Eye className="w-5 h-5 mr-2 text-purple-400" />
                        Key Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-gray-400 text-sm">Kategori</p>
                        <p className="text-white font-medium">{searchedOrder.key.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Key Adı</p>
                        <p className="text-white font-medium">{searchedOrder.key.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Oluşturulma</p>
                        <p className="text-white font-medium">{formatDate(searchedOrder.createdAt)}</p>
                      </div>
                      {searchedOrder.completedAt && (
                        <div>
                          <p className="text-gray-400 text-sm">Tamamlanma</p>
                          <p className="text-white font-medium">{formatDate(searchedOrder.completedAt)}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Status Message - Filtered for customer privacy */}
                {searchedOrder.message && !searchedOrder.message.includes('API Order ID') && !searchedOrder.message.includes('charge') && (
                  <Card className="bg-blue-500/10 border border-blue-400/30 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Durum Bilgisi
                      </h3>
                      <p className="text-white">
                        {searchedOrder.message.includes('Sipariş başarıyla oluşturuldu') 
                          ? 'Siparişiniz başarıyla oluşturuldu ve işleme alındı.'
                          : searchedOrder.message.split('API')[0].trim() || 'Sipariş durumu güncellendi.'
                        }
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Last Updated */}
                {lastUpdated && (
                  <div className="text-center text-gray-400 text-sm">
                    Son güncelleme: {formatDate(lastUpdated.toISOString())}
                  </div>
                )}
              </motion.div>
            )}

            {orderNotFound && (
              <motion.div
                key="order-not-found"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-red-500/10 border border-red-400/30 backdrop-blur-xl max-w-2xl mx-auto">
                  <CardContent className="text-center py-12">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-red-300 mb-4">Sipariş Bulunamadı</h3>
                    <p className="text-gray-300 mb-6">
                      Girdiğiniz sipariş ID'si sistemde kayıtlı değil. Lütfen doğru ID'yi girdiğinizden emin olun.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderNotFound(false);
                        searchForm.reset();
                      }}
                      className="border-red-400/30 bg-red-500/10 hover:bg-red-500/20 text-red-300"
                    >
                      Tekrar Dene
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}