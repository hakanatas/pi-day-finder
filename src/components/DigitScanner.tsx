import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface DigitScannerProps {
  digits: string;
}

const WINDOW = 21; // odd, so there is a true center
const CENTER = Math.floor(WINDOW / 2);

/**
 * Cinematic "searching" scene: a strip of pi digits races under a red lens
 * while a position counter spins up, as if the app is physically scanning pi.
 */
export function DigitScanner({ digits }: DigitScannerProps) {
  const [strip, setStrip] = useState<string[]>(() => Array(WINDOW).fill('0'));
  const [scannedPos, setScannedPos] = useState(0);
  const posRef = useRef(2);

  useEffect(() => {
    const src = digits && digits.length > WINDOW + 10 ? digits : '3141592653589793238462643383279502884197169399375105820974944592307816406286';
    const maxStart = Math.min(src.length - WINDOW - 1, 9_000_000);

    const id = setInterval(() => {
      // Leap forward pseudo-randomly so the strip flickers like a scanner
      posRef.current += 35_000 + Math.floor(Math.random() * 220_000);
      if (posRef.current > maxStart) posRef.current = Math.floor(Math.random() * 1000);
      const start = posRef.current % Math.max(maxStart, 1);
      setStrip(src.slice(start, start + WINDOW).split(''));
      setScannedPos(start);
    }, 60);

    return () => clearInterval(id);
  }, [digits]);

  return (
    <div className="text-center select-none">
      {/* Pi symbol with radiating pulse rings */}
      <div className="relative inline-block mb-10">
        {[0, 1].map(i => (
          <motion.span
            key={i}
            className="absolute inset-0 rounded-full border border-pi-red-500/60"
            initial={{ scale: 0.7, opacity: 0.7 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
          />
        ))}
        <motion.span
          className="relative block text-8xl text-pi-red-500 font-serif pi-glow px-6"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          π
        </motion.span>
      </div>

      {/* Racing digit strip with a central lens */}
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-xl border border-pi-red-900/60 bg-black/70 backdrop-blur-md py-4 px-2">
        {/* sweeping scan beam */}
        <motion.div
          className="absolute inset-y-0 w-16 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(239,68,68,0.18), transparent)',
          }}
          animate={{ left: ['-10%', '105%'] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        />
        <div className="flex justify-center font-mono text-xl sm:text-2xl">
          {strip.map((d, i) => {
            const dist = Math.abs(i - CENTER);
            const inLens = dist <= 2;
            return (
              <span
                key={i}
                className={
                  inLens
                    ? 'text-pi-red-400 font-bold'
                    : 'text-gray-600'
                }
                style={{
                  width: '1.15em',
                  opacity: inLens ? 1 : Math.max(0.25, 1 - dist * 0.09),
                  textShadow: inLens ? '0 0 12px rgba(239,68,68,0.8)' : 'none',
                  transform: inLens ? `scale(${1.25 - dist * 0.08})` : 'none',
                }}
              >
                {d}
              </span>
            );
          })}
        </div>
        {/* lens frame */}
        <div
          className="absolute top-1 bottom-1 left-1/2 -translate-x-1/2 w-[7.2em] rounded-lg border border-pi-red-500/50 pointer-events-none"
          style={{ boxShadow: '0 0 18px rgba(239,68,68,0.25), inset 0 0 18px rgba(239,68,68,0.12)' }}
        />
      </div>

      {/* Racing counter */}
      <p className="mt-6 text-gray-400 text-sm font-mono tabular-nums">
        Taranan basamak:{' '}
        <span className="text-pi-red-400">
          {scannedPos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        </span>
      </p>
      <motion.p
        className="mt-2 text-white text-xl"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        Pi'de aranıyor...
      </motion.p>
    </div>
  );
}
