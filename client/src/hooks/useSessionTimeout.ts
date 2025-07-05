import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';

export function useSessionTimeout() {
  const [, navigate] = useLocation();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Show warning after 1 hour 45 minutes
    warningRef.current = setTimeout(() => {
      alert('Oturumunuz 15 dakika sonra otomatik olarak sona erecek. Devam etmek için herhangi bir işlem yapın.');
    }, 105 * 60 * 1000); // 1 hour 45 minutes

    // Auto logout after 2 hours
    timeoutRef.current = setTimeout(() => {
      alert('Oturumunuz güvenlik nedeniyle sona erdi. Tekrar giriş yapmanız gerekiyor.');
      navigate('/admin/login');
    }, 120 * 60 * 1000); // 2 hours
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const resetTimer = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initial timeout
    resetTimeout();

    return () => {
      // Clean up event listeners
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      
      // Clear timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [navigate]);

  return { resetTimeout };
}