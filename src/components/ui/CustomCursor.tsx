import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface Position {
  x: number;
  y: number;
}

const CustomCursor = () => {
  const location = useLocation();
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const hideCursorPaths = ['/admin', '/login'];
  const shouldHideCursor = hideCursorPaths.some(path => 
    location.pathname.startsWith(path)
  );
  
  const [isMobile, setIsMobile] = useState(true);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth <= 1024);
      }
    };
    checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // Cursor interaction handlers
  useEffect(() => {
    if (shouldHideCursor || isMobile || typeof document === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleClick = (e: MouseEvent) => {
      setIsClicking(true);
      const newRipple = { id: Date.now(), x: e.clientX, y: e.clientY };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 350);
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleTouchStart = (e: TouchEvent) => {
      setIsClicking(true);
      const touch = e.touches[0];
      if (touch) {
        const newRipple = { id: Date.now(), x: touch.clientX, y: touch.clientY };
        setRipples(prev => [...prev, newRipple]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== newRipple.id)), 350);
      }
      setTimeout(() => setIsClicking(false), 100);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick);
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [shouldHideCursor, isMobile]);

  if (shouldHideCursor || isMobile) return null;

  return (
    <>
      {isVisible && (
        <>
          {/* Main Cursor — Deep Burgundy Elegance */}
          <div
            className={`fixed pointer-events-none z-[9999] ${
              isClicking ? 'animate-burgundyPulse' : ''
            }`}
            style={{
              left: position.x - 22,
              top: position.y - 22,
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8a1c3d, #6d1430, #5a0e26)',
              boxShadow:
                '0 0 24px rgba(138, 28, 61, 0.5), ' +
                'inset 0 0 16px rgba(255, 250, 248, 0.12), ' +
                'inset 0 4px 12px rgba(0, 0, 0, 0.25)',
              transform: isClicking ? 'scale(1.4)' : 'scale(1)',
              opacity: isClicking ? '1' : '0.88',
              transition: 'transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
            }}
          >
            {/* Inner Silk Glow — warm white with burgundy tint */}
            <div
              className="absolute inset-2 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at center, ' +
                  'rgba(245, 230, 225, 0.7) 0%, ' +
                  'rgba(200, 130, 120, 0.2) 60%, ' +
                  'transparent 90%)',
                mixBlendMode: 'overlay',
              }}
            />

            {/* Center Jewel — polished ruby-like dot */}
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #f8f4f2 40%, #e0c0b5 100%)',
                boxShadow:
                  '0 0 6px rgba(248, 244, 242, 0.9), ' +
                  '0 0 2px 1px rgba(138, 28, 61, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          </div>

          {/* Outer Halo Ring — subtle & refined */}
          <div
            className="fixed pointer-events-none z-[9998]"
            style={{
              left: position.x - 32,
              top: position.y - 32,
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '1.5px solid rgba(169, 50, 85, 0.22)', // #a93255 @ 22%
              transform: isClicking ? 'scale(2.1)' : 'scale(1)',
              opacity: isClicking ? '0.2' : '0.45',
              transition: 'transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.3s ease',
            }}
          />
        </>
      )}

      {/* Burgundy Ripple Effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9997] animate-burgundyRipple"
          style={{
            left: ripple.x - 26,
            top: ripple.y - 26,
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            border: '2px solid #a93255',
            opacity: '0.55',
          }}
        />
      ))}
    </>
  );
};

export default CustomCursor;