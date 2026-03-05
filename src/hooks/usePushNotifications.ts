import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that auto-generates VAPID keys (if needed) and registers
 * a Web Push subscription for the current user.
 * Re-subscribes every session to keep push tokens fresh.
 */
export function usePushNotifications(userId: string | undefined) {
  const registeredRef = useRef(false);

  const registerPush = useCallback(async () => {
    if (!userId || registeredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      // 1. Ensure VAPID keys exist (auto-generate if needed)
      const { data: setupData, error: setupErr } = await supabase.functions.invoke("vapid-setup");
      if (setupErr || !setupData?.publicKey) {
        console.warn("[Push] Failed to setup VAPID keys:", setupErr);
        return;
      }

      const vapidPublicKey = setupData.publicKey;

      // 2. Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("[Push] Notification permission denied");
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

      // 4. Check existing subscription - unsubscribe if keys changed
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

      // 5. Subscribe to push (reuses existing if valid, creates new if needed)
      const appServerKey = urlBase64ToUint8Array(vapidPublicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey.buffer as ArrayBuffer,
      });

      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

      // 6. Save/update subscription in database
      const { error: upsertError } = await (supabase.from("push_subscriptions" as any) as any).upsert({
        user_id: userId,
        endpoint: json.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
      }, { onConflict: "user_id,endpoint" });

      if (upsertError) {
        console.error("[Push] Failed to save subscription:", upsertError);
        return;
      }

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
