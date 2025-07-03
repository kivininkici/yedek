import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ModernSidebar from "./ModernSidebar";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function ModernAdminLayout({ children, className }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && !sidebarCollapsed) {
        const sidebar = document.getElementById('admin-sidebar');
        const target = event.target as Node;
        
        if (sidebar && !sidebar.contains(target)) {
          setSidebarCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, sidebarCollapsed]);

  const contentVariants = {
    expanded: {
      marginLeft: 280,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    collapsed: {
      marginLeft: 80,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    mobile: {
      marginLeft: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const overlayVariants = {
    visible: {
      opacity: 1,
      pointerEvents: "auto" as const,
      transition: {
        duration: 0.2
      }
    },
    hidden: {
      opacity: 0,
      pointerEvents: "none" as const,
      transition: {
        duration: 0.2
      }
    }
  };

  const getContentVariant = () => {
    if (isMobile) return "mobile";
    return sidebarCollapsed ? "collapsed" : "expanded";
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div id="admin-sidebar">
        <ModernSidebar 
          isCollapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.main
        variants={contentVariants}
        animate={getContentVariant()}
        className={cn(
          "min-h-screen transition-all duration-300",
          className
        )}
      >
        {/* Content Container */}
        <div className="relative">
          {/* Mobile Header - Only visible on mobile when sidebar is collapsed */}
          {isMobile && sidebarCollapsed && (
            <motion.header
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <motion.button
                    onClick={() => setSidebarCollapsed(false)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </motion.button>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    OtoKiwi Admin
                  </h1>
                </div>
              </div>
            </motion.header>
          )}

          {/* Page Content */}
          <div className={cn(
            "relative",
            isMobile ? "p-4" : "p-6"
          )}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Console Protection Script Injection */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                
                // Enhanced console protection for admin panel
                if (typeof console !== 'undefined') {
                  const originalLog = console.log;
                  console.log = console.warn = console.error = console.info = console.debug = function() {
                    // Only allow in development
                    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                      return originalLog.apply(console, arguments);
                    }
                  };
                }
                
                // Disable right-click context menu in admin panel
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  return false;
                });
                
                // Disable developer tools shortcuts
                document.addEventListener('keydown', function(e) {
                  // F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+U, Ctrl+S
                  if (e.key === 'F12' || 
                      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C')) ||
                      (e.ctrlKey && e.key === 'U') ||
                      (e.ctrlKey && e.key === 'S')) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // Detect DevTools and redirect
                let devtools = { open: false, orientation: null };
                const threshold = 160;
                
                setInterval(function() {
                  if (window.outerHeight - window.innerHeight > threshold || 
                      window.outerWidth - window.innerWidth > threshold) {
                    if (!devtools.open) {
                      devtools.open = true;
                      window.location.href = '/admin';
                    }
                  } else {
                    devtools.open = false;
                  }
                }, 500);
                
                // Prevent text selection in sensitive areas
                document.addEventListener('selectstart', function(e) {
                  const target = e.target as Element;
                  if (target.closest('[data-admin-sensitive]')) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // Obfuscate admin data in DOM
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                      mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1) {
                          const element = node as Element;
                          if (element.hasAttribute('data-admin-secret')) {
                            element.style.userSelect = 'none';
                            element.style.webkitUserSelect = 'none';
                          }
                        }
                      });
                    }
                  });
                });
                
                observer.observe(document.body, {
                  childList: true,
                  subtree: true
                });
                
                console.log('🔐 Admin security protections active');
              })();
            `
          }}
        />
      </motion.main>
    </div>
  );
}