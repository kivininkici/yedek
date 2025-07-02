import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import UserInterface from "@/pages/user-interface-new";
import AdminLogin from "@/pages/admin-login";
import Dashboard from "@/pages/admin/dashboard";
import Keys from "@/pages/admin/keys";
import Services from "@/pages/admin/services";
import Users from "@/pages/admin/users";
import Logs from "@/pages/admin/logs";
import Settings from "@/pages/admin/settings";
import AdminOrders from "@/pages/admin/orders";
import AdminOrderSearch from "@/pages/admin-order-search";
import OrderSearch from "@/pages/order-search-new";
import ApiManagement from "@/pages/admin/api-management";
import AdminKeyStats from "@/pages/admin-key-stats";
import ApiBalances from "@/pages/admin/api-balances";
import LoginAttempts from "@/pages/admin/login-attempts";
import AdminFeedback from "@/pages/admin/feedback";
import AdminComplaints from "@/pages/admin/complaints";
import Complaints from "@/pages/complaints";
import PasswordManagement from "@/pages/admin/password-management";
import HostingPreview from "@/pages/HostingPreview";
import HostingDemo from "@/pages/HostingDemo";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { CursorFollower, CursorTrail } from "@/hooks/useMouseTracking";

function Router() {
  const { isAuthenticated: isUserAuthenticated, isLoading: isUserLoading } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, isLoading: isAdminLoading } = useAdminAuth();

  // Show loading screen only for initial auth checks (max 2 seconds to prevent infinite loading)
  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 2000);
    
    // Hide loader early if auth checks complete
    if (!isUserLoading && !isAdminLoading) {
      setShowLoader(false);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [isUserLoading, isAdminLoading]);

  if (showLoader && (isUserLoading || isAdminLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-xl font-semibold text-gray-700">KeyPanel Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Home route - conditional based on user auth */}
      <Route path="/">
        {isUserAuthenticated ? <Home /> : <Landing />}
      </Route>
      
      {/* Public routes */}
      <Route path="/auth" component={Auth} />
      <Route path="/user" component={UserInterface} />
      <Route path="/order-search" component={OrderSearch} />
      <Route path="/complaints" component={Complaints} />
      <Route path="/hosting-preview" component={HostingPreview} />
      <Route path="/hosting-demo" component={HostingDemo} />
      
      {/* Admin login routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      
      {/* Admin main route - redirect to dashboard */}
      <Route path="/admin">
        {isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
      </Route>
      
      {/* Protected admin routes */}
      <Route path="/admin/dashboard">
        {isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
      </Route>
      <Route path="/admin/keys">
        {isAdminAuthenticated ? <Keys /> : <AdminLogin />}
      </Route>
      <Route path="/admin/services">
        {isAdminAuthenticated ? <Services /> : <AdminLogin />}
      </Route>
      <Route path="/admin/api-management">
        {isAdminAuthenticated ? <ApiManagement /> : <AdminLogin />}
      </Route>
      <Route path="/admin/api-balances">
        {isAdminAuthenticated ? <ApiBalances /> : <AdminLogin />}
      </Route>
      <Route path="/admin/users">
        {isAdminAuthenticated ? <Users /> : <AdminLogin />}
      </Route>
      <Route path="/admin/logs">
        {isAdminAuthenticated ? <Logs /> : <AdminLogin />}
      </Route>
      <Route path="/admin/settings">
        {isAdminAuthenticated ? <Settings /> : <AdminLogin />}
      </Route>
      <Route path="/admin/orders">
        {isAdminAuthenticated ? <AdminOrders /> : <AdminLogin />}
      </Route>
      <Route path="/admin/order-search">
        {isAdminAuthenticated ? <AdminOrderSearch /> : <AdminLogin />}
      </Route>
      <Route path="/admin/key-stats">
        {isAdminAuthenticated ? <AdminKeyStats /> : <AdminLogin />}
      </Route>
      <Route path="/admin/login-attempts">
        {isAdminAuthenticated ? <LoginAttempts /> : <AdminLogin />}
      </Route>
      <Route path="/admin/feedback">
        {isAdminAuthenticated ? <AdminFeedback /> : <AdminLogin />}
      </Route>
      <Route path="/admin/complaints">
        {isAdminAuthenticated ? <AdminComplaints /> : <AdminLogin />}
      </Route>
      <Route path="/admin/password-management">
        {isAdminAuthenticated ? <PasswordManagement /> : <AdminLogin />}
      </Route>
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />

        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;