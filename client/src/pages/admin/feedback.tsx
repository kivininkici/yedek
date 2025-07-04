import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Clock, User, Hash, Frown, Meh, Smile, Reply, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import ModernAdminLayout from "@/components/admin/ModernAdminLayout";

interface UserFeedback {
  id: number;
  userEmail?: string;
  userName?: string;
  orderId?: string;
  message: string;
  satisfactionLevel?: string;
  ipAddress?: string;
  isRead: boolean;
  adminResponse?: string;
  createdAt: string;
  respondedAt?: string;
}

export default function AdminFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<UserFeedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const queryClient = useQueryClient();

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["/api/admin/feedback"],
    queryFn: async () => {
      const response = await fetch("/api/admin/feedback");
      if (!response.ok) throw new Error("Failed to fetch feedback");
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/feedback/${id}/read`, {
        method: "PUT",
      });
      if (!response.ok) throw new Error("Failed to mark as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: number; response: string }) => {
      const res = await fetch(`/api/admin/feedback/${id}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (!res.ok) throw new Error("Failed to respond");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      setSelectedFeedback(null);
      setResponseText("");
    },
  });

  const getSatisfactionIcon = (level?: string) => {
    switch (level) {
      case "dissatisfied":
        return <Frown className="w-4 h-4 text-red-400" />;
      case "neutral":
        return <Meh className="w-4 h-4 text-yellow-400" />;
      case "satisfied":
        return <Smile className="w-4 h-4 text-green-400" />;
      default:
        return null;
    }
  };

  const getSatisfactionText = (level?: string) => {
    switch (level) {
      case "dissatisfied":
        return "Memnun Değil";
      case "neutral":
        return "Normal";
      case "satisfied":
        return "Memnun";
      default:
        return "Belirtilmemiş";
    }
  };

  const unreadCount = feedback.filter((f: UserFeedback) => !f.isRead).length;
  const totalCount = feedback.length;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-32 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <ModernAdminLayout title="Geri Dönüşler">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geri Dönüşler</h1>
          <p className="text-gray-600 mt-2">
            Kullanıcı geri bildirimlerini görüntüleyin ve yanıtlayın
          </p>
        </div>
        <div className="flex space-x-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Toplam</p>
                <p className="text-xl font-bold text-gray-900">{totalCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <Badge variant="destructive" className="w-3 h-3 p-0 rounded-full" />
              <div>
                <p className="text-sm text-gray-600">Okunmamış</p>
                <p className="text-xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Feedback List */}
      <div className="grid grid-cols-1 gap-4">
        {feedback.length === 0 ? (
          <Card className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Henüz geri bildirim yok
            </h3>
            <p className="text-gray-600">
              Kullanıcılar geri bildirim gönderdiğinde burada görünecek.
            </p>
          </Card>
        ) : (
          feedback.map((item: UserFeedback) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer ${
                !item.isRead ? "border-l-4 border-l-blue-500 bg-blue-50/50" : "border-gray-200"
              }`}
              onClick={() => {
                setSelectedFeedback(item);
                if (!item.isRead) {
                  markAsReadMutation.mutate(item.id);
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">
                        {item.userName || "Anonim Kullanıcı"}
                      </span>
                    </div>
                    {item.userEmail && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{item.userEmail}</span>
                      </div>
                    )}
                    {item.orderId && (
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{item.orderId}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-800 mb-3 line-clamp-3">{item.message}</p>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {new Date(item.createdAt).toLocaleString("tr-TR")}
                      </span>
                    </div>
                    {item.satisfactionLevel && (
                      <div className="flex items-center space-x-2">
                        {getSatisfactionIcon(item.satisfactionLevel)}
                        <span className="text-gray-600">
                          {getSatisfactionText(item.satisfactionLevel)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {!item.isRead && (
                    <Badge variant="destructive" className="text-xs">
                      Yeni
                    </Badge>
                  )}
                  {item.adminResponse && (
                    <Badge variant="secondary" className="text-xs">
                      <Reply className="w-3 h-3 mr-1" />
                      Yanıtlandı
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Geri Bildirim Detayı
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{selectedFeedback.userName || "Anonim"}</span>
                  {selectedFeedback.userEmail && <span>{selectedFeedback.userEmail}</span>}
                  {selectedFeedback.orderId && <span>#{selectedFeedback.orderId}</span>}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">Kullanıcı Mesajı</span>
                  {selectedFeedback.satisfactionLevel && (
                    <div className="flex items-center space-x-2">
                      {getSatisfactionIcon(selectedFeedback.satisfactionLevel)}
                      <span className="text-sm text-gray-600">
                        {getSatisfactionText(selectedFeedback.satisfactionLevel)}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-gray-800">{selectedFeedback.message}</p>
                <div className="mt-3 text-xs text-gray-500">
                  {new Date(selectedFeedback.createdAt).toLocaleString("tr-TR")}
                </div>
              </div>

              {selectedFeedback.adminResponse && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Reply className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Admin Yanıtı</span>
                  </div>
                  <p className="text-gray-800">{selectedFeedback.adminResponse}</p>
                  <div className="mt-3 text-xs text-gray-500">
                    {selectedFeedback.respondedAt && 
                      new Date(selectedFeedback.respondedAt).toLocaleString("tr-TR")
                    }
                  </div>
                </div>
              )}

              {!selectedFeedback.adminResponse && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yanıt Yazın
                    </label>
                    <textarea
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Kullanıcıya yanıtınızı yazın..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => {
                        if (responseText.trim()) {
                          respondMutation.mutate({
                            id: selectedFeedback.id,
                            response: responseText,
                          });
                        }
                      }}
                      disabled={!responseText.trim() || respondMutation.isPending}
                      className="flex-1"
                    >
                      {respondMutation.isPending ? (
                        "Gönderiliyor..."
                      ) : (
                        <>
                          <Reply className="w-4 h-4 mr-2" />
                          Yanıt Gönder
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFeedback(null)}
                    >
                      İptal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </ModernAdminLayout>
  );
}