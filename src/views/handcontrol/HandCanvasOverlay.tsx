"use client";

import { useRef, useEffect } from "react";
import type { HandResult } from "@/models/types/hand";
import { HAND_CONNECTIONS } from "@/models/types/hand";

interface Props {
  hands: HandResult[];
  width: number;
  height: number;
}

const COLORS = ["#818cf8", "#34d399"]; // indigo, emerald per hand

export function HandCanvasOverlay({ hands, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    hands.forEach((hand, hi) => {
      const color = COLORS[hi % COLORS.length];
      const lms = hand.landmarks;
      const toX = (x: number) => (1 - x) * width; // mirror (selfie)
      const toY = (y: number) => y * height;

      // Draw connections
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.7;
      HAND_CONNECTIONS.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(toX(lms[a].x), toY(lms[a].y));
        ctx.lineTo(toX(lms[b].x), toY(lms[b].y));
        ctx.stroke();
      });

      // Draw landmark nodes
      ctx.globalAlpha = 1;
      lms.forEach((lm, i) => {
        const isTip = [4, 8, 12, 16, 20].includes(i);
        ctx.beginPath();
        ctx.arc(toX(lm.x), toY(lm.y), isTip ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? "#fff" : color;
        ctx.shadowBlur = isTip ? 8 : 4;
        ctx.shadowColor = color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });
  }, [hands, width, height]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0"
    />
  );
}
