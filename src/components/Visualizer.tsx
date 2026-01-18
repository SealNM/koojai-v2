'use client';

import { useEffect, useRef } from 'react';

/**
 * 🎨 Visualizer Component
 * หน้าที่: วาดกราฟิกวงกลมเต้นตามเสียง
 */

interface VisualizerProps {
  isActive: boolean;
  volume: number;
  source: 'user' | 'ai';
}

const Visualizer: React.FC<VisualizerProps> = ({ isActive, volume, source }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const smoothVolRef = useRef(0);
  const phaseRef = useRef(0);

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    phaseRef.current += 0.02;

    if (volume > smoothVolRef.current) {
      smoothVolRef.current += (volume - smoothVolRef.current) * 0.2;
    } else {
      smoothVolRef.current += (volume - smoothVolRef.current) * 0.05;
    }

    const currentVol = smoothVolRef.current;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    if (!isActive) {
      const breathingRadius = 50 + Math.sin(phaseRef.current * 2) * 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, breathingRadius, 0, 2 * Math.PI);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const color = source === 'user' ? '37, 99, 235' : '236, 72, 153';
    const layers = 3;
    const maxRadius = 180;

    for (let i = 0; i < layers; i++) {
      const layerVol = Math.max(0, currentVol - i * 0.1);
      const r = 80 + i * 20 + layerVol * maxRadius + Math.sin(phaseRef.current + i) * 5;
      const opacity = 0.6 - i * 0.2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.max(0, r), 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${color}, ${opacity})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, 60 + currentVol * 20, 0, 2 * Math.PI);
    ctx.fillStyle = `rgb(${color})`;
    ctx.fill();

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, volume, source]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="w-full h-full object-contain"
    />
  );
};

export default Visualizer;
