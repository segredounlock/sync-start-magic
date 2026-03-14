import { useRef, useEffect, useState, useCallback } from "react";

interface ScratchCanvasProps {
  grid: number[];
  onScratchComplete: () => void;
  disabled?: boolean;
}

const COLS = 3;
const ROWS = 3;
const CELL_PAD = 4;
const BRUSH = 24;
const SCRATCH_THRESHOLD = 0.50;

export function ScratchCanvas({ grid, onScratchComplete, disabled }: ScratchCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const underlayRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [revealed, setRevealed] = useState(false);
  const hasCompleted = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      // Make cells more compact/square
      const maxW = Math.min(width, 380);
      const cellW = (maxW - CELL_PAD * (COLS + 1)) / COLS;
      const cellH = cellW * 0.75;
      const h = cellH * ROWS + CELL_PAD * (ROWS + 1);
      setSize({ w: Math.floor(maxW), h: Math.floor(h) });
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

    // Background - match card bg
    ctx.fillStyle = "#f1f5f9";
    roundRect(ctx, 0, 0, size.w, size.h, 14);
    ctx.fill();

    for (let i = 0; i < 9; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = CELL_PAD + col * (cellW + CELL_PAD);
      const y = CELL_PAD + row * (cellH + CELL_PAD);

      // Cell bg with subtle gradient
      const cellGrad = ctx.createLinearGradient(x, y, x, y + cellH);
      cellGrad.addColorStop(0, "#ffffff");
      cellGrad.addColorStop(1, "#f0fdf4");
      ctx.fillStyle = cellGrad;
      roundRect(ctx, x, y, cellW, cellH, 8);
      ctx.fill();

      // Cell border
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, cellW, cellH, 8);
      ctx.stroke();

      // Money emoji - smaller
      const minDim = Math.min(cellW, cellH);
      ctx.font = `${minDim * 0.18}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💰", x + cellW / 2, y + cellH * 0.32);

      // Value - smaller font
      ctx.fillStyle = "#16a34a";
      ctx.font = `bold ${minDim * 0.20}px system-ui, -apple-system, sans-serif`;
      ctx.fillText(`R$${grid[i].toFixed(2)}`, x + cellW / 2, y + cellH * 0.66);
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

    // Rounded bg to match container
    ctx.fillStyle = "#e2e8f0";
    roundRect(ctx, 0, 0, size.w, size.h, 14);
    ctx.fill();

    for (let i = 0; i < 9; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = CELL_PAD + col * (cellW + CELL_PAD);
      const y = CELL_PAD + row * (cellH + CELL_PAD);

      // Silver gradient per cell
      const grad = ctx.createLinearGradient(x, y, x + cellW, y + cellH);
      grad.addColorStop(0, "#b8b8b8");
      grad.addColorStop(0.2, "#d4d4d4");
      grad.addColorStop(0.4, "#e0e0e0");
      grad.addColorStop(0.6, "#d0d0d0");
      grad.addColorStop(0.8, "#c8c8c8");
      grad.addColorStop(1, "#b0b0b0");
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, cellW, cellH, 8);
      ctx.fill();

      // Subtle inner highlight
      const highlight = ctx.createLinearGradient(x, y, x, y + cellH * 0.4);
      highlight.addColorStop(0, "rgba(255,255,255,0.35)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      roundRect(ctx, x + 2, y + 2, cellW - 4, cellH * 0.4, 6);
      ctx.fill();

      // Question mark
      const minDim = Math.min(cellW, cellH);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = `bold ${minDim * 0.30}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", x + cellW / 2, y + cellH / 2);
    }

    // Shimmer dots
    for (let i = 0; i < 20; i++) {
      const sx = CELL_PAD + Math.random() * (size.w - CELL_PAD * 2);
      const sy = CELL_PAD + Math.random() * (size.h - CELL_PAD * 2);
      ctx.fillStyle = `rgba(255,255,255,${0.2 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8 + Math.random() * 1.2, 0, Math.PI * 2);
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
    <div ref={containerRef} className="w-full select-none flex justify-center">
      {size.w > 0 && (
        <div className="relative rounded-2xl overflow-hidden shadow-sm" style={{ width: size.w, height: size.h }}>
          <canvas
            ref={underlayRef}
            className="absolute inset-0"
            style={{ width: size.w, height: size.h }}
          />
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
        <p className="text-xs text-muted-foreground text-center mt-2.5 animate-pulse absolute -bottom-7">
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
