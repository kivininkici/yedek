import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Mail, 
  Eye, 
  Reply, 
  Clock, 
  User, 
  FileText, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings
} from "lucide-react";

interface Complaint {
  id: number;
  userEmail?: string;
  userName?: string;
  orderId: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  ipAddress?: string;
  isRead: boolean;
  adminResponse?: string;
  adminNotes?: string;
  assignedAdmin?: string;
  createdAt: string;
  respondedAt?: string;
  resolvedAt?: string;
}

export default function AdminComplaints() {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusUpdate, setStatusUpdate] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["/api/admin/complaints"],
    queryFn: async () => {
      const response = await fetch("/api/admin/complaints");
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/complaints/${id}/read`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/admin/complaints/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      toast({
        title: "Başarılı",
        description: "Şikayet durumu güncellendi",
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: number; response: string }) => {
      const res = await fetch(`/api/admin/complaints/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error("Failed to respond");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/complaints"] });
      setSelectedComplaint(null);
      setResponseText("");
      toast({
        title: "Yanıt Gönderildi",
        description: "Şikayet yanıtı başarıyla gönderildi ve kullanıcıya e-posta ile bildirildi",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "Acil";
      case "high":
        return "Yüksek";
      case "medium":
        return "Orta";
      case "low":
        return "Düşük";
      default:
        return "Belirsiz";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "open":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "resolved":
        return "Çözüldü";
      case "in_progress":
        return "İşlemde";
      case "open":
        return "Açık";
      case "closed":
        return "Kapalı";
      default:
        return "Belirsiz";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "service_quality":
        return "Servis Kalitesi";
      case "delivery_time":
        return "Teslimat Süresi";
      case "billing":
        return "Faturalandırma";
      case "other":
        return "Diğer";
      default:
        return category;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const unreadCount = complaints.filter((c: Complaint) => !c.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Şikayetler</h1>
              <p className="text-gray-500">Kullanıcı şikayetlerini yönetin ve yanıtlayın</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Toplam Şikayet</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complaints.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Okunmamış</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Complaints List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Şikayet Listesi ({complaints.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complaints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Henüz şikayet bulunmuyor</p>
                  </div>
                ) : (
                  complaints.map((complaint: Complaint) => (
                    <div
                      key={complaint.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        !complaint.isRead
                          ? "bg-blue-50 border-blue-200 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        if (!complaint.isRead) {
                          markAsReadMutation.mutate(complaint.id);
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {getPriorityText(complaint.priority)}
                            </Badge>
                            <Badge className={getStatusColor(complaint.status)}>
                              {getStatusText(complaint.status)}
                            </Badge>
                            {!complaint.isRead && (
                              <Badge variant="secondary">Yeni</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{complaint.userName || complaint.userEmail || "Anonim"}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>Sipariş: {complaint.orderId}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(complaint.createdAt).toLocaleString("tr-TR")}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 line-clamp-2">{complaint.message}</p>
                          <div className="mt-2">
                            <Badge variant="outline">{getCategoryText(complaint.category)}</Badge>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Complaint Detail Dialog */}
          {selectedComplaint && (
            <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span>Şikayet Detayı #{selectedComplaint.id}</span>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Şikayet Mesajı</label>
                      <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                        <p className="whitespace-pre-wrap">{selectedComplaint.message}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Yanıt Gönder</label>
                      <Textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Kullanıcıya yanıtınızı yazın..."
                        rows={4}
                        className="mt-2"
                      />
                      <div className="flex justify-end mt-4 space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedComplaint(null)}
                        >
                          Kapat
                        </Button>
                        <Button
                          onClick={() => {
                            if (responseText.trim()) {
                              respondMutation.mutate({
                                id: selectedComplaint.id,
                                response: responseText.trim(),
                              });
                            }
                          }}
                          disabled={!responseText.trim() || respondMutation.isPending}
                        >
                          {respondMutation.isPending ? "Gönderiliyor..." : "Yanıt Gönder"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}