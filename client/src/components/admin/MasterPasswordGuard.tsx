import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MasterPasswordGuardProps {
  children: React.ReactNode;
  requireMasterPassword?: boolean;
}

export default function MasterPasswordGuard({ 
  children, 
  requireMasterPassword = true 
}: MasterPasswordGuardProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (requireMasterPassword) {
      // ULTRA SECURITY: Always check with server for master password verification
      // No periodic checks needed - every page access requires master password
      checkServerMasterPasswordStatus();
    } else {
      setIsVerified(true);
    }
  }, [requireMasterPassword]);

  const checkServerMasterPasswordStatus = async () => {
    try {
      // Make a test request to any admin endpoint to check master password status
      const response = await fetch('/api/admin/me', {
        credentials: 'include'
      });
      
      if (response.status === 401) {
        const errorData = await response.json();
        // Check if error is specifically about master password
        if (errorData.message?.includes('Master şifre') || errorData.message?.includes('master')) {
          setIsModalOpen(true);
          setIsVerified(false);
        } else {
          // Other auth errors, redirect to login
          window.location.href = '/admin/login';
        }
      } else if (response.ok) {
        setIsVerified(true);
      }
    } catch (error) {
      console.error('Error checking master password status:', error);
      setIsModalOpen(true);
      setIsVerified(false);
    }
  };

  const handleVerifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Hata",
        description: "Master şifre gerekli",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/verify-master-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ masterPassword: password }),
      });

      if (response.ok) {
        setIsVerified(true);
        setIsModalOpen(false);
        setPassword("");
        
        // ULTRA SECURITY: One-time verification for this specific page access only
        // No persistent verification - each new page will require master password again
        
        toast({
          title: "Başarılı",
          description: "Master şifre doğrulandı",
          variant: "default",
        });
      } else {
        toast({
          title: "Hata",
          description: "Hatalı master şifre",
          variant: "destructive",
        });
        setPassword("");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Doğrulama sırasında hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleVerifyPassword();
    }
  };

  if (!requireMasterPassword || isVerified) {
    return <>{children}</>;
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Master Şifre Gerekli
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Bu sayfaya erişmek için master şifrenizi girin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Master şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                disabled={isLoading}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <Button
              onClick={handleVerifyPassword}
              disabled={isLoading || !password.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Doğrulanıyor...</span>
                </div>
              ) : (
                "Doğrula"
              )}
            </Button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Maksimum güvenlik: Her admin panel erişiminde doğrulama gerekir
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Blurred content while waiting for verification */}
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
    </>
  );
}