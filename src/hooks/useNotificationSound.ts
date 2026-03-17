import { useCallback, useRef } from "react";

const SOUNDS: Record<string, string> = {
  message: "/sounds/pix.mp3",
};

export function useNotificationSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((sound: keyof typeof SOUNDS = "message") => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUNDS[sound] || SOUNDS.message);
        audioRef.current.volume = 0.5;
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  return { playSound };
}
