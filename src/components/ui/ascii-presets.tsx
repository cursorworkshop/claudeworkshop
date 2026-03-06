'use client';

import { useMemo } from 'react';
import { AsciiCanvas } from './ascii-canvas';
import {
  createParticleField,
  createDataStream,
  createRadarSweep,
  createWireframeCube,
  createAsciiSphere,
  createAsciiGlobe,
  createSpinningText,
} from '@/lib/ascii-animations';

interface PresetProps {
  className?: string;
}

export function AsciiParticleField({ className }: PresetProps) {
  const renderer = useMemo(() => createParticleField(50), []);
  return (
    <AsciiCanvas renderer={renderer} className={className} opacity={0.2} />
  );
}

export function AsciiDataStream({ className }: PresetProps) {
  const renderer = useMemo(() => createDataStream(5), []);
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.5}
      color='#000000'
    />
  );
}

export function AsciiRadarSweep({ className }: PresetProps) {
  const renderer = useMemo(() => createRadarSweep(), []);
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.45}
      color='#000000'
    />
  );
}

export function AsciiWireframeCube({ className }: PresetProps) {
  const renderer = useMemo(() => createWireframeCube(), []);
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.45}
      color='#000000'
    />
  );
}

export function AsciiSphere({ className }: PresetProps) {
  const renderer = useMemo(() => createAsciiSphere(), []);
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.5}
      color='#000000'
    />
  );
}

export function AsciiGlobe({ className }: PresetProps) {
  const renderer = useMemo(() => createAsciiGlobe(), []);
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.5}
      color='#000000'
    />
  );
}

interface AsciiSpinningTextProps extends PresetProps {
  children: string;
  duration?: number;
}

export function AsciiSpinningText({
  className,
  children,
  duration = 20,
}: AsciiSpinningTextProps) {
  const speed = (2 * Math.PI) / duration;
  const renderer = useMemo(
    () => createSpinningText(children, speed),
    [children, speed]
  );
  return (
    <AsciiCanvas
      renderer={renderer}
      className={className}
      opacity={0.6}
      color='#737373'
      fontSize={11}
    />
  );
}
