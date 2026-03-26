import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Check, X, RotateCcw, Move } from "lucide-react";

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
    const minScale = Math.max(CROP_SIZE / w, CROP_SIZE / h);
    setScale(Math.max(1, minScale));
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

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const minScaleVal = imgSize.w > 0 ? Math.max(CROP_SIZE / imgSize.w, CROP_SIZE / imgSize.h) : 0.5;
    setScale(s => Math.max(minScaleVal, Math.min(3, s + delta)));
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

    // Draw circular clip for cleaner output
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

  const minScale = imgSize.w > 0 ? Math.max(CROP_SIZE / imgSize.w, CROP_SIZE / imgSize.h) : 0.5;
  const zoom = (delta: number) => setScale(s => Math.max(minScale, Math.min(3, s + delta)));
  const reset = () => { setScale(Math.max(1, minScale)); setOffset({ x: 0, y: 0 }); };
  const zoomPercent = Math.round(((scale - minScale) / (3 - minScale)) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-[400px] bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-base font-bold text-foreground">Ajustar foto</h3>
            <button onClick={onCancel} className="p-2 rounded-xl hover:bg-muted/60 transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Crop area */}
          <div className="flex items-center justify-center px-6 pb-4">
            <div className="relative" style={{ width: CROP_SIZE + 8, height: CROP_SIZE + 8 }}>
              {/* Decorative outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, hsl(var(--primary) / 0.6), hsl(var(--primary) / 0.1), hsl(var(--primary) / 0.6))",
                  padding: 3,
                }}
              >
                <div className="w-full h-full rounded-full bg-black/40" />
              </div>

              {/* Image container */}
              <div
                ref={containerRef}
                className="absolute rounded-full overflow-hidden cursor-grab active:cursor-grabbing touch-none"
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
                  <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Preview"
                    onLoad={handleImageLoad}
                    draggable={false}
                    className="absolute select-none"
                    style={{
                      width: imgSize.w * scale,
                      height: imgSize.h * scale,
                      left: `calc(50% - ${(imgSize.w * scale) / 2}px + ${offset.x}px)`,
                      top: `calc(50% - ${(imgSize.h * scale) / 2}px + ${offset.y}px)`,
                    }}
                  />
                )}

                {/* Center crosshair guide (subtle) */}
                {dragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 pointer-events-none flex items-center justify-center"
                  >
                    <div className="w-8 h-[1px] bg-white/40" />
                    <div className="absolute w-[1px] h-8 bg-white/40" />
                  </motion.div>
                )}
              </div>

              {/* Drag hint icon */}
              {!dragging && scale > minScale + 0.1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1.5 pointer-events-none"
                >
                  <Move className="h-3 w-3 text-white/70" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-5 pb-2 space-y-4">
            {/* Zoom controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => zoom(-0.15)}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-muted-foreground"
              >
                <ZoomOut className="h-4 w-4" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="range"
                  min={minScale}
                  max="3"
                  step="0.02"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted/50"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${zoomPercent}%, hsl(var(--muted) / 0.5) ${zoomPercent}%, hsl(var(--muted) / 0.5) 100%)`,
                  }}
                />
              </div>

              <button
                onClick={() => zoom(0.15)}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-muted-foreground"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              <button
                onClick={reset}
                className="p-2 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors text-muted-foreground"
                title="Resetar"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:bg-muted/40 transition-all active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrop}
                disabled={cropping}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {cropping ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center pb-4 pt-1 px-4">
            Arraste para posicionar · Scroll ou slider para zoom
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
