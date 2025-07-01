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
      <div 
        className="absolute w-40 h-40 rounded-full blur-lg"
        style={{
          background: `radial-gradient(circle, #ec4899, #f472b6)`,
          opacity: 0.04
        }}
      ></div>
    </div>
  );
};

// Blue cursor follower for admin dashboard
export const AdminCursorFollower = () => {
  const mousePosition = useMousePosition();

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{
        left: mousePosition.x - 80,
        top: mousePosition.y - 80,
      }}
    >
      <div className="absolute w-40 h-40 bg-gradient-to-r from-blue-500/4 to-cyan-500/4 rounded-full blur-lg"></div>
    </div>
  );
};

// User pages cursor follower
export const UserCursorFollower = () => {
  const mousePosition = useMousePosition();

  return (
    <div
      className="fixed pointer-events-none z-0"
      style={{
        left: mousePosition.x - 80,
        top: mousePosition.y - 80,
      }}
    >
      <div 
        className="absolute w-40 h-40 rounded-full blur-lg"
        style={{
          background: `radial-gradient(circle, #ec4899, #f472b6)`,
          opacity: 0.04
        }}
      ></div>
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
      <div className="absolute w-6 h-6 bg-gradient-to-r from-pink-500/30 to-rose-500/30 rounded-full blur-md animate-pulse"></div>
      {/* Inner dot */}
      <div className="absolute w-3 h-3 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full top-1.5 left-1.5"></div>
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