'use client';

import { useEffect, useRef, useState } from 'react';

type Props = {
  className?: string;
};

export function WaveBackground({ className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only start animation when component is visible
    const observer = new IntersectionObserver(
      entries => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR for performance
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    const drawWaves = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Responsive wave settings - much fewer lines on mobile for cleaner look
      const isMobile = width < 768;
      const lineCount = isMobile ? 8 : 35; // ~1/4 of desktop lines on mobile
      const amplitude = isMobile ? 60 : 100; // Smaller waves on mobile to prevent overlap
      const frequency = 0.006;
      const speed = 0.003;

      ctx.lineWidth = 1.2;

      for (let i = 0; i < lineCount; i++) {
        ctx.beginPath();

        // Spread lines across full width - wider spacing on mobile
        const baseOffset = isMobile
          ? ((i + 0.5) / lineCount) * width // Even distribution on mobile
          : ((i - 2) / (lineCount - 4)) * width;
        const phaseOffset = i * 0.25;

        // Vary amplitude per line for more organic feel - less variation on mobile
        const lineAmplitude = isMobile
          ? amplitude * (0.8 + Math.sin(i * 0.5) * 0.2)
          : amplitude * (0.6 + Math.sin(i * 0.5) * 0.4);

        for (let y = 0; y <= height; y += 2) {
          // Calculate fade - full opacity at top, fade out at bottom
          const fadeStart = height * 0.6;
          const fadeEnd = height * 0.95;
          let opacity = 0.25;

          if (y > fadeStart) {
            const fadeProgress = (y - fadeStart) / (fadeEnd - fadeStart);
            opacity = 0.25 * (1 - Math.min(fadeProgress, 1));
          }

          // Create flowing wave effect with more variance
          const wave1 =
            Math.sin(y * frequency + time * speed + phaseOffset) *
            lineAmplitude;
          const wave2 =
            Math.sin(y * frequency * 0.4 + time * speed * 0.6 + phaseOffset) *
            lineAmplitude *
            0.6;
          const wave3 =
            Math.sin(y * frequency * 1.8 + time * speed * 1.2 + phaseOffset) *
            lineAmplitude *
            0.3;
          const wave4 =
            Math.sin(y * frequency * 0.2 + time * speed * 0.4 + phaseOffset) *
            lineAmplitude *
            0.4;

          const x = baseOffset + wave1 + wave2 + wave3 + wave4;

          if (y === 0) {
            ctx.strokeStyle = `rgba(140, 140, 140, ${opacity})`;
            ctx.moveTo(x, y);
          } else {
            ctx.stroke();
            ctx.beginPath();
            ctx.strokeStyle = `rgba(140, 140, 140, ${opacity})`;
            ctx.moveTo(x, y - 2);
            ctx.lineTo(x, y);
          }
        }

        ctx.stroke();
      }

      time += 1;
      animationId = requestAnimationFrame(drawWaves);
    };

    resize();
    window.addEventListener('resize', resize);
    drawWaves();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
