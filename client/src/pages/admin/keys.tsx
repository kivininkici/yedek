import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";
import StatsCard from "@/components/admin/stats-card";
import KeyCreationModal from "@/components/admin/key-creation-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Search, 
  Download, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Key as KeyIcon, 
  Users, 
  CheckCircle, 
  XCircle,
  Filter,
  Settings,
  ArrowUpDown,
  Calendar,
  Globe,
  Cpu,
  Database,
  Clock,
  Check,
  X,
  AlertCircle,
  FileText,
  RefreshCw,
  Home,
  Archive,
  Hash,
  Activity,
  TrendingUp,
  Star
} from "lucide-react";

interface KeyType {
  id: number;
  value: string;
  keyValue?: string; // Backward compatibility
  category: string;
  serviceName: string;
  isUsed: boolean;
  isDeleted: boolean;
  createdAt: string;
  usedAt: string | null;
  deletedAt: string | null;
  orderDetails: {
    id: number;
    quantity: number;
    targetUrl: string;
    notes: string;
    createdAt: string;
  } | null;
}

export default function Keys() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedKeys, setSelectedKeys] = useState(new Set<number>());
  const [showKeyValues, setShowKeyValues] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState(new Set<number>());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const itemsPerPage = 10;

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/admin/login";
    }
  }, [isAuthenticated]);

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ["/api/admin/keys"],
    retry: false,
  });

  const { data: keyStats } = useQuery({
    queryKey: ["/api/admin/keys/stats"],
    retry: false,
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/keys/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Key başarıyla silindi",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/admin/login";
        return;
      }
      toast({
        title: "Hata",
        description: "Key silme sırasında bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    if (isUnauthorizedError(error)) {
      window.location.href = "/admin/login";
      return null;
    }
  }

  const filteredKeys = Array.isArray(keys) && keys.length > 0 ? keys.filter((key: KeyType) => {
    if (!key) return false;
    
    const searchLower = (searchQuery || '').toLowerCase();
    const keyValue = key.value || key.keyValue || '';
    const category = key.category || '';
    const serviceName = key.serviceName || '';
    
    const matchesSearch = keyValue.toLowerCase().includes(searchLower) ||
                         category.toLowerCase().includes(searchLower) ||
                         serviceName.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "used" && key.isUsed) ||
                         (statusFilter === "unused" && !key.isUsed);
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleToggleKey = (id: number) => {
    setSelectedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleToggleKeyVisibility = (id: number) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const maskKey = (keyValue: string) => {
    if (!keyValue || typeof keyValue !== 'string') return '';
    if (keyValue.length <= 8) return keyValue;
    const prefix = keyValue.slice(0, 4);
    const suffix = keyValue.slice(-4);
    const masked = '*'.repeat(keyValue.length - 8);
    return `${prefix}${masked}${suffix}`;
  };

  const handleSelectAll = () => {
    if (selectedKeys.size === paginatedKeys.length) {
      setSelectedKeys(new Set());
    } else {
      const newSet = new Set<number>();
      paginatedKeys.forEach((key: KeyType) => {
        newSet.add(key.id);
      });
      setSelectedKeys(newSet);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedKeys.size === 0) return;
    
    const confirmDelete = confirm(`${selectedKeys.size} adet key'i silmek istediğinize emin misiniz?`);
    if (!confirmDelete) return;

    try {
      await Promise.all(
        Array.from(selectedKeys).map(id => 
          apiRequest("DELETE", `/api/admin/keys/${id}`)
        )
      );
      
      toast({
        title: "Başarılı",
        description: `${selectedKeys.size} adet key başarıyla silindi`,
      });
      
      setSelectedKeys(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys/stats"] });
    } catch (error) {
      toast({
        title: "Hata",
        description: "Seçili key'leri silme sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  const handleToggleAllKeys = () => {
    if (selectedKeys.size === filteredKeys.length) {
      setSelectedKeys(new Set());
    } else {
      const newSet = new Set<number>();
      filteredKeys.forEach((key: KeyType) => {
        newSet.add(key.id);
      });
      setSelectedKeys(newSet);
    }
  };

  const getAvailableCategories = () => {
    if (!Array.isArray(keys)) return [];
    const categories = Array.from(new Set(keys.map((key: KeyType) => key.category).filter(Boolean)));
    return categories.sort();
  };

  const handleExportKeys = async () => {
    if (!selectedCategory) {
      toast({
        title: "Hata",
        description: "Lütfen bir kategori seçin",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/keys/export/${selectedCategory}`);
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedCategory}_keys.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Başarılı",
        description: `${selectedCategory} kategorisindeki key'ler indirildi`,
      });
      
      setShowExportModal(false);
      setSelectedCategory("");
    } catch (error) {
      toast({
        title: "Hata",
        description: "Key'leri export etme sırasında bir hata oluştu",
        variant: "destructive",
      });
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredKeys.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedKeys = filteredKeys.slice(startIndex, endIndex);

  return (
    <ModernAdminLayout title="Key Yönetimi">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-50">Key Yönetimi</h2>
            <p className="text-slate-400">
              Toplam {filteredKeys.length} key • Sayfa {currentPage}/{totalPages}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowExportModal(true)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="font-medium">Toplu Key.txt</span>
            </Button>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-2.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-medium">Yeni Key</span>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Toplam Key"
            value={(keyStats as any)?.total || 0}
            icon={KeyIcon}
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Kullanılan Key"
            value={(keyStats as any)?.used || 0}
            icon={CheckCircle}
            iconColor="text-green-500"
          />
          <StatsCard
            title="Kullanılmayan Key"
            value={(keyStats as any)?.unused || 0}
            icon={Clock}
            iconColor="text-yellow-500"
          />
          <StatsCard
            title="Silinen Key"
            value={(keyStats as any)?.deleted || 0}
            icon={XCircle}
            iconColor="text-red-500"
          />
        </div>

        {/* Filters */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Key, kategori veya servis adı ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-400"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Durum filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Key'ler</SelectItem>
                  <SelectItem value="used">Kullanılan</SelectItem>
                  <SelectItem value="unused">Kullanılmayan</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                onClick={() => {
                  if (visibleKeys.size === paginatedKeys.length) {
                    setVisibleKeys(new Set());
                  } else {
                    const newSet = new Set<number>();
                    paginatedKeys.forEach((key: KeyType) => {
                      newSet.add(key.id);
                    });
                    setVisibleKeys(newSet);
                  }
                }}
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                title={visibleKeys.size === paginatedKeys.length ? "Tüm key'leri gizle" : "Tüm key'leri göster"}
              >
                {visibleKeys.size === paginatedKeys.length ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="ml-2 text-xs">Toplu</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Table */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100">Key Listesi</CardTitle>
              {selectedKeys.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400">
                    {selectedKeys.size} key seçildi
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteSelected}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Seçilenleri Sil
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-300">
                      <Checkbox
                        checked={selectedKeys.size === paginatedKeys.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 text-slate-300">Key</th>
                    <th className="text-left py-3 px-4 text-slate-300">Kategori</th>
                    <th className="text-left py-3 px-4 text-slate-300">Servis</th>
                    <th className="text-left py-3 px-4 text-slate-300">Durum</th>
                    <th className="text-left py-3 px-4 text-slate-300">Oluşturma</th>
                    <th className="text-left py-3 px-4 text-slate-300">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedKeys.map((key: KeyType) => (
                    <tr key={key.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedKeys.has(key.id)}
                          onCheckedChange={() => handleToggleKey(key.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-slate-800 px-2 py-1 rounded text-slate-300">
                            {visibleKeys.has(key.id) ? (key.value || key.keyValue || '') : maskKey(key.value || key.keyValue || '')}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleKeyVisibility(key.id)}
                            className="h-6 w-6 p-0 hover:bg-slate-700"
                            title={visibleKeys.has(key.id) ? "Key'i gizle" : "Key'i göster"}
                          >
                            {visibleKeys.has(key.id) ? (
                              <Eye className="w-3 h-3 text-slate-400" />
                            ) : (
                              <EyeOff className="w-3 h-3 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-slate-300 border-slate-600">
                          {key.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {key.serviceName}
                      </td>
                      <td className="py-3 px-4">
                        {key.isUsed ? (
                          <Badge className="bg-red-600 text-white">Kullanıldı</Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white">Kullanılabilir</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        {new Date(key.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteKeyMutation.mutate(key.id)}
                          disabled={deleteKeyMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-400">
                {startIndex + 1}-{Math.min(endIndex, filteredKeys.length)} / {filteredKeys.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Key Modal */}
        {showCreateModal && (
          <KeyCreationModal
            open={showCreateModal}
            onOpenChange={setShowCreateModal}
          />
        )}

        {/* Export Modal */}
        <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
          <DialogContent className="bg-slate-900 border-slate-700 max-w-md shadow-2xl rounded-2xl">
            <DialogHeader className="text-center pb-4">
              <div className="mx-auto bg-red-500/20 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-red-500" />
              </div>
              <DialogTitle className="text-slate-100 text-2xl font-bold">Toplu Key Export</DialogTitle>
              <p className="text-slate-400 text-sm mt-2">İstediğiniz kategori için tüm key'leri indirin</p>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-slate-300 font-semibold block">
                    📁 Kategori Seçin:
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-100 h-12 rounded-xl hover:bg-slate-700 transition-colors">
                      <SelectValue placeholder="Kategori seçin..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 rounded-xl">
                      {getAvailableCategories().map((category) => (
                        <SelectItem 
                          key={category} 
                          value={category}
                          className="text-slate-100 hover:bg-slate-700 focus:bg-slate-700 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {category}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedCategory && (
                  <div className="bg-gradient-to-r from-slate-800 to-slate-750 border border-slate-600 rounded-xl p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-slate-200 font-medium">
                            {Array.isArray(keys) ? keys.filter((key: KeyType) => key.category === selectedCategory).length : 0} key bulundu
                          </p>
                          <p className="text-slate-400 text-xs">
                            {selectedCategory} kategorisinde
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-500/20 px-3 py-1 rounded-full">
                        <span className="text-green-400 text-xs font-medium">Hazır</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {!selectedCategory && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-amber-400">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Lütfen indirmek istediğiniz kategoriyi seçin
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="bg-slate-800 border-slate-600 text-slate-100 hover:bg-slate-700 rounded-xl px-6 py-2.5 transition-all duration-200"
              >
                İptal
              </Button>
              <Button
                onClick={handleExportKeys}
                disabled={!selectedCategory}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl px-6 py-2.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="font-medium">İndir</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModernAdminLayout>
  );
}