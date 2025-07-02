import { Bell, Moon, Sun, ShoppingCart, Settings, Search, Calendar, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
  description?: string;
}

export default function Header({ title, description }: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.header 
      className="bg-black/20 backdrop-blur-2xl border-b border-white/10 px-6 py-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
          animate={{
            background: [
              "linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05))",
              "linear-gradient(to right, rgba(147, 51, 234, 0.05), rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.05))",
              "linear-gradient(to right, rgba(236, 72, 153, 0.05), rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05))"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        {/* Left Side - Title & Description */}
        <motion.div 
          className="flex-1"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                {title}
              </h1>
              {description && (
                <p className="text-white/60 text-sm lg:text-base mt-1">
                  {description}
                </p>
              )}
            </div>
            
            {/* Status Indicator */}
            <motion.div
              className="hidden lg:flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-400/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div
                className="w-2 h-2 bg-emerald-400 rounded-full"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-emerald-300 text-sm font-medium">Sistem Aktif</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Controls */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Current Time */}
          <div className="hidden lg:flex items-center space-x-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <div className="text-right">
                <div className="text-white font-mono text-sm">
                  {formatTime(currentTime)}
                </div>
                <div className="text-white/60 text-xs">
                  {formatDate(currentTime)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Search */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline ml-2">Hızlı Arama</span>
            </Button>
          </motion.div>

          {/* Notifications */}
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 relative"
            >
              <Bell className="w-4 h-4" />
              {/* Notification Badge */}
              <motion.div
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-white text-xs font-bold">3</span>
              </motion.div>
            </Button>
          </motion.div>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </motion.div>

          {/* Settings */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
              onClick={() => window.location.href = '/admin/settings'}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </motion.div>

          {/* Activity Indicator */}
          <motion.div 
            className="hidden lg:flex items-center space-x-2 bg-blue-500/20 px-3 py-2 rounded-xl border border-blue-400/30"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="w-4 h-4 text-blue-400" />
            </motion.div>
            <span className="text-blue-300 text-sm font-medium">Live</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Progress Line */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
      />
    </motion.header>
  );
}