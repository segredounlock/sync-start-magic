import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Move, Hand } from "lucide-react";

interface ImageCropperProps {
  file: File;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({ file, onCrop, onCancel }: ImageCropperProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [cropping, setCropping] = useState(false);
  const [ready, setReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const CROP_SIZE = 300;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const aspect = img.naturalWidth / img.naturalHeight;
    let w: number, h: number;
    if (aspect > 1) {
      h = CROP_SIZE;
      w = CROP_SIZE * aspect;
    } else {
      w = CROP_SIZE;
      h = CROP_SIZE / aspect;
    }
    setImgSize({ w, h });
    setOffset({ x: 0, y: 0 });
    const coverScale = Math.max(CROP_SIZE / w, CROP_SIZE / h);
    setScale(coverScale);
    setTimeout(() => setReady(true), 50);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const maxX = Math.max(0, (imgSize.w * scale - CROP_SIZE) / 2);
    const maxY = Math.max(0, (imgSize.h * scale - CROP_SIZE) / 2);
    setOffset({
      x: Math.max(-maxX, Math.min(maxX, newX)),
      y: Math.max(-maxY, Math.min(maxY, newY)),
    });
  };

  const handlePointerUp = () => setDragging(false);

  const coverScale = imgSize.w > 0 ? Math.max(CROP_SIZE / imgSize.w, CROP_SIZE / imgSize.h) : 1;

  const clampOffset = (newScale: number) => {
    const maxX = Math.max(0, (imgSize.w * newScale - CROP_SIZE) / 2);
    const maxY = Math.max(0, (imgSize.h * newScale - CROP_SIZE) / 2);
    setOffset(o => ({
      x: Math.max(-maxX, Math.min(maxX, o.x)),
      y: Math.max(-maxY, Math.min(maxY, o.y)),
    }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(s => {
      const next = Math.max(coverScale, Math.min(3, s + delta));
      clampOffset(next);
      return next;
    });
  };

  const handleCrop = () => {
    if (!imgRef.current || cropping) return;
    setCropping(true);
    const canvas = document.createElement("canvas");
    const outputSize = 512;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d")!;

    const img = imgRef.current;
    const scaleRatio = img.naturalWidth / (imgSize.w * scale);
    const cropX = ((imgSize.w * scale - CROP_SIZE) / 2 - offset.x) * scaleRatio;
    const cropY = ((imgSize.h * scale - CROP_SIZE) / 2 - offset.y) * scaleRatio;
    const cropW = CROP_SIZE * scaleRatio;
    const cropH = CROP_SIZE * scaleRatio;

    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputSize, outputSize);
    canvas.toBlob((blob) => {
      setCropping(false);
      if (blob) onCrop(blob);
    }, "image/png", 1);
  };

  const zoom = (delta: number) => setScale(s => {
    const next = Math.max(coverScale, Math.min(3, s + delta));
    clampOffset(next);
    return next;
  });
  const reset = () => { setScale(coverScale); setOffset({ x: 0, y: 0 }); };
  const zoomPercent = Math.round(((scale - coverScale) / (3 - coverScale)) * 100);
  const canDrag = scale > coverScale + 0.01;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-lg px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 28, stiffness: 300, mass: 0.8 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex items-center justify-between px-5 py-4"
          >
            <h3 className="text-base font-bold text-foreground">Ajustar foto</h3>
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>

          {/* Crop area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", damping: 22, stiffness: 260 }}
            className="flex items-center justify-center px-6 pb-4"
          >
            <div className="relative" style={{ width: CROP_SIZE + 8, height: CROP_SIZE + 8 }}>
              {/* Outer ring — pulses while dragging */}
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: dragging
                    ? [
                        "0 0 0 2px hsl(var(--primary) / 0.5)",
                        "0 0 0 4px hsl(var(--primary) / 0.3)",
                        "0 0 0 2px hsl(var(--primary) / 0.5)",
                      ]
                    : "0 0 0 2px hsl(var(--primary) / 0.25)",
                }}
                transition={dragging ? { duration: 1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.5), hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.5))",
                  padding: 3,
                }}
              >
                <div className="w-full h-full rounded-full bg-black/40" />
              </motion.div>

              {/* Image container */}
              <motion.div
                ref={containerRef}
                className="absolute rounded-full overflow-hidden touch-none"
                animate={{
                  cursor: dragging ? "grabbing" : canDrag ? "grab" : "default",
                }}
                style={{
                  width: CROP_SIZE,
                  height: CROP_SIZE,
                  top: 4,
                  left: 4,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onWheel={handleWheel}
              >
                {imageUrl && (
                  <motion.img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Preview"
                    onLoad={handleImageLoad}
                    draggable={false}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={ready ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute select-none"
                    style={{
                      width: imgSize.w * scale,
                      height: imgSize.h * scale,
                      left: `calc(50% - ${(imgSize.w * scale) / 2}px + ${offset.x}px)`,
                      top: `calc(50% - ${(imgSize.h * scale) / 2}px + ${offset.y}px)`,
                      filter: dragging ? "brightness(1.05)" : "brightness(1)",
                      transition: "filter 0.2s",
                    }}
                  />
                )}

                {/* Crosshair guide while dragging */}
                <AnimatePresence>
                  {dragging && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                      <div className="w-10 h-[1px] bg-white/30 rounded-full" />
                      <div className="absolute w-[1px] h-10 bg-white/30 rounded-full" />
                      {/* Corner marks */}
                      <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/25 rounded-tl" />
                      <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/25 rounded-tr" />
                      <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/25 rounded-bl" />
                      <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/25 rounded-br" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Vignette overlay */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-full"
                  style={{
                    background: "radial-gradient(circle, transparent 60%, rgba(0,0,0,0.15) 100%)",
                  }}
                />
              </motion.div>

              {/* Drag hint */}
              <AnimatePresence>
                {!dragging && canDrag && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ type: "spring", damping: 15, stiffness: 300 }}
                    className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 pointer-events-none"
                  >
                    <Hand className="h-3 w-3 text-white/70" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className="px-5 pb-2 space-y-4"
          >
            {/* Zoom controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => zoom(-0.15)}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 active:scale-90 transition-all text-muted-foreground"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="range"
                  min={coverScale}
                  max="3"
                  step="0.02"
                  value={scale}
                  onChange={(e) => { const v = Number(e.target.value); setScale(v); clampOffset(v); }}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted/50"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${zoomPercent}%, hsl(var(--muted) / 0.5) ${zoomPercent}%, hsl(var(--muted) / 0.5) 100%)`,
                  }}
                />
                {/* Zoom percentage badge */}
                <AnimatePresence>
                  {zoomPercent > 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -top-5 text-[10px] font-medium text-primary"
                      style={{ left: `${zoomPercent}%`, transform: "translateX(-50%)" }}
                    >
                      {zoomPercent}%
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => zoom(0.15)}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 active:scale-90 transition-all text-muted-foreground"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                onClick={reset}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 active:scale-90 transition-all text-muted-foreground"
                title="Resetar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:bg-muted/40 transition-all"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCrop}
                disabled={cropping}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {cropping ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-[10px] text-muted-foreground/60 text-center pb-4 pt-1 px-4"
          >
            Arraste para posicionar · Scroll ou slider para zoom
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
