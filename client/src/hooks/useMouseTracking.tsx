import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return mousePosition;
};

// Glowing circle cursor follower for landing page
export const LandingCursorFollower = () => {
  const mousePosition = useMousePosition();

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{
        left: mousePosition.x - 80,
        top: mousePosition.y - 80,
      }}
    >
      {/* Outer glow ring */}
      <div className="absolute w-40 h-40 bg-gradient-to-r from-purple-500/3 to-blue-500/3 rounded-full blur-lg animate-pulse"></div>
      {/* Main circle */}
      <div className="absolute w-32 h-32 bg-gradient-to-br from-purple-400/5 to-blue-400/5 rounded-full top-4 left-4"></div>
      {/* Inner bright center */}
      <div className="absolute w-16 h-16 bg-gradient-to-br from-purple-200/6 to-blue-200/6 rounded-full top-12 left-12"></div>
    </div>
  );
};

// Smooth cursor follower with glowing effect
export const CursorFollower = () => {
  const mousePosition = useMousePosition();

  return (
    <div
      className="fixed pointer-events-none z-50 transition-all duration-150 ease-out"
      style={{
        left: mousePosition.x - 12,
        top: mousePosition.y - 12,
      }}
    >
      {/* Outer glow */}
      <div className="absolute w-6 h-6 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-md animate-pulse"></div>
      {/* Inner dot */}
      <div className="absolute w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full top-1.5 left-1.5"></div>
    </div>
  );
};

// Trail effect that follows the cursor
export const CursorTrail = () => {
  const mousePosition = useMousePosition();
  const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]);

  useEffect(() => {
    const newDot = {
      x: mousePosition.x,
      y: mousePosition.y,
      id: Date.now()
    };

    setTrail(prev => {
      const newTrail = [newDot, ...prev].slice(0, 8); // Keep only last 8 dots
      return newTrail;
    });
  }, [mousePosition]);

  return (
    <div className="fixed pointer-events-none z-40">
      {trail.map((dot, index) => (
        <div
          key={dot.id}
          className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-300"
          style={{
            left: dot.x - 4,
            top: dot.y - 4,
            opacity: (8 - index) * 0.1,
            transform: `scale(${(8 - index) * 0.1})`,
          }}
        />
      ))}
    </div>
  );
};

export default useMousePosition;