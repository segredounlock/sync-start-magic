import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Check, X, RotateCcw } from "lucide-react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const CROP_SIZE = 280;

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
    setScale(1);
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
    // Limit panning so image stays within crop area
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
    setScale(s => Math.max(0.5, Math.min(3, s + delta)));
  };

  const handleCrop = () => {
    if (!imgRef.current) return;
    const canvas = document.createElement("canvas");
    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d")!;

    const img = imgRef.current;
    const scaleRatio = img.naturalWidth / (imgSize.w * scale);
    const cropX = ((imgSize.w * scale - CROP_SIZE) / 2 - offset.x) * scaleRatio;
    const cropY = ((imgSize.h * scale - CROP_SIZE) / 2 - offset.y) * scaleRatio;
    const cropW = CROP_SIZE * scaleRatio;
    const cropH = CROP_SIZE * scaleRatio;

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outputSize, outputSize);
    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, "image/jpeg", 0.9);
  };

  const zoom = (delta: number) => setScale(s => Math.max(0.5, Math.min(3, s + delta)));
  const reset = () => { setScale(1); setOffset({ x: 0, y: 0 }); };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Ajustar foto</h3>
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Crop area */}
          <div className="flex items-center justify-center p-6 bg-black/30">
            <div
              ref={containerRef}
              className="relative overflow-hidden rounded-full border-2 border-primary/50 cursor-grab active:cursor-grabbing touch-none"
              style={{ width: CROP_SIZE, height: CROP_SIZE }}
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
              {/* Circular overlay guide */}
              <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 pointer-events-none" />
            </div>
          </div>

          {/* Controls */}
          <div className="px-4 py-3 border-t border-border space-y-3">
            {/* Zoom slider */}
            <div className="flex items-center gap-3">
              <button onClick={() => zoom(-0.15)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
                <ZoomOut className="h-4 w-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="flex-1 h-1.5 accent-primary cursor-pointer"
              />
              <button onClick={() => zoom(0.15)} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground">
                <ZoomIn className="h-4 w-4" />
              </button>
              <button onClick={reset} className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground" title="Resetar">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted/50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrop}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Confirmar
              </button>
            </div>
          </div>

          <p className="text-[10px] text-muted-foreground text-center pb-3 px-4">
            Arraste para posicionar · Use o zoom para ajustar
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
