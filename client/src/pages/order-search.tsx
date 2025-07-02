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
  ArrowLeft,
  Package,
  Activity,
  Globe,
  Hash,
  Timer,
  TrendingUp,
  Sparkles,
  KeyRound,
  Home
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

// Advanced Background Component
const ModernBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Base Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/50 via-transparent to-cyan-950/30" />
      
      {/* Floating Orbs */}
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 40%, transparent 70%)',
          filter: 'blur(40px)',
          top: '20%', 
          left: '10%'
        }}
        animate={{
          x: [0, 200, 0],
          y: [0, -100, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(168, 85, 247, 0.04) 40%, transparent 70%)',
          filter: 'blur(35px)',
          top: '60%', 
          right: '15%'
        }}
        animate={{
          x: [0, -150, 0],
          y: [0, 120, 0],
          scale: [1.2, 0.8, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
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
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <CheckCircle className="w-4 h-4 mr-2" />
            Tamamlandı
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <XCircle className="w-4 h-4 mr-2" />
            Başarısız
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <XCircle className="w-4 h-4 mr-2" />
            İptal Edildi
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
            <Activity className="w-4 h-4 mr-2" />
            İşleniyor
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 text-sm font-semibold shadow-lg animate-pulse">
            <Timer className="w-4 h-4 mr-2" />
            Devam Ediyor
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <Clock className="w-4 h-4 mr-2" />
            Beklemede
          </Badge>
        );
      case 'partial':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <TrendingUp className="w-4 h-4 mr-2" />
            Kısmi Tamamlandı
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 text-sm font-semibold shadow-lg">
            <Hash className="w-4 h-4 mr-2" />
            Bilinmiyor
          </Badge>
        );
    }
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

  return (
    <div className="min-h-screen text-white relative">
      {/* Modern Background */}
      <ModernBackground />
      
      {/* Header */}
      <motion.header 
        className="relative z-10 border-b border-white/10 backdrop-blur-2xl bg-black/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div 
                className="w-12 h-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <Search className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Sipariş Takip
                </h1>
                <p className="text-white/60 text-sm">Sipariş durumunu anında sorgulayın</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="border-white/20 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-sm"
              >
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full border border-white/20 backdrop-blur-sm mb-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Package className="w-4 h-4 text-blue-300 mr-2" />
              <span className="text-white/90 text-sm font-medium">Anlık Sipariş Durumu</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Sipariş Durumu Sorgula
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8">
              Sipariş numaranızı girerek güncel durumu görüntüleyin
            </p>

            {/* Search Form */}
            <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
              <div className="relative">
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  <Input
                    {...searchForm.register("orderId")}
                    placeholder="Sipariş ID (örn: 458465)"
                    className="w-full h-14 px-6 text-lg bg-black/30 border border-white/20 rounded-2xl backdrop-blur-sm text-white placeholder-white/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none" />
                </motion.div>
              </div>
              
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="w-full h-14 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-2xl shadow-2xl transition-all duration-300 disabled:opacity-50"
                >
                  {isSearching ? (
                    <motion.div 
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div 
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Aranıyor...</span>
                    </motion.div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <Search className="w-6 h-6" />
                      <span>Sipariş Sorgula</span>
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>

          {/* Order Results */}
          <AnimatePresence mode="wait">
            {searchedOrder && (
              <motion.div
                key="order-found"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-black/30 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <motion.div 
                          className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-xl"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Package className="w-8 h-8 text-white" />
                        </motion.div>
                        <div>
                          <CardTitle className="text-2xl font-bold text-white mb-2">
                            Sipariş #{searchedOrder.orderId}
                          </CardTitle>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(searchedOrder.status)}
                            {isAutoRefreshing && (
                              <motion.div 
                                className="flex items-center text-blue-300 text-sm"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                                Otomatik güncelleniyor
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="relative z-10 space-y-6">
                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div 
                        className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-blue-400" />
                          Servis Bilgileri
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-white/60 text-sm">Platform</p>
                            <p className="text-white font-medium">{searchedOrder.service.platform}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Servis Adı</p>
                            <p className="text-white font-medium">{searchedOrder.service.name}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Miktar</p>
                            <p className="text-white font-medium">{searchedOrder.quantity.toLocaleString()}</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div 
                        className="bg-white/5 rounded-2xl p-6 border border-white/10"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <KeyRound className="w-5 h-5 mr-2 text-purple-400" />
                          Key Bilgileri
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-white/60 text-sm">Kategori</p>
                            <p className="text-white font-medium">{searchedOrder.key.category}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Key Adı</p>
                            <p className="text-white font-medium">{searchedOrder.key.name}</p>
                          </div>
                          <div>
                            <p className="text-white/60 text-sm">Hedef URL</p>
                            <p className="text-white font-medium break-all text-sm">{searchedOrder.targetUrl}</p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Timeline */}
                    <motion.div 
                      className="bg-white/5 rounded-2xl p-6 border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Timer className="w-5 h-5 mr-2 text-emerald-400" />
                        Zaman Çizelgesi
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white/60">Sipariş Oluşturulma</span>
                          <span className="text-white font-medium">{formatDate(searchedOrder.createdAt)}</span>
                        </div>
                        {searchedOrder.completedAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Tamamlanma</span>
                            <span className="text-white font-medium">{formatDate(searchedOrder.completedAt)}</span>
                          </div>
                        )}
                        {lastUpdated && (
                          <div className="flex justify-between items-center">
                            <span className="text-white/60">Son Güncelleme</span>
                            <span className="text-white font-medium">{formatDate(lastUpdated.toISOString())}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>

                    {searchedOrder.message && (
                      <motion.div 
                        className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <h3 className="text-lg font-semibold text-blue-300 mb-2 flex items-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Mesaj
                        </h3>
                        <p className="text-white/80">{searchedOrder.message}</p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {orderNotFound && (
              <motion.div
                key="order-not-found"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.95 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-red-500/10 border border-red-400/30 backdrop-blur-xl rounded-3xl p-8 text-center">
                  <motion.div 
                    className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <XCircle className="w-10 h-10 text-red-400" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-red-300 mb-4">Sipariş Bulunamadı</h3>
                  <p className="text-white/70 text-lg">
                    Girdiğiniz sipariş ID'si sistemde kayıtlı değil. Lütfen tekrar kontrol edin.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}