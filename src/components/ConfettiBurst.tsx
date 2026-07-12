import { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * A radial burst of glowing pi digits fired once when the result appears.
 * Pure DOM + framer-motion, removed by the parent after it plays out.
 */
export function ConfettiBurst() {
  const pieces = useMemo(() => {
    const chars = ['π', '3', '1', '4', '1', '5', '9', '2', '6', '5'];
    return Array.from({ length: 36 }, (_, i) => {
      const angle = (i / 36) * Math.PI * 2 + Math.random() * 0.3;
      const radius = 140 + Math.random() * 260;
      return {
        id: i,
        char: chars[i % chars.length],
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius * 0.8,
        rotate: (Math.random() - 0.5) * 540,
        scale: 0.7 + Math.random() * 1.1,
        duration: 1.1 + Math.random() * 0.9,
        red: Math.random() < 0.6,
      };
    });
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden">
      {pieces.map(p => (
        <motion.span
          key={p.id}
          className={`absolute font-mono font-bold ${p.red ? 'text-pi-red-500' : 'text-white'}`}
          style={{
            fontSize: `${p.scale * 1.4}rem`,
            textShadow: p.red ? '0 0 10px rgba(239,68,68,0.9)' : '0 0 8px rgba(255,255,255,0.6)',
          }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.4 }}
          animate={{
            x: p.x,
            y: p.y + 60, // slight gravity feel
            opacity: 0,
            rotate: p.rotate,
            scale: p.scale,
          }}
          transition={{ duration: p.duration, ease: [0.12, 0.8, 0.35, 1] }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}
