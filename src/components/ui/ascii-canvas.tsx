'use client';

import { useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AsciiRenderer } from '@/lib/ascii-animations';

interface AsciiCanvasProps {
  renderer: AsciiRenderer;
  className?: string;
  charWidth?: number;
  charHeight?: number;
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  opacity?: number;
}

export function AsciiCanvas({
  renderer,
  className,
  charWidth: cwOverride,
  charHeight: chOverride,
  color = '#1a1a1a',
  fontFamily = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  fontSize: fontSizeOverride,
  opacity = 0.55,
}: AsciiCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const visibleRef = useRef(true);
  const rendererRef = useRef(renderer);
  rendererRef.current = renderer;

  const draw = useCallback(() => {
    if (!visibleRef.current || !canvasRef.current || !containerRef.current)
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = containerRef.current.offsetWidth;
    const h = containerRef.current.offsetHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    const fs =
      fontSizeOverride || Math.max(8, Math.min(14, Math.floor(w / 40)));
    const cw = cwOverride || fs * 0.6;
    const ch = chOverride || fs * 1.2;
    const cols = Math.floor(w / cw);
    const rows = Math.floor(h / ch);

    const time = performance.now() / 1000;
    const grid = rendererRef.current(time, cols, rows);

    ctx.clearRect(0, 0, w, h);
    ctx.font = `${fs}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.textBaseline = 'top';

    for (let r = 0; r < grid.length; r++) {
      const row = grid[r];
      for (let c = 0; c < row.length; c++) {
        if (row[c] !== ' ') {
          ctx.fillText(row[c], c * cw, r * ch);
        }
      }
    }

    ctx.globalAlpha = 1;
    rafRef.current = requestAnimationFrame(draw);
  }, [cwOverride, chOverride, color, fontFamily, fontSizeOverride, opacity]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          rafRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0 }
    );

    observer.observe(container);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  return (
    <div ref={containerRef} className={cn('relative', className)} aria-hidden>
      <canvas ref={canvasRef} className='absolute inset-0 size-full' />
    </div>
  );
}
