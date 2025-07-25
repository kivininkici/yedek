<<<<<<< HEAD
import { useState, useEffect, lazy, Suspense } from "react";
=======
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
<<<<<<< HEAD
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { initSecurity } from "@/lib/securityProtection";

// Performance optimization: Lazy load components
const NotFound = lazy(() => import("@/pages/not-found"));
const Landing = lazy(() => import("@/pages/landing"));
const Home = lazy(() => import("@/pages/home"));
const Auth = lazy(() => import("@/pages/auth"));
const UserInterface = lazy(() => import("@/pages/user-interface"));
const AdminLogin = lazy(() => import("@/pages/admin-login"));
const AdminForgotPassword = lazy(() => import("@/pages/admin/forgot-password"));
const AdminResetPassword = lazy(() => import("@/pages/admin/reset-password"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/admin/dashboard-simple"));
const Keys = lazy(() => import("@/pages/admin/keys"));
const Services = lazy(() => import("@/pages/admin/services"));
const Users = lazy(() => import("@/pages/admin/users"));
const Logs = lazy(() => import("@/pages/admin/logs"));
const Settings = lazy(() => import("@/pages/admin/settings"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminOrderSearch = lazy(() => import("@/pages/admin-order-search"));
const OrderSearch = lazy(() => import("@/pages/order-search"));
const ApiManagement = lazy(() => import("@/pages/admin/api-management"));
const AdminKeyStats = lazy(() => import("@/pages/admin-key-stats"));
const ApiBalances = lazy(() => import("@/pages/admin/api-balances"));
const LoginAttempts = lazy(() => import("@/pages/admin/login-attempts"));
const AdminFeedback = lazy(() => import("@/pages/admin/feedback"));
const AdminComplaints = lazy(() => import("@/pages/admin/complaints"));
const Complaints = lazy(() => import("@/pages/complaints"));
const PasswordManagement = lazy(() => import("@/pages/admin/password-management"));
const MasterPasswordManagement = lazy(() => import("@/pages/admin/MasterPasswordManagement"));
const HostingPreview = lazy(() => import("@/pages/HostingPreview"));
const HostingDemo = lazy(() => import("@/pages/HostingDemo"));

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="min-h-screen bg-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
      <div className="text-xs text-white">Yükleniyor...</div>
    </div>
  </div>
);


function Router() {
  const { isAuthenticated: isUserAuthenticated, isLoading: isUserLoading } = useAuth();
  const { isAuthenticated: isAdminAuthenticated, isLoading: isAdminLoading } = useAdminAuth();
  
  // Initialize security protection only for admin login page
  useEffect(() => {
    // Only apply security for admin login page, not authenticated admin panels
    if (window.location.pathname === '/admin/login' || window.location.pathname === '/admin-login') {
      initSecurity();
    }
  }, []);



  // Simplified loading state - only show for very short time
  const [showLoader, setShowLoader] = useState(true);
  
  useEffect(() => {
    // Much shorter loading time for better performance
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 500);
    
    // Hide loader immediately if auth checks complete
    if (!isUserLoading && !isAdminLoading) {
      setShowLoader(false);
      clearTimeout(timer);
    }
    
    return () => clearTimeout(timer);
  }, [isUserLoading, isAdminLoading]);

  // Show minimal loading only on initial load
  if (showLoader) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-sm text-white">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
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
        <Route path="/admin/forgot-password" component={AdminForgotPassword} />
        <Route path="/admin/reset-password" component={AdminResetPassword} />
        
        {/* Password reset routes */}
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        
        {/* Admin main route - CRITICAL: Force login check */}
        <Route path="/admin">
          {!isAdminLoading && isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
        </Route>
        
        {/* Protected admin routes - CRITICAL: Loading check enforced */}
        <Route path="/admin/dashboard">
          {!isAdminLoading && isAdminAuthenticated ? <Dashboard /> : <AdminLogin />}
        </Route>
        <Route path="/admin/keys">
          {!isAdminLoading && isAdminAuthenticated ? <Keys /> : <AdminLogin />}
        </Route>
        <Route path="/admin/services">
          {!isAdminLoading && isAdminAuthenticated ? <Services /> : <AdminLogin />}
        </Route>
        <Route path="/admin/api-management">
          {!isAdminLoading && isAdminAuthenticated ? <ApiManagement /> : <AdminLogin />}
        </Route>
        <Route path="/admin/api-balances">
          {!isAdminLoading && isAdminAuthenticated ? <ApiBalances /> : <AdminLogin />}
        </Route>
        <Route path="/admin/users">
          {!isAdminLoading && isAdminAuthenticated ? <Users /> : <AdminLogin />}
        </Route>
        <Route path="/admin/logs">
          {!isAdminLoading && isAdminAuthenticated ? <Logs /> : <AdminLogin />}
        </Route>
        <Route path="/admin/settings">
          {!isAdminLoading && isAdminAuthenticated ? <Settings /> : <AdminLogin />}
        </Route>
        <Route path="/admin/orders">
          {!isAdminLoading && isAdminAuthenticated ? <AdminOrders /> : <AdminLogin />}
        </Route>
        <Route path="/admin/order-search">
          {!isAdminLoading && isAdminAuthenticated ? <AdminOrderSearch /> : <AdminLogin />}
        </Route>
        <Route path="/admin/key-stats">
          {!isAdminLoading && isAdminAuthenticated ? <AdminKeyStats /> : <AdminLogin />}
        </Route>
        <Route path="/admin/login-attempts">
          {!isAdminLoading && isAdminAuthenticated ? <LoginAttempts /> : <AdminLogin />}
        </Route>
        <Route path="/admin/feedback">
          {!isAdminLoading && isAdminAuthenticated ? <AdminFeedback /> : <AdminLogin />}
        </Route>
        <Route path="/admin/complaints">
          {!isAdminLoading && isAdminAuthenticated ? <AdminComplaints /> : <AdminLogin />}
        </Route>
        <Route path="/admin/password-management">
          {!isAdminLoading && isAdminAuthenticated ? <PasswordManagement /> : <AdminLogin />}
        </Route>
        <Route path="/admin/master-password-management">
          {!isAdminLoading && isAdminAuthenticated ? <MasterPasswordManagement /> : <AdminLogin />}
        </Route>
        
        {/* 404 fallback */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
=======
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Subscribe from "@/pages/Subscribe";
import AdminPanel from "@/pages/AdminPanel";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/admin" component={AdminPanel} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
<<<<<<< HEAD
      <TooltipProvider>
        <Toaster />

        <Router />
      </TooltipProvider>
=======
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
    </QueryClientProvider>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> 9cd9589 (Set up core functionalities and improve user interface components)
