import { useEffect, useRef } from 'react';

interface PiBackgroundProps {
  digits: string;
}

interface Particle {
  x: number;
  y: number;
  z: number; // depth 0.2 (far) .. 1 (near)
  digit: string;
  speed: number;
  driftPhase: number;
  driftSpeed: number;
  twinklePhase: number;
  twinkleSpeed: number;
  isRed: boolean;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  digit: string;
  life: number; // 1 -> 0
  size: number;
}

const FALLBACK_DIGITS = '3141592653589793238462643383279502884197169399375105820974944592307816406286';

export function PiBackground({ digits }: PiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const digitsRef = useRef(digits);
  digitsRef.current = digits;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionScale = reducedMotion ? 0.12 : 1;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let comets: Comet[] = [];
    let nextCometAt = 0;
    let rafId = 0;
    const mouse = { x: 0.5, y: 0.5 };

    const source = () => digitsRef.current || FALLBACK_DIGITS;

    const makeParticle = (spawnAnywhere: boolean): Particle => {
      const src = source();
      const z = 0.2 + Math.random() * 0.8;
      return {
        x: Math.random() * width,
        y: spawnAnywhere ? Math.random() * height : height + 30,
        z,
        digit: src[Math.floor(Math.random() * Math.min(src.length, 5000))] ?? '3',
        speed: (6 + Math.random() * 14) * z,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.2 + Math.random() * 0.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.6 + Math.random() * 1.8,
        isRed: Math.random() < 0.3,
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = Math.min(170, Math.round((width * height) / 11000));
      particles = Array.from({ length: target }, () => makeParticle(true));
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / Math.max(width, 1);
      mouse.y = e.clientY / Math.max(height, 1);
    };

    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      ctx.clearRect(0, 0, width, height);

      // Pulsing central ember glow behind the content
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6);
      const glowR = Math.max(width, height) * (0.42 + 0.06 * pulse);
      const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, glowR);
      glow.addColorStop(0, `rgba(127, 29, 29, ${0.16 + 0.07 * pulse})`);
      glow.addColorStop(0.55, 'rgba(69, 10, 10, 0.06)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      // Digit field
      const parX = (mouse.x - 0.5) * 40;
      const parY = (mouse.y - 0.5) * 24;
      for (const p of particles) {
        p.y -= p.speed * dt * motionScale;
        p.driftPhase += p.driftSpeed * dt;
        if (p.y < -30) {
          Object.assign(p, makeParticle(false));
        }
        const twinkle = 0.55 + 0.45 * Math.sin(t * p.twinkleSpeed + p.twinklePhase);
        const alpha = (p.isRed ? 0.5 : 0.22) * p.z * twinkle;
        const size = 9 + p.z * 15;
        const x = p.x + Math.sin(p.driftPhase) * 14 + parX * p.z;
        const y = p.y + parY * p.z;

        ctx.font = `${size}px 'JetBrains Mono', monospace`;
        if (p.isRed) {
          ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
          ctx.shadowBlur = 8 * p.z;
          ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        }
        ctx.fillText(p.digit, x, y);
      }
      ctx.shadowBlur = 0;

      // Shooting digits (comets)
      if (!reducedMotion) {
        if (now > nextCometAt) {
          nextCometAt = now + 2200 + Math.random() * 3800;
          const fromLeft = Math.random() < 0.5;
          const src = source();
          comets.push({
            x: fromLeft ? -40 : width + 40,
            y: Math.random() * height * 0.55,
            vx: (fromLeft ? 1 : -1) * (380 + Math.random() * 260),
            vy: 120 + Math.random() * 120,
            digit: src[Math.floor(Math.random() * Math.min(src.length, 5000))] ?? '1',
            life: 1,
            size: 20 + Math.random() * 14,
          });
        }
        for (const c of comets) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          c.life -= dt * 0.45;
          // trail
          const trailN = 7;
          for (let i = trailN; i >= 1; i--) {
            const tx = c.x - (c.vx * i * 0.016);
            const ty = c.y - (c.vy * i * 0.016);
            const ta = Math.max(c.life, 0) * (1 - i / (trailN + 1)) * 0.35;
            ctx.font = `${c.size * (1 - i * 0.06)}px 'JetBrains Mono', monospace`;
            ctx.fillStyle = `rgba(248, 113, 113, ${ta})`;
            ctx.fillText(c.digit, tx, ty);
          }
          ctx.font = `${c.size}px 'JetBrains Mono', monospace`;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.9)';
          ctx.shadowBlur = 18;
          ctx.fillStyle = `rgba(254, 226, 226, ${Math.max(c.life, 0)})`;
          ctx.fillText(c.digit, c.x, c.y);
          ctx.shadowBlur = 0;
        }
        comets = comets.filter(c => c.life > 0 && c.x > -80 && c.x < width + 80 && c.y < height + 80);
      }

      rafId = requestAnimationFrame(frame);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      <canvas ref={canvasRef} className="absolute inset-0" />
      {/* Vignette to keep the content readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.45) 55%, rgba(0, 0, 0, 0.85) 100%)',
        }}
      />
    </div>
  );
}
