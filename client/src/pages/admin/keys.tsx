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
              variant="outline"
              className="bg-red-600 hover:bg-red-700 text-white border-red-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Toplu Key.txt
            </Button>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Yeni Key
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
                onClick={() => setShowKeyValues(!showKeyValues)}
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                {showKeyValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                        <code className="text-sm bg-slate-800 px-2 py-1 rounded text-slate-300">
                          {showKeyValues ? (key.value || key.keyValue || '') : maskKey(key.value || key.keyValue || '')}
                        </code>
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
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-slate-100">Toplu Key Export</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Kategori Seçin:
                </label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                    <SelectValue placeholder="Kategori seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                className="bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                İptal
              </Button>
              <Button
                onClick={handleExportKeys}
                disabled={!selectedCategory}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                İndir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ModernAdminLayout>
  );
}