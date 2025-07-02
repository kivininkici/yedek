import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { 
  Shield, 
  Key, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  CheckCircle,
  AlertTriangle,
  Copy,
  RefreshCw
} from "lucide-react";

// Schema for master password update
const masterPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mevcut şifre gerekli"),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı"),
  confirmPassword: z.string().min(1, "Şifre tekrarı gerekli"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type MasterPasswordForm = z.infer<typeof masterPasswordSchema>;

export default function MasterPasswordManagement() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showMasterPassword, setShowMasterPassword] = useState(false);

  // Redirect to admin login if not authenticated
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  // Fetch current master password info
  const { data: masterPasswordInfo, isLoading: infoLoading } = useQuery({
    queryKey: ["/api/admin/master-password-info"],
    enabled: !!admin,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MasterPasswordForm>({
    resolver: zodResolver(masterPasswordSchema),
  });

  // Update master password mutation
  const updateMasterPasswordMutation = useMutation({
    mutationFn: async (data: MasterPasswordForm) => {
      const res = await apiRequest("POST", "/api/admin/update-master-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Master şifre başarıyla güncellendi",
      });
      reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/master-password-info"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Hata",
        description: error.message || "Master şifre güncellenemedi",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MasterPasswordForm) => {
    updateMasterPasswordMutation.mutate(data);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopyalandı",
        description: "Master şifre panoya kopyalandı",
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Kopyalama başarısız",
        variant: "destructive",
      });
    }
  };

  if (!admin) return null;

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-950 via-blue-950/20 to-purple-950/20">
      <Sidebar />
      <main className="flex-1 md:ml-0 ml-0">
        <Header 
          title="🔐 Master Şifre Yönetimi" 
          description="Admin panel erişim şifresini yönetin" 
        />
        
        <div className="p-6 space-y-6">
          {/* Current Master Password Info */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Shield className="w-5 h-5 text-blue-400" />
                Mevcut Master Şifre
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {infoLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </Badge>
                    <span className="text-sm text-slate-400">
                      Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <Key className="w-4 h-4 text-slate-400" />
                    <div className="flex-1">
                      <Input
                        type={showMasterPassword ? "text" : "password"}
                        value={(masterPasswordInfo as any)?.currentPassword || ""}
                        readOnly
                        className="bg-transparent border-none text-white font-mono text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMasterPassword(!showMasterPassword)}
                      className="text-slate-400 hover:text-blue-400"
                    >
                      {showMasterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard((masterPasswordInfo as any)?.currentPassword || "")}
                      className="text-slate-400 hover:text-green-400"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-200">
                      <strong>Güvenlik Uyarısı:</strong> Master şifreyi değiştirmek için mevcut şifreyi doğru girmeniz gerekir.
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Master Password Form */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <Lock className="w-5 h-5 text-blue-400" />
                Master Şifre Değiştir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Current Password */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-300">
                    Mevcut Master Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      {...register("currentPassword")}
                      className="pr-10 bg-slate-900/50 border-slate-600/50 text-white"
                      placeholder="Mevcut master şifreyi girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-sm text-red-400">{errors.currentPassword.message}</p>
                  )}
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-300">
                    Yeni Master Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...register("newPassword")}
                      className="pr-10 bg-slate-900/50 border-slate-600/50 text-white"
                      placeholder="Yeni master şifreyi girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-400">{errors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-slate-300">
                    Yeni Şifre Tekrarı
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      className="pr-10 bg-slate-900/50 border-slate-600/50 text-white"
                      placeholder="Yeni şifreyi tekrar girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-400"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={updateMasterPasswordMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  {updateMasterPasswordMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Güncelleniyor...
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Master Şifreyi Güncelle
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}