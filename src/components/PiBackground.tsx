import { motion } from 'framer-motion';

interface PiBackgroundProps {
  digits: string;
}

export function PiBackground({ digits }: PiBackgroundProps) {
  // Take first 5000 digits for background display
  const displayDigits = digits.slice(0, 5000);

  if (!displayDigits) {
    return (
      <div className="fixed inset-0 bg-black z-0" />
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Spiral text container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="font-mono text-[10px] leading-tight whitespace-pre-wrap text-center select-none"
          style={{
            width: '250vw',
            height: '250vh',
            wordBreak: 'break-all',
            background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.3) 0%, rgba(0, 0, 0, 0) 50%, rgba(127, 29, 29, 0.2) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 300,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {displayDigits.split('').map((digit, i) => (
            <span
              key={i}
              style={{
                color: i % 2 === 0 ? 'rgba(127, 29, 29, 0.4)' : 'rgba(255, 255, 255, 0.15)',
              }}
            >
              {digit}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Radial gradient overlay for vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.7) 50%, rgba(0, 0, 0, 0.95) 100%)',
        }}
      />
    </div>
  );
}
