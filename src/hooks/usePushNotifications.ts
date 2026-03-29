import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Push Notifications hook (improved).
 * - Does NOT auto-request permission (soft ask pattern)
 * - Only re-subscribes silently if permission is already "granted"
 * - Listens for subscription changes from SW and re-saves
 */
export function usePushNotifications(userId: string | undefined) {
  const registeredRef = useRef(false);

  const saveSubscription = useCallback(async (
    uid: string,
    json: PushSubscriptionJSON
  ) => {
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

    const { error } = await (supabase.from("push_subscriptions" as any) as any).upsert({
      user_id: uid,
      endpoint: json.endpoint,
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    }, { onConflict: "user_id,endpoint" });

    if (error) {
      console.error("[Push] Failed to save subscription:", error);
    }
  }, []);

  // Silent re-subscribe only if permission already granted
  const silentResubscribe = useCallback(async () => {
    if (!userId || registeredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission !== "granted") return;

    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
      if (!reg) return;

      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) {
        // Re-save to keep DB fresh
        await saveSubscription(userId, existingSub.toJSON());
        registeredRef.current = true;
        console.log("[Push] Existing subscription refreshed");
      }
    } catch (err) {
      console.error("[Push] Silent resubscribe failed:", err);
    }
  }, [userId, saveSubscription]);

  // Listen for subscription changes from Service Worker
  useEffect(() => {
    if (!userId || !("serviceWorker" in navigator)) return;

    const handler = (event: MessageEvent) => {
      if (event.data?.type === "PUSH_SUBSCRIPTION_CHANGED" && event.data.subscription) {
        console.log("[Push] Subscription changed via SW, saving new keys...");
        saveSubscription(userId, event.data.subscription);
      }
    };

    navigator.serviceWorker.addEventListener("message", handler);
    return () => navigator.serviceWorker.removeEventListener("message", handler);
  }, [userId, saveSubscription]);

  useEffect(() => {
    silentResubscribe();
  }, [silentResubscribe]);
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
