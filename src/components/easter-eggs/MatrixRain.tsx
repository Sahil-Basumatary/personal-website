'use client';
import { useEffect, useRef } from 'react';

const GLYPHS = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜｦﾝ0123456789';
const FONT_SIZE = 16;
const FRAME_INTERVAL_MS = 50;

interface MatrixRainProps {
  onDismiss: () => void;
}

export function MatrixRain({ onDismiss }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;
    let lastTime = 0;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const columns = Math.floor(canvas.width / FONT_SIZE);
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
      ctx.font = `${FONT_SIZE}px Geneva, Monaco, monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length));
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;
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
  }, []);

  return (
    <div
      className="easter-egg-overlay matrix-overlay"
      onClick={onDismiss}
      role="presentation"
    >
      <canvas ref={canvasRef} className="matrix-canvas" />
      <div className="matrix-hint">click anywhere or press ESC to wake up</div>
    </div>
  );
}
