'use client';
import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion';
import {
  MATRIX_FONT_SIZE,
  buildStaticMatrixCells,
  paintMatrixCells,
} from '@/lib/matrix-frame';

const FRAME_INTERVAL_MS = 50;
const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789';

interface MatrixRainProps {
  onDismiss: () => void;
}

export function MatrixRain({ onDismiss }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const paintStatic = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      paintMatrixCells(
        ctx,
        canvas.width,
        canvas.height,
        buildStaticMatrixCells(canvas.width, canvas.height)
      );
    };

    if (prefersReducedMotion) {
      paintStatic();
      window.addEventListener('resize', paintStatic);
      return () => window.removeEventListener('resize', paintStatic);
    }

    let animationFrame = 0;
    let lastTime = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / MATRIX_FONT_SIZE);
      drops = new Array(columns)
        .fill(0)
        .map(() => Math.floor(Math.random() * -50));
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const tick = (time: number) => {
      animationFrame = requestAnimationFrame(tick);
      if (time - lastTime < FRAME_INTERVAL_MS) return;
      lastTime = time;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${MATRIX_FONT_SIZE}px Geneva, Monaco, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        const x = i * MATRIX_FONT_SIZE;
        const y = drops[i] * MATRIX_FONT_SIZE;
        ctx.fillStyle = drops[i] === 1 ? '#ccffcc' : '#00ff41';
        ctx.fillText(char, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={
        prefersReducedMotion
          ? 'easter-egg-overlay matrix-overlay matrix-overlay--static'
          : 'easter-egg-overlay matrix-overlay'
      }
      onClick={onDismiss}
      role="presentation"
    >
      <canvas ref={canvasRef} className="matrix-canvas" aria-hidden="true" />
      <div className="matrix-hint">
        {prefersReducedMotion
          ? 'static frame - click anywhere or press ESC to wake up'
          : 'click anywhere or press ESC to wake up'}
      </div>
    </div>
  );
}
