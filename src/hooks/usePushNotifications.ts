import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Enhanced Push Notifications hook.
 * - Auto-generates VAPID keys via edge function
 * - Registers Web Push subscription (per-device, multi-device support)
 * - Listens for subscription changes from SW and re-saves
 * - Requests periodic sync keep-alive for faster delivery
 * - Re-subscribes every session to keep tokens fresh
 */
export function usePushNotifications(userId: string | undefined) {
  const registeredRef = useRef(false);

  const saveSubscription = useCallback(async (
    uid: string,
    json: PushSubscriptionJSON
  ) => {
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

    // Use endpoint as unique key (supports multi-device)
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

  const registerPush = useCallback(async () => {
    if (!userId || registeredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      // 1. Ensure VAPID keys exist
      const { data: setupData, error: setupErr } = await supabase.functions.invoke("vapid-setup");
      if (setupErr || !setupData?.publicKey) {
        console.warn("[Push] Failed to setup VAPID keys:", setupErr);
        return;
      }

      const vapidPublicKey = setupData.publicKey;

      // 2. Check notification permission — don't re-prompt if already denied
      if (Notification.permission === "denied") {
        console.log("[Push] Notification permission previously denied");
        return;
      }
      if (Notification.permission === "default" && localStorage.getItem("notif_permission_declined")) {
        console.log("[Push] Notification permission previously declined by user");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("[Push] Notification permission denied");
        if (permission === "denied") {
          try { localStorage.setItem("notif_permission_declined", "1"); } catch {}
        }
        return;
      }

      // 3. Register dedicated push service worker
      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.register("/sw-push.js");
        await registration.update();
        // Wait until active
        if (!registration.active) {
          await new Promise<void>((resolve) => {
            const sw = registration.installing || registration.waiting;
            if (!sw) { resolve(); return; }
            sw.addEventListener("statechange", () => { if (sw.state === "activated") resolve(); });
          });
        }
      } catch (e) {
        console.error("[Push] SW registration failed:", e);
        return;
      }

      // 4. Check existing subscription — re-subscribe if VAPID key changed
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        const existingKey = existingSub.options?.applicationServerKey;
        const newKeyArray = urlBase64ToUint8Array(vapidPublicKey);
        const existingKeyArray = existingKey ? new Uint8Array(existingKey as ArrayBuffer) : null;

        const keysMatch = existingKeyArray &&
          existingKeyArray.length === newKeyArray.length &&
          existingKeyArray.every((v, i) => v === newKeyArray[i]);

        if (!keysMatch) {
          console.log("[Push] VAPID key changed, re-subscribing...");
          await existingSub.unsubscribe();
        }
      }

      // 5. Subscribe to push
      const appServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });

      // 6. Save subscription to database
      await saveSubscription(userId, subscription.toJSON());

      // 7. Request periodic sync keep-alive (if supported)
      try {
        if ("periodicSync" in registration) {
          const status = await navigator.permissions.query({ name: "periodic-background-sync" as any });
          if (status.state === "granted") {
            await (registration as any).periodicSync.register("push-keepalive", {
              minInterval: 12 * 60 * 60 * 1000, // 12 hours
            });
            console.log("[Push] Periodic sync keep-alive registered");
          }
        }
      } catch {
        // Not supported — that's fine
      }

      registeredRef.current = true;
      console.log("[Push] Subscription registered successfully");
    } catch (err) {
      console.error("[Push] Registration failed:", err);
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
