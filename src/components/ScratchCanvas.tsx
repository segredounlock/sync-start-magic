import { useRef, useEffect, useState, useCallback } from "react";

interface ScratchCanvasProps {
  grid: number[];
  onScratchComplete: () => void;
  disabled?: boolean;
}

const COLS = 3;
const ROWS = 3;
const CELL_PAD = 6;
const BRUSH = 28;
const SCRATCH_THRESHOLD = 0.55; // 55% scratched to auto-reveal

export function ScratchCanvas({ grid, onScratchComplete, disabled }: ScratchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const underlayRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [revealed, setRevealed] = useState(false);
  const hasCompleted = useRef(false);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      const cellW = (width - CELL_PAD * 2) / COLS;
      const h = cellW * ROWS + CELL_PAD * 2;
      setSize({ w: Math.floor(width), h: Math.floor(h) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Draw underlay (prize values)
  useEffect(() => {
    const cvs = underlayRef.current;
    if (!cvs || size.w === 0 || grid.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = size.w * dpr;
    cvs.height = size.h * dpr;
    cvs.style.width = `${size.w}px`;
    cvs.style.height = `${size.h}px`;
    const ctx = cvs.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cellW = (size.w - CELL_PAD * (COLS + 1)) / COLS;
    const cellH = (size.h - CELL_PAD * (ROWS + 1)) / ROWS;

    // Background
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, size.w, size.h);

    for (let i = 0; i < 9; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = CELL_PAD + col * (cellW + CELL_PAD);
      const y = CELL_PAD + row * (cellH + CELL_PAD);

      // Cell bg
      ctx.fillStyle = "#e2e8f0";
      roundRect(ctx, x, y, cellW, cellH, 10);
      ctx.fill();

      // Emoji
      ctx.font = `${Math.min(cellW, cellH) * 0.22}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💰", x + cellW / 2, y + cellH * 0.35);

      // Value
      ctx.fillStyle = "#0f172a";
      ctx.font = `bold ${Math.min(cellW, cellH) * 0.28}px system-ui, sans-serif`;
      ctx.fillText(`R$${grid[i].toFixed(2)}`, x + cellW / 2, y + cellH * 0.65);
    }
  }, [size, grid]);

  // Draw scratch overlay (silver layer)
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs || size.w === 0 || revealed) return;
    const dpr = window.devicePixelRatio || 1;
    cvs.width = size.w * dpr;
    cvs.height = size.h * dpr;
    cvs.style.width = `${size.w}px`;
    cvs.style.height = `${size.h}px`;
    const ctx = cvs.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const cellW = (size.w - CELL_PAD * (COLS + 1)) / COLS;
    const cellH = (size.h - CELL_PAD * (ROWS + 1)) / ROWS;

    // Draw silver cells with rounded corners
    for (let i = 0; i < 9; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = CELL_PAD + col * (cellW + CELL_PAD);
      const y = CELL_PAD + row * (cellH + CELL_PAD);

      // Silver gradient
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, "#c0c0c0");
      grad.addColorStop(0.3, "#d8d8d8");
      grad.addColorStop(0.5, "#e8e8e8");
      grad.addColorStop(0.7, "#d0d0d0");
      grad.addColorStop(1, "#b0b0b0");
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, cellW, cellH, 10);
      ctx.fill();

      // Question mark
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = `bold ${Math.min(cellW, cellH) * 0.35}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", x + cellW / 2, y + cellH / 2);
    }

    // Add shimmer dots
    for (let i = 0; i < 30; i++) {
      const sx = Math.random() * size.w;
      const sy = Math.random() * size.h;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1 + Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [size, revealed]);

  const getPos = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const cvs = canvasRef.current;
    if (!cvs) return null;
    const rect = cvs.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const scratch = useCallback((x: number, y: number) => {
    const cvs = canvasRef.current;
    if (!cvs || revealed || disabled) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx = cvs.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x * dpr, y * dpr, BRUSH * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }, [revealed, disabled]);

  const checkProgress = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs || hasCompleted.current || revealed) return;
    const dpr = window.devicePixelRatio || 1;
    const ctx = cvs.getContext("2d")!;
    const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height);
    const pixels = imageData.data;
    let transparent = 0;
    const total = pixels.length / 4;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparent++;
    }
    if (transparent / total >= SCRATCH_THRESHOLD) {
      hasCompleted.current = true;
      setRevealed(true);
      onScratchComplete();
    }
  }, [revealed, onScratchComplete]);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (disabled || revealed) return;
    e.preventDefault();
    isDrawing.current = true;
    const pos = getPos(e);
    if (pos) scratch(pos.x, pos.y);
  }, [disabled, revealed, getPos, scratch]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current || disabled || revealed) return;
    e.preventDefault();
    const pos = getPos(e);
    if (pos) scratch(pos.x, pos.y);
  }, [disabled, revealed, getPos, scratch]);

  const handleEnd = useCallback(() => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    checkProgress();
  }, [checkProgress]);

  return (
    <div ref={containerRef} className="w-full select-none">
      {size.w > 0 && (
        <div className="relative rounded-2xl overflow-hidden" style={{ width: size.w, height: size.h }}>
          {/* Underlay - prize values */}
          <canvas
            ref={underlayRef}
            className="absolute inset-0"
            style={{ width: size.w, height: size.h }}
          />
          {/* Scratch overlay */}
          {!revealed && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-pointer"
              style={{ width: size.w, height: size.h, touchAction: "none" }}
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
            />
          )}
        </div>
      )}
      {!revealed && !disabled && (
        <p className="text-xs text-muted-foreground text-center mt-2 animate-pulse">
          👆 Arraste o dedo para raspar!
        </p>
      )}
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
