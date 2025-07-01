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
  ArrowLeft,
  Activity,
  ChevronRight,
  Calendar,
  Globe,
  User,
  Hash,
  AlertCircle
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
      setOrderNotFound(false);
      setLastUpdated(new Date());
      setIsSearching(false);
      
      // Start auto-refresh if order is not completed
      if (data.status !== 'completed' && data.status !== 'failed' && data.status !== 'cancelled') {
        setIsAutoRefreshing(true);
      }
    },
    onError: (error: Error) => {
      setIsSearching(false);
      setSearchedOrder(null);
      setOrderNotFound(true);
      setIsAutoRefreshing(false);
      toast({
        title: "Sipariş Bulunamadı",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSearch = (data: SearchData) => {
    searchOrderMutation.mutate(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
      case 'in_progress':
        return <Activity className="w-5 h-5 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'processing':
        return 'İşleniyor';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Başarısız';
      case 'cancelled':
        return 'İptal Edildi';
      case 'partial':
        return 'Kısmi';
      default:
        return 'Bilinmiyor';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'processing':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Minimal Header */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
        >
          <div className="max-w-4xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-900 dark:bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white dark:text-gray-900" />
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Sipariş Takip</span>
              </div>
              <div className="flex items-center space-x-2 md:space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                  className="text-gray-600 dark:text-gray-400"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Geri
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {/* Search Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                  Sipariş Durumu Sorgula
                </CardTitle>
                <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
                  Sipariş numaranızı girerek güncel durumu görüntüleyin
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      {...searchForm.register("orderId")}
                      placeholder="Sipariş ID (örn: 458485)"
                      className="pl-12 h-12 text-lg border-gray-300 dark:border-gray-600 focus:border-gray-900 dark:focus:border-gray-100"
                      disabled={isSearching}
                    />
                  </div>
                  
                  {searchForm.formState.errors.orderId && (
                    <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{searchForm.formState.errors.orderId.message}</span>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    disabled={isSearching}
                    className="w-full h-12 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Aranıyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Search className="w-5 h-5" />
                        <span>Sorgula</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Order Details */}
          <AnimatePresence>
            {searchedOrder && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Sipariş Detayları
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(searchedOrder.status)}
                        <Badge className={`${getStatusColor(searchedOrder.status)} font-medium`}>
                          {getStatusText(searchedOrder.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Hash className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Sipariş ID</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{searchedOrder.orderId}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Package className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Servis</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{searchedOrder.service.name}</p>
                            <p className="text-xs text-gray-400">{searchedOrder.service.platform}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Activity className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Miktar</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{searchedOrder.quantity.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Oluşturulma</p>
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {new Date(searchedOrder.createdAt).toLocaleDateString('tr-TR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Target URL */}
                    {searchedOrder.targetUrl && (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Hedef URL</p>
                          <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                            {searchedOrder.targetUrl}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Refresh Button */}
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => searchOrderMutation.mutate({ orderId: searchedOrder.orderId })}
                        disabled={isSearching}
                        className="flex items-center space-x-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} />
                        <span>Durumu Yenile</span>
                      </Button>
                    </div>

                    {/* Last Updated */}
                    {lastUpdated && (
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Son güncellenme: {lastUpdated.toLocaleTimeString('tr-TR')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Not Found Message */}
            {orderNotFound && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      Sipariş Bulunamadı
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Aradığınız sipariş ID'si sistemde bulunmuyor. Lütfen doğru ID'yi girdiğinizden emin olun.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setOrderNotFound(false);
                        searchForm.reset();
                      }}
                    >
                      Tekrar Dene
                    </Button>
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