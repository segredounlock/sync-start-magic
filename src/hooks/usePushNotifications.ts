import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that registers a Web Push subscription for the current user.
 * Must be called inside an authenticated context.
 * Requires VAPID_PUBLIC_KEY env var.
 */
export function usePushNotifications(userId: string | undefined) {
  const registeredRef = useRef(false);

  const registerPush = useCallback(async () => {
    if (!userId || registeredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn("[Push] VITE_VAPID_PUBLIC_KEY not configured");
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("[Push] Notification permission denied");
        return;
      }

      // Wait for service worker
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      // Save to database
      await (supabase.from("push_subscriptions" as any) as any).upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }, { onConflict: "user_id,endpoint" });

      registeredRef.current = true;
      console.log("[Push] Subscription registered successfully");
    } catch (err) {
      console.error("[Push] Registration failed:", err);
    }
  }, [userId]);

  useEffect(() => {
    registerPush();
  }, [registerPush]);
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
