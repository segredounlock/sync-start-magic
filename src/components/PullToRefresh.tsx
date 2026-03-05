import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS
  if ((navigator as any).standalone === true) return true;
  // Android / Desktop PWA
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  return false;
}

const THRESHOLD = 80;

export default function PullToRefresh() {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const active = useRef(false);
  const vibratedRef = useRef(false);

  const vibrate = useCallback((pattern: number | number[]) => {
    try { navigator.vibrate?.(pattern); } catch {}
  }, []);

  const onTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    active.current = true;
    vibratedRef.current = false;
  }, [refreshing]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!active.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy < 0) { setPullDistance(0); return; }
    const dist = Math.min(dy * 0.5, 140);
    setPullDistance(dist);
    setPulling(dist > 0);
    if (dist > 10) e.preventDefault();

    // Haptic feedback when crossing threshold
    if (dist >= THRESHOLD && !vibratedRef.current) {
      vibratedRef.current = true;
      vibrate(15);
    } else if (dist < THRESHOLD && vibratedRef.current) {
      vibratedRef.current = false;
    }
  }, [refreshing, vibrate]);

  const onTouchEnd = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    if (pullDistance >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullDistance(THRESHOLD);
      vibrate([10, 30, 10]); // Confirm vibration
      setTimeout(() => window.location.reload(), 400);
    } else {
      setPulling(false);
      setPullDistance(0);
    }
  }, [pullDistance, refreshing]);

  useEffect(() => {
    if (!isStandalone()) return;

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);

  // Don't render anything if not standalone
  if (typeof window !== "undefined" && !isStandalone()) return null;

  const progress = Math.min(pullDistance / THRESHOLD, 1);
  const ready = progress >= 1;

  if (!pulling && !refreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex justify-center pointer-events-none"
      style={{ transform: `translateY(${pullDistance - 48}px)`, transition: pulling ? "none" : "transform 0.3s ease" }}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border border-border/50 ${
          ready || refreshing ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
        }`}
        style={{ transition: "background 0.2s, color 0.2s" }}
      >
        <RefreshCw
          className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
          style={{
            transform: refreshing ? undefined : `rotate(${progress * 360}deg)`,
            transition: pulling ? "none" : "transform 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}
