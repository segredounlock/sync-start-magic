import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const EVENTS = ["mousedown", "keydown", "touchstart", "scroll", "mousemove"];

export function useInactivityTimeout() {
  const { user } = useAuth();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loggedOutRef = useRef(false);

  const logout = useCallback(async () => {
    if (loggedOutRef.current) return;
    loggedOutRef.current = true;
    try {
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (!user) return;
    loggedOutRef.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(logout, INACTIVITY_TIMEOUT_MS);
  }, [user, logout]);

  useEffect(() => {
    if (!user) return;

    resetTimer();

    const handler = () => resetTimer();
    for (const event of EVENTS) {
      window.addEventListener(event, handler, { passive: true });
    }

    return () => {
      for (const event of EVENTS) {
        window.removeEventListener(event, handler);
      }
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [user, resetTimer]);
}
