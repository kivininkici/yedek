import { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Floating orbs background with fixed positions and independent animations
  const FloatingOrbs = () => {
    const orbData = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: 30 + (i % 3) * 15,
      x: (i * 7) % 100,
      y: (i * 13) % 100,
      color: i % 3 === 0 ? 'bg-blue-400/15' : i % 3 === 1 ? 'bg-purple-400/15' : 'bg-cyan-400/15',
      duration: 15 + (i % 5) * 3,
      delay: i * 0.5
    }));

    return (
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {orbData.map((orb) => (
          <motion.div
            key={orb.id}
            className={`absolute rounded-full ${orb.color} blur-sm`}
            style={{
              width: orb.size,
              height: orb.size,
              left: `${orb.x}%`,
              top: `${orb.y}%`,
            }}
            animate={{
              x: [0, 30, -20, 40, 0],
              y: [0, -40, 30, -20, 0],
              scale: [1, 1.2, 0.8, 1.1, 1],
              opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              repeatType: "loop",
              delay: orb.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative flex items-center justify-center p-4">
      <FloatingOrbs />
      
      {/* Background effects - fixed and independent */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.12),transparent_50%)] pointer-events-none z-0"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="relative w-full max-w-lg z-10"
      >
        {/* Glow effect - static */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/15 via-purple-400/15 to-cyan-400/15 rounded-3xl blur-3xl pointer-events-none"></div>
        
        <div className="relative backdrop-blur-xl bg-gradient-to-br from-slate-800/95 via-blue-900/90 to-slate-800/95 border border-blue-400/30 shadow-2xl rounded-3xl overflow-hidden z-20">
          {/* Header with animated icon */}
          <div className="relative p-12 pb-8 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/8 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-purple-500/8 rounded-full blur-xl pointer-events-none"></div>
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="relative w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <Lock className="w-10 h-10 text-white" />
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mb-3"
            >
              Şifremi Unuttum
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-gray-300 font-medium"
            >
              E-posta adresinizi girin, şifre sıfırlama linkini hemen gönderelim
            </motion.p>
          </div>

          <div className="px-12 pb-12">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="space-y-3">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-3">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="mailiniz@mail.com"
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg font-medium backdrop-blur-sm"
                        required
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300"
                      >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-50 text-lg shadow-xl relative overflow-hidden"
                  >
                    {isLoading && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2 }}
                        className="absolute top-0 left-0 h-full bg-white/20 rounded-2xl"
                      />
                    )}
                    <span className="relative z-10">
                      {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
                    </span>
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-white">E-posta Gönderildi!</h3>
                    <p className="text-gray-300 font-medium leading-relaxed">
                      {message}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-10 text-center"
            >
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center space-x-3 text-gray-300 hover:text-white transition-all duration-300 font-medium bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/10 hover:border-white/20"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Giriş sayfasına dön</span>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}