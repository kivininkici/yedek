import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import SimpleAdminLayout from "@/components/admin/SimpleAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Download,
  Trash2,
  Settings,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ApiManagement() {
  const { toast } = useToast();
  const { admin, isLoading } = useAdminAuth();
  const queryClient = useQueryClient();
  const [apiName, setApiName] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // API ekleme mutation'ı - optimize edilmiş
  const addApiMutation = useMutation({
    mutationFn: async ({ name, apiUrl, apiKey }: { name: string; apiUrl: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/api-settings", { name, apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `API başarıyla eklendi`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-settings"] });
      setIsDialogOpen(false);
      setApiName("");
      setApiUrl("");
      setApiKey("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Servis fetch ve import mutation'ı
  const autoFetchServicesMutation = useMutation({
    mutationFn: async ({ apiUrl, apiKey }: { apiUrl: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/admin/fetch-and-import-services", { apiUrl, apiKey });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: `${data.imported || 0} servis otomatik içe aktarıldı`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // API silme mutation'ı
  const deleteApiMutation = useMutation({
    mutationFn: async (apiId: number) => {
      const response = await fetch(`/api/admin/api-settings/${apiId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to delete API (${response.status})`);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: data.message || `API silindi ve ${data.deletedServices || 0} servis kaldırıldı`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/api-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services/all"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Data fetch'leri - cache optimized
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/admin/services/all"],
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    retry: false,
  });

  const { data: apiSettings, isLoading: apiSettingsLoading } = useQuery({
    queryKey: ["/api/admin/api-settings"],
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    retry: false,
  });

  // Auth check
  useEffect(() => {
    if (!isLoading && !admin) {
      window.location.href = "/admin/login";
      return;
    }
  }, [admin, isLoading]);

  if (isLoading || !admin) {
    return (
      <SimpleAdminLayout title="API Yönetimi">
        <div className="text-center text-gray-400 mt-8">Yükleniyor...</div>
      </SimpleAdminLayout>
    );
  }

  const servicesList = Array.isArray(services) ? services : [];
  const apiSettingsList = Array.isArray(apiSettings) ? apiSettings : [];

  // Servis pagination logic
  const filteredServices = servicesList.filter((service: any) =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  return (
    <SimpleAdminLayout title="API Yönetimi">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">API Yönetimi</h2>
            <p className="text-gray-400">Harici API'lerden servis içe aktarın ve yönetin</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                API Ekle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Yeni API Ekle</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Harici API'lerden servis içe aktarmak için API bilgilerini girin
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Popüler API'ler - Hızlı Ekle */}
                <div className="border rounded-lg p-4 bg-gray-900 border-gray-700">
                  <Label className="text-sm font-semibold mb-3 block text-gray-300">Popüler API'ler - Hızlı Ekle</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        setApiName("MedyaBayim");
                        setApiUrl("https://medyabayim.com/api/v2");
                      }}
                    >
                      <div>
                        <div className="font-semibold">MedyaBayim</div>
                        <div className="text-xs text-gray-400">medyabayim.com/api/v2</div>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-4 text-left border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        setApiName("ResellerProvider");
                        setApiUrl("https://resellerprovider.ru/api/v2");
                      }}
                    >
                      <div>
                        <div className="font-semibold">ResellerProvider</div>
                        <div className="text-xs text-gray-400">resellerprovider.ru/api/v2</div>
                      </div>
                    </Button>
                  </div>
                </div>

                {/* Manuel API Ekleme */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="apiName" className="text-gray-300">API Adı</Label>
                    <Input
                      id="apiName"
                      value={apiName}
                      onChange={(e) => setApiName(e.target.value)}
                      placeholder="Örn: MedyaBayim"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apiUrl" className="text-gray-300">API URL</Label>
                    <Input
                      id="apiUrl"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="https://api.example.com/v2"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="apiKey" className="text-gray-300">API Anahtarı</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="API anahtarınızı girin"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={() => {
                      if (apiName && apiUrl && apiKey) {
                        addApiMutation.mutate({ name: apiName, apiUrl, apiKey });
                      }
                    }}
                    disabled={!apiName || !apiUrl || !apiKey || addApiMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {addApiMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Ekleniyor...
                      </>
                    ) : (
                      "API Ekle"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Aktif API'ler */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-lg font-semibold text-white">
              Aktif API'ler ({apiSettingsList.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {apiSettingsLoading ? (
              <div className="text-center text-gray-400">Yükleniyor...</div>
            ) : apiSettingsList.length === 0 ? (
              <div className="text-center text-gray-400">Henüz API eklenmemiş</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiSettingsList.map((api: any) => (
                  <Card key={api.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Settings className="w-4 h-4 text-blue-400" />
                          <h4 className="font-semibold text-white">{api.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={api.isActive ? "default" : "secondary"}
                            className={api.isActive
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-700 text-gray-400"
                            }
                          >
                            {api.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                          <Button
                            onClick={() => setDeleteConfirmId(api.id)}
                            disabled={deleteApiMutation.isPending}
                            variant="destructive"
                            size="sm"
                            className="w-8 h-8 p-0 bg-red-600 hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate mb-2">
                        {api.apiUrl}
                      </p>
                      <p className="text-xs text-gray-400 mb-3">
                        Oluşturulma: {new Date(api.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                      <Button
                        onClick={() => autoFetchServicesMutation.mutate({ apiUrl: api.apiUrl, apiKey: api.apiKey })}
                        disabled={autoFetchServicesMutation.isPending}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {autoFetchServicesMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Servisleri Getiriliyor...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Servisleri Getir
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Servisler Listesi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="border-b border-gray-700">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">
                Tüm Servisler ({servicesList.length})
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Servis ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-64 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {servicesLoading ? (
              <div className="text-center text-gray-400">Yükleniyor...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center text-gray-400">
                {searchTerm ? "Arama sonucu bulunamadı" : "Henüz servis eklenmemiş"}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Servis Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedServices.map((service: any) => (
                    <Card key={service.id} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white truncate">{service.name}</h4>
                          <Badge
                            variant={service.isActive ? "default" : "secondary"}
                            className={service.isActive
                              ? "bg-green-900 text-green-300"
                              : "bg-gray-700 text-gray-400"
                            }
                          >
                            {service.isActive ? "Aktif" : "Pasif"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                          Platform: {service.platform}
                        </p>
                        <p className="text-xs text-gray-400 mb-2">
                          Tür: {service.type}
                        </p>
                        {service.price && (
                          <p className="text-xs text-green-400">
                            Fiyat: ₺{parseFloat(service.price).toFixed(2)}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-400">
                      {startIndex + 1}-{Math.min(endIndex, filteredServices.length)} / {filteredServices.length} servis
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <span className="text-sm text-gray-300">
                        Sayfa {currentPage} / {totalPages}
                      </span>
                      
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">API'yi Sil</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bu API'yi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve 
              bu API'ye bağlı tüm servisler de silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setDeleteConfirmId(null)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmId) {
                  deleteApiMutation.mutate(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SimpleAdminLayout>
  );
}