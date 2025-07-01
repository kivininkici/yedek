import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTracking {
  position: MousePosition;
  isMoving: boolean;
  velocity: { x: number; y: number };
  lastMoveTime: number;
}

export const useMouseTracking = () => {
  const [mouseData, setMouseData] = useState<MouseTracking>({
    position: { x: 0, y: 0 },
    isMoving: false,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0
  });

  useEffect(() => {
    let previousPosition = { x: 0, y: 0 };
    let previousTime = Date.now();
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (event: MouseEvent) => {
      const currentTime = Date.now();
      const deltaTime = currentTime - previousTime;
      
      const velocity = {
        x: deltaTime > 0 ? (event.clientX - previousPosition.x) / deltaTime : 0,
        y: deltaTime > 0 ? (event.clientY - previousPosition.y) / deltaTime : 0
      };

      setMouseData({
        position: { x: event.clientX, y: event.clientY },
        isMoving: true,
        velocity,
        lastMoveTime: currentTime
      });

      previousPosition = { x: event.clientX, y: event.clientY };
      previousTime = currentTime;

      // Clear the previous timeout
      clearTimeout(timeoutId);
      
      // Set mouse as not moving after 100ms of inactivity
      timeoutId = setTimeout(() => {
        setMouseData(prev => ({
          ...prev,
          isMoving: false,
          velocity: { x: 0, y: 0 }
        }));
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);

  return mouseData;
};

// Mouse follower component for visual effects
export const MouseFollower = () => {
  const { position, isMoving } = useMouseTracking();

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-300 ease-out"
      style={{
        left: position.x - 10,
        top: position.y - 10,
        transform: `scale(${isMoving ? 1 : 0.8})`,
        opacity: isMoving ? 0.8 : 0.4
      }}
    >
      <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-sm animate-pulse"></div>
    </div>
  );
};

// Interactive background dots that react to mouse
export const InteractiveBackground = () => {
  const { position } = useMouseTracking();

  const dots = Array.from({ length: 20 }, (_, i) => {
    const x = (i % 5) * 300;
    const y = Math.floor(i / 5) * 200;
    const distance = Math.sqrt((position.x - x) ** 2 + (position.y - y) ** 2);
    const scale = Math.max(0.5, Math.min(1.5, 1 - distance / 500));
    
    return (
      <div
        key={i}
        className="absolute w-2 h-2 bg-blue-400/20 rounded-full transition-transform duration-300"
        style={{
          left: x,
          top: y,
          transform: `scale(${scale})`,
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {dots}
    </div>
  );
};

export default useMouseTracking;