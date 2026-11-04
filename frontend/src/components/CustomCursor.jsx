import React, { useEffect, useState } from 'react';

/**
 * Custom Animated Cursor Component
 * Provides a lightweight, smooth trailing circle and precision dot
 * that gently scales and glows when hovering over interactive elements.
 */
export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop devices with a precision mouse pointer
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Detect if hovering over clickable or interactive elements
      const target = e.target;
      const isInteractive = target && target.closest && target.closest(
        'button, a, input, select, textarea, [role="button"], .cursor-pointer, .glass-card'
      );
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Central Precision Cursor Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99999] transition-transform duration-75 ease-out hidden md:block print:hidden"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div
          className={`w-2 h-2 rounded-full transition-all duration-200 ${
            isHovered
              ? 'bg-blue-600 dark:bg-amber-400 scale-150 shadow-sm shadow-blue-500/50'
              : 'bg-blue-600 dark:bg-amber-400/90'
          }`}
        />
      </div>

      {/* Smooth Trailing Animated Glow Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[99998] transition-all duration-200 ease-out hidden md:block print:hidden"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        }}
      >
        <div
          className={`rounded-full transition-all duration-300 ease-out border ${
            isHovered
              ? 'w-10 h-10 border-blue-500/80 dark:border-amber-400/80 bg-blue-500/15 dark:bg-amber-400/15 shadow-lg shadow-blue-500/25 dark:shadow-amber-400/25 scale-110'
              : 'w-7 h-7 border-slate-400/50 dark:border-slate-500/50 bg-transparent'
          }`}
        />
      </div>
    </>
  );
};
