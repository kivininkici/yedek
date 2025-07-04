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

// Advanced Background Component with Enhanced Effects
const ModernBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced Base Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/50 via-transparent to-cyan-950/30" />
      <div className="absolute inset-0 bg-gradient-to-bl from-pink-900/20 via-transparent to-emerald-900/20" />
      
      {/* Enhanced Floating Orbs with More Dynamic Movement */}
      <motion.div 
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.08) 40%, rgba(236, 72, 153, 0.03) 70%, transparent 100%)',
          filter: 'blur(50px)',
          top: '10%', 
          left: '5%'
        }}
        animate={{
          x: [0, 300, -100, 0],
          y: [0, -150, 100, 0],
          scale: [1, 1.3, 0.8, 1],
          rotate: [0, 90, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, rgba(168, 85, 247, 0.06) 40%, rgba(59, 130, 246, 0.03) 70%, transparent 100%)',
          filter: 'blur(45px)',
          top: '50%', 
          right: '10%'
        }}
        animate={{
          x: [0, -200, 150, 0],
          y: [0, 180, -80, 0],
          scale: [1.2, 0.7, 1.4, 1.2],
          rotate: [360, 270, 180, 0],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div 
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.05) 40%, rgba(168, 85, 247, 0.02) 70%, transparent 100%)',
          filter: 'blur(40px)',
          bottom: '20%', 
          left: '30%'
        }}
        animate={{
          x: [0, 120, -180, 0],
          y: [0, -120, 80, 0],
          scale: [0.9, 1.5, 0.6, 0.9],
        }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Animated Grid Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, white 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, white 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 40px 40px',
        }}
        animate={{
          backgroundPosition: ['0px 0px, 0px 0px', '60px 60px, 40px 40px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        />
      ))}
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

            {/* Enhanced Search Form */}
            <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-6">
              <motion.div 
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div
                  whileFocus={{ scale: 1.02 }}
                  className="relative"
                >
                  {/* Input Field with Animated Border */}
                  <div className="relative">
                    <Input
                      {...searchForm.register("orderId")}
                      placeholder="Sipariş ID (örn: 458465)"
                      className="w-full h-16 px-8 text-lg bg-black/40 border-2 border-white/20 rounded-3xl backdrop-blur-md text-white placeholder-white/60 focus:border-transparent focus:ring-0 transition-all duration-500 shadow-2xl"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(20,20,40,0.6) 100%)'
                      }}
                    />
                    
                    {/* Animated Border Gradient */}
                    <motion.div 
                      className="absolute inset-0 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #10b981)',
                        padding: '2px',
                        borderRadius: '1.5rem'
                      }}
                      animate={{
                        background: [
                          'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899, #10b981)',
                          'linear-gradient(225deg, #8b5cf6, #ec4899, #10b981, #3b82f6)',
                          'linear-gradient(315deg, #ec4899, #10b981, #3b82f6, #8b5cf6)',
                          'linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6, #ec4899)'
                        ]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                    
                    {/* Search Icon */}
                    <motion.div 
                      className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white/60 group-focus-within:text-white transition-colors duration-300"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Search className="w-6 h-6" />
                    </motion.div>
                  </div>

                  {/* Floating Particles Around Input */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-blue-400/60 rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${Math.random() > 0.5 ? -10 : 110}%`,
                      }}
                      animate={{
                        y: [0, -20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </motion.div>

                {/* Form Error Display */}
                {searchForm.formState.errors.orderId && (
                  <motion.p 
                    className="text-red-400 text-sm mt-2 ml-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {searchForm.formState.errors.orderId.message}
                  </motion.p>
                )}
              </motion.div>
              
              {/* Enhanced Submit Button */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Button 
                  type="submit" 
                  disabled={isSearching}
                  className="relative w-full h-16 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-3xl shadow-2xl transition-all duration-500 disabled:opacity-50 overflow-hidden group"
                >
                  {/* Button Background Animation */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        'linear-gradient(45deg, #ec4899, #3b82f6, #8b5cf6)',
                        'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                        'linear-gradient(225deg, #8b5cf6, #ec4899, #3b82f6)',
                        'linear-gradient(315deg, #ec4899, #3b82f6, #8b5cf6)'
                      ]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  {/* Button Content */}
                  <div className="relative z-10">
                    {isSearching ? (
                      <motion.div 
                        className="flex items-center justify-center space-x-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div 
                          className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <span>Aranıyor...</span>
                        <motion.div
                          className="flex space-x-1"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <div className="w-1 h-1 bg-white rounded-full" />
                          <div className="w-1 h-1 bg-white rounded-full" />
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        className="flex items-center justify-center space-x-3"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div
                          animate={{ 
                            rotateY: [0, 360],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Search className="w-7 h-7" />
                        </motion.div>
                        <span>Sipariş Sorgula</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
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
                <Card className="relative bg-black/40 border border-white/20 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden group">
                  {/* Enhanced Background Effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-purple-500/6 to-pink-500/8" />
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-tr from-emerald-500/4 via-transparent to-cyan-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  {/* Animated Border Effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-3xl opacity-50"
                    style={{
                      background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                    }}
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                  
                  <CardHeader className="relative z-10 pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <motion.div 
                          className="relative w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-shadow duration-500"
                          animate={{ 
                            scale: [1, 1.05, 1],
                            rotate: [0, 2, -2, 0]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          {/* Icon Background Glow */}
                          <motion.div 
                            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            animate={{
                              scale: [1, 1.2, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          />
                          <Package className="w-10 h-10 text-white relative z-10" />
                          
                          {/* Floating Sparkles */}
                          {[...Array(3)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="absolute w-1 h-1 bg-white rounded-full"
                              style={{
                                top: `${20 + i * 20}%`,
                                right: `${10 + i * 15}%`,
                              }}
                              animate={{
                                scale: [0, 1, 0],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.7,
                              }}
                            />
                          ))}
                        </motion.div>
                        
                        <div className="space-y-3">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <CardTitle className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                              Sipariş #{searchedOrder.orderId}
                            </CardTitle>
                          </motion.div>
                          
                          <motion.div 
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {getStatusBadge(searchedOrder.status)}
                            {isAutoRefreshing && (
                              <motion.div 
                                className="flex items-center text-blue-300 text-sm bg-blue-500/10 px-3 py-1 rounded-full border border-blue-400/30"
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                <span>Otomatik güncelleniyor</span>
                                <motion.div 
                                  className="ml-2 w-2 h-2 bg-blue-400 rounded-full"
                                  animate={{ scale: [1, 1.5, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                />
                              </motion.div>
                            )}
                          </motion.div>
                        </div>
                      </div>
                      
                      {/* Enhanced Refresh Button */}
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                          disabled={isSearching}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50 group/btn"
                        >
                          <motion.div
                            animate={{ rotate: isSearching ? 360 : 0 }}
                            transition={{ duration: 1, repeat: isSearching ? Infinity : 0, ease: "linear" }}
                          >
                            <RefreshCw className="w-5 h-5 mr-2" />
                          </motion.div>
                          <span>Yenile</span>
                          
                          {/* Button Sparkle Effect */}
                          <motion.div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/0 via-emerald-300/20 to-emerald-400/0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        </Button>
                      </motion.div>
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