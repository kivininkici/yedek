import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { 
  Users, 
  Crown, 
  DollarSign, 
  Key, 
  Plus, 
  ArrowLeft, 
  Settings, 
  BarChart3, 
  Copy, 
  Trash2, 
  UserCheck, 
  UserX, 
  RefreshCw,
  Download,
  Search,
  ShieldCheck,
  ShieldX,
  Calendar,
  Activity
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { format } from "date-fns";

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  totalKeys: number;
  usedKeys: number;
  activeKeys: number;
  dailyChecks: number;
  monthlyRevenue: number;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  checksToday: number;
  premiumUntil?: string;
  createdAt: string;
  lastCheckDate?: string;
}

interface PremiumKey {
  id: number;
  keyString: string;
  duration: number;
  isUsed: boolean;
  createdAt: string;
  usedAt?: string;
  usedBy?: string;
}

export default function AdminPanel() {
  const { t } = useLanguage();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [keyDuration, setKeyDuration] = useState("");
  const [keyCount, setKeyCount] = useState("1");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [keySearchTerm, setKeySearchTerm] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState("all");

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      toast({
        title: t('unauthorized'),
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, isLoading, user, toast, t]);

  // Queries
  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: keys = [] } = useQuery<PremiumKey[]>({
    queryKey: ["/api/admin/keys"],
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Mutations
  const createKeyMutation = useMutation({
    mutationFn: async ({ duration, count }: { duration: number; count: number }) => {
      const response = await apiRequest("POST", "/api/admin/create-key", { duration, count });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('success'),
        description: count > 1 ? t('keysGenerated') : t('keyCreated'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setKeyDuration("");
      setKeyCount("1");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: t('unauthorized'),
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, role, premiumDays }: { userId: string; role: string; premiumDays?: number }) => {
      const response = await apiRequest("POST", "/api/admin/update-user", { userId, role, premiumDays });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('userUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: async (keyId: number) => {
      const response = await apiRequest("DELETE", `/api/admin/keys/${keyId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('keyDeleted'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetChecksMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/reset-checks");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('checksReset'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: (error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateKey = () => {
    const duration = parseInt(keyDuration);
    const count = parseInt(keyCount);
    
    if (!duration || duration < 1) {
      toast({
        title: t('error'),
        description: t('invalidDuration'),
        variant: "destructive",
      });
      return;
    }

    if (!count || count < 1 || count > 100) {
      toast({
        title: t('error'),
        description: t('invalidKeyCount'),
        variant: "destructive",
      });
      return;
    }

    createKeyMutation.mutate({ duration, count });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: t('success'),
      description: t('keyCopied'),
    });
  };

  const handleUserRoleChange = (userId: string, newRole: string) => {
    const premiumDays = newRole === "premium" ? 30 : undefined;
    updateUserMutation.mutate({ userId, role: newRole, premiumDays });
  };

  const handleExportKeys = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Key,Duration,Status,Created,Used,Used By\n" +
      keys.map(key => 
        `${key.keyString},${key.duration} days,${key.isUsed ? 'Used' : 'Unused'},${format(new Date(key.createdAt), 'yyyy-MM-dd')},${key.usedAt ? format(new Date(key.usedAt), 'yyyy-MM-dd') : ''},${key.usedBy || ''}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "premium_keys.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = selectedUserRole === "all" || user.role === selectedUserRole;
    return matchesSearch && matchesRole;
  });

  const filteredKeys = keys.filter(key => 
    key.keyString.toLowerCase().includes(keySearchTerm.toLowerCase()) ||
    (key.usedBy && key.usedBy.toLowerCase().includes(keySearchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => window.history.back()}
              variant="ghost"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('goBack')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('admin.title')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Comprehensive system management and analytics
              </p>
            </div>
          </div>
          <Button onClick={() => queryClient.invalidateQueries()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('refresh')}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('totalUsers')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalUsers || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('premiumUsers')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.premiumUsers || 0}
                  </p>
                </div>
                <Crown className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('totalKeys')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.totalKeys || 0}
                  </p>
                </div>
                <Key className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('dailyChecks')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.dailyChecks || 0}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">{t('userManagement')}</TabsTrigger>
            <TabsTrigger value="keys">{t('keyManagement')}</TabsTrigger>
            <TabsTrigger value="settings">{t('systemSettings')}</TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>{t('allUsers')}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder={t('searchUsers')}
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedUserRole} onValueChange={setSelectedUserRole}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>{t('role')}</TableHead>
                      <TableHead>{t('checksToday')}</TableHead>
                      <TableHead>{t('joinDate')}</TableHead>
                      <TableHead>{t('premiumUntil')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {user.firstName || user.lastName ? 
                                `${user.firstName || ''} ${user.lastName || ''}`.trim() : 
                                'No Name'
                              }
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              user.role === 'admin' ? 'destructive' : 
                              user.role === 'premium' ? 'default' : 
                              'secondary'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.checksToday}</TableCell>
                        <TableCell>{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {user.premiumUntil ? 
                            format(new Date(user.premiumUntil), 'MMM dd, yyyy') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select 
                              value={user.role} 
                              onValueChange={(newRole) => handleUserRoleChange(user.id, newRole)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="free">Free</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Key Management Tab */}
          <TabsContent value="keys" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create Keys Card */}
              <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>{t('generateKeys')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="duration">{t('keyDuration')}</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={keyDuration}
                      onChange={(e) => setKeyDuration(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="count">{t('keyCount')}</Label>
                    <Input
                      id="count"
                      type="number"
                      placeholder="1"
                      min="1"
                      max="100"
                      value={keyCount}
                      onChange={(e) => setKeyCount(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleCreateKey} 
                    disabled={createKeyMutation.isPending}
                    className="w-full"
                  >
                    {createKeyMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {parseInt(keyCount) > 1 ? t('bulkGenerate') : t('generateKey')}
                  </Button>
                </CardContent>
              </Card>

              {/* Key Stats Cards */}
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('usedKeys')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.usedKeys || 0}
                      </p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {t('activeKeys')}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stats?.activeKeys || 0}
                      </p>
                    </div>
                    <ShieldX className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Keys Table */}
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Key className="w-5 h-5" />
                    <span>{t('allKeys')}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        placeholder="Search keys..."
                        value={keySearchTerm}
                        onChange={(e) => setKeySearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Button onClick={handleExportKeys} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      {t('exportKeys')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('keyString')}</TableHead>
                      <TableHead>{t('duration')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('createdDate')}</TableHead>
                      <TableHead>{t('usedBy')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                              {key.keyString.slice(0, 8)}...
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyKey(key.keyString)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{key.duration} {t('days')}</TableCell>
                        <TableCell>
                          <Badge variant={key.isUsed ? 'secondary' : 'default'}>
                            {key.isUsed ? t('used') : t('unused')}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(key.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{key.usedBy || '-'}</TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Key</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this premium key? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteKeyMutation.mutate(key.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>{t('systemSettings')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Reset Daily Checks</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Reset daily check counters for all users
                    </p>
                  </div>
                  <Button 
                    onClick={() => resetChecksMutation.mutate()}
                    disabled={resetChecksMutation.isPending}
                    variant="outline"
                  >
                    {resetChecksMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Reset Checks
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">System Statistics</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View comprehensive system analytics
                    </p>
                  </div>
                  <Button variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}