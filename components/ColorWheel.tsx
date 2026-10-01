"use client";

import { useEffect, useRef } from "react";
import { HARMONIES, type HarmonyName, harmonyColors, hexToHsv, hsvToHex } from "@/lib/color";

const SIZE = 200; // css px
const R = SIZE / 2;

type Props = { color: string; harmony: HarmonyName };

export default function ColorWheel({ color, harmony }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the disc once: hue = angle, saturation = distance from centre (value fixed at 1)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const px = Math.round(SIZE * dpr);
    canvas.width = px;
    canvas.height = px;
    const img = ctx.createImageData(px, px);
    const r = px / 2;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const dx = x + 0.5 - r;
        const dy = y + 0.5 - r;
        const dist = Math.hypot(dx, dy);
        const alpha = Math.min(1, Math.max(0, r - dist + 0.5)); // soft edge
        if (alpha === 0) continue;
        const hue = (Math.atan2(-dy, dx) * 180) / Math.PI;
        const hex = hsvToHex(hue, Math.min(1, dist / r), 1);
        const i = (y * px + x) * 4;
        img.data[i] = parseInt(hex.slice(1, 3), 16);
        img.data[i + 1] = parseInt(hex.slice(3, 5), 16);
        img.data[i + 2] = parseInt(hex.slice(5, 7), 16);
        img.data[i + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(img, 0, 0);
  }, []);

  const [h, s] = hexToHsv(color);
  const offsets = HARMONIES[harmony];
  const colors = harmonyColors(color, offsets);
  const pts = offsets.map((off) => {
    const a = ((h + off) * Math.PI) / 180;
    return { x: R + s * (R - 1) * Math.cos(a), y: R - s * (R - 1) * Math.sin(a) };
  });

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} aria-hidden />
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}
           className="absolute inset-0" role="img"
           aria-label={`${harmony} harmony of ${color} on the color wheel`}>
        <circle cx={R} cy={R} r={R - 0.5} fill="none" stroke="#6e6e6e" strokeWidth={1} />
        {pts.length === 2 ? (
          <line x1={pts[0].x} y1={pts[0].y} x2={pts[1].x} y2={pts[1].y}
                stroke="#222" strokeWidth={2} />
        ) : (
          <polygon points={pts.map((p) => `${p.x},${p.y}`).join(" ")}
                   fill="none" stroke="#222" strokeWidth={2} strokeLinejoin="round" />
        )}
        {pts.map((p, i) => {
          const r = offsets[i] === 0 ? 10 : 7;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={r + 2} fill="#222" />
              <circle cx={p.x} cy={p.y} r={r} fill="#fff" />
              <circle cx={p.x} cy={p.y} r={r - 2} fill={colors[i]} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
