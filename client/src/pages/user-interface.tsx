import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  Sparkles,
  Zap,
  Target,
  Home,
  User,
  LogOut,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";

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
  value: string;
  service: {
    id: number;
    name: string;
    category: string;
    price: number;
  };
  remainingQuantity: number;
  category: string;
}

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900" />
      
      {/* Floating Orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "10%", left: "10%" }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-purple-500/8 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 40, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "60%", right: "10%" }}
      />
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-blue-400/40 rounded-full"
          animate={{
            y: [0, -20, 0],
            opacity: [0.4, 1, 0.4],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
          style={{
            top: `${20 + i * 10}%`,
            left: `${10 + i * 12}%`,
          }}
        />
      ))}
    </div>
  );
};

// Header Component
const UserHeader = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Key className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">OtoKiwi</h1>
                <p className="text-blue-200 text-sm">Key Kullanım Paneli</p>
              </div>
            </motion.div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-3 bg-white/10 rounded-xl px-4 py-2"
              >
                {user?.avatarId ? (
                  <Avatar avatarId={user.avatarId} size="sm" className="border-white/20" />
                ) : (
                  <User className="w-4 h-4 text-blue-300" />
                )}
                <span className="text-white text-sm font-medium">{user?.username}</span>
              </motion.div>
            )}
            
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </motion.div>
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Step Indicator Component
const StepIndicator = ({ currentStep, steps }: { currentStep: string; steps: Array<{key: string, label: string, icon: any}> }) => {
  const currentIndex = steps.findIndex(step => step.key === currentStep);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center space-x-4 mb-8"
    >
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index < currentIndex;
        const Icon = step.icon;
        
        return (
          <div key={step.key} className="flex items-center">
            <motion.div
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white/10 text-gray-400'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCompleted ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Icon className="w-6 h-6" />
              )}
            </motion.div>
            
            <div className="ml-3 hidden md:block">
              <p className={`text-sm font-medium ${
                isActive ? 'text-white' : isCompleted ? 'text-green-400' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-4 transition-all duration-300 ${
                isCompleted ? 'bg-green-500' : 'bg-white/20'
              }`} />
            )}
          </div>
        );
      })}
    </motion.div>
  );
};

export default function UserInterface() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<string>('key-validation');
  const [validatedKey, setValidatedKey] = useState<ValidatedKey | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const steps = [
    { key: 'key-validation', label: 'Key Doğrulama', icon: Key },
    { key: 'order-form', label: 'Sipariş Formu', icon: ShoppingCart },
    { key: 'order-tracking', label: 'Sipariş Takibi', icon: Activity }
  ];

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
    onError: (error: Error) => {
      toast({
        title: "Sipariş Hatası",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCurrentStep('key-validation');
    setValidatedKey(null);
    setOrderId('');
    setProgress(0);
    keyForm.reset();
    orderForm.reset();
  };

  // Login required check
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AnimatedBackground />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md bg-slate-800/95 backdrop-blur-sm border border-slate-700 shadow-xl rounded-2xl">
            <CardHeader className="text-center pt-8 pb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="w-8 h-8 text-white" />
              </div>
              
              <CardTitle className="text-2xl font-bold text-white mb-3">
                Giriş Gerekli
              </CardTitle>
              
              <p className="text-slate-400 text-sm">
                Key kullanım paneline erişmek için giriş yapmanız gerekiyor
              </p>
            </CardHeader>
            
            <CardContent className="px-6 pb-6 space-y-3">
              <Link href="/auth">
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl">
                  <User className="w-5 h-5 mr-2" />
                  Giriş Yap / Kayıt Ol
                </Button>
              </Link>
              
              <Link href="/">
                <Button 
                  variant="outline" 
                  className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white font-medium py-3 rounded-xl"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AnimatedBackground />
      <UserHeader />
      
      <div className="container mx-auto px-6 py-8">
        <StepIndicator currentStep={currentStep} steps={steps} />
        
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 'key-validation' && (
              <motion.div
                key="key-validation"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <Key className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">Key Doğrulama</CardTitle>
                    <p className="text-blue-200">Kullanmak istediğiniz key'i doğrulayın</p>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={keyForm.handleSubmit((data) => validateKeyMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-blue-200">Key Değeri</label>
                        <div className="relative">
                          <Input
                            {...keyForm.register('keyValue')}
                            placeholder="Key değerinizi giriniz..."
                            className="bg-white/10 border-white/20 text-white placeholder-blue-300 h-12 pl-12"
                          />
                          <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                        </div>
                        {keyForm.formState.errors.keyValue && (
                          <p className="text-red-400 text-sm">{keyForm.formState.errors.keyValue.message}</p>
                        )}
                      </div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="submit"
                          disabled={validateKeyMutation.isPending}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12"
                        >
                          {validateKeyMutation.isPending ? (
                            <>
                              <motion.div
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Doğrulanıyor...
                            </>
                          ) : (
                            <>
                              <Search className="w-5 h-5 mr-2" />
                              Key Doğrula
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 'order-form' && validatedKey && (
              <motion.div
                key="order-form"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Key Info Card */}
                <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-xl border border-green-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <motion.div
                        className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                      >
                        <CheckCircle className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">Key Doğrulandı</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-green-200">Servis</p>
                            <p className="font-medium text-white">{validatedKey.service.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-green-200">Kategori</p>
                            <Badge variant="secondary" className="bg-blue-500/20 text-[#101930]">
                              {validatedKey.category}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-green-200">Kalan Miktar</p>
                            <p className="font-medium text-white">{validatedKey.remainingQuantity}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Form Card */}
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      whileHover={{ scale: 1.1, rotate: -5 }}
                    >
                      <ShoppingCart className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">Sipariş Oluştur</CardTitle>
                    <p className="text-blue-200">Sipariş detaylarını doldurun</p>
                  </CardHeader>
                  
                  <CardContent>
                    <form onSubmit={orderForm.handleSubmit((data) => createOrderMutation.mutate(data))} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-blue-200">Miktar</label>
                          <Input
                            {...orderForm.register('quantity', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            max={validatedKey.remainingQuantity}
                            placeholder="1"
                            className="bg-white/10 border-white/20 text-white placeholder-blue-300 h-12"
                          />
                          {orderForm.formState.errors.quantity && (
                            <p className="text-red-400 text-sm">{orderForm.formState.errors.quantity.message}</p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-blue-200">Hedef URL (Opsiyonel)</label>
                          <Input
                            {...orderForm.register('targetUrl')}
                            placeholder="https://example.com"
                            className="bg-white/10 border-white/20 text-white placeholder-blue-300 h-12"
                          />
                          {orderForm.formState.errors.targetUrl && (
                            <p className="text-red-400 text-sm">{orderForm.formState.errors.targetUrl.message}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={resetForm}
                            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-12"
                          >
                            Yeni Key
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button
                            type="submit"
                            disabled={createOrderMutation.isPending}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12"
                          >
                            {createOrderMutation.isPending ? (
                              <>
                                <motion.div
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Oluşturuluyor...
                              </>
                            ) : (
                              <>
                                <Package className="w-5 h-5 mr-2" />
                                Sipariş Oluştur
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {currentStep === 'order-tracking' && orderId && (
              <motion.div
                key="order-tracking"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <CardHeader className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      animate={{
                        boxShadow: [
                          "0 0 30px rgba(34, 197, 94, 0.3)",
                          "0 0 40px rgba(20, 184, 166, 0.4)",
                          "0 0 30px rgba(34, 197, 94, 0.3)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="w-8 h-8 text-white" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold text-white">Sipariş Başarıyla Oluşturuldu!</CardTitle>
                    <p className="text-green-200">Siparişiniz başarıyla işleme alındı</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-200">Sipariş Numarası</p>
                          <p className="text-2xl font-bold text-white font-mono">{orderId}</p>
                        </div>
                        <motion.div
                          className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center"
                          whileHover={{ scale: 1.1 }}
                        >
                          <CheckCircle className="w-6 h-6 text-white" />
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => window.open(`/order-search?orderId=${orderId}`, '_blank')}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white h-12"
                        >
                          <ExternalLink className="w-5 h-5 mr-2" />
                          Sipariş Takibi
                        </Button>
                      </motion.div>
                      
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={resetForm}
                          variant="outline"
                          className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 h-12"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Yeni Sipariş
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}