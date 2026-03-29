import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Push Notifications hook.
 * - Reativa o fluxo automático no login
 * - Re-sincroniza subscriptions existentes
 * - Escuta mudanças de subscription no Service Worker
 */
export function usePushNotifications(userId: string | undefined) {
  const registeredRef = useRef(false);

  const getOrRegisterServiceWorker = useCallback(async () => {
    let reg = await navigator.serviceWorker.getRegistration("/sw-push.js");
    if (reg) return reg;

    reg = await navigator.serviceWorker.register("/sw-push.js");
    await reg.update();

    if (!reg.active) {
      await new Promise<void>((resolve) => {
        const sw = reg!.installing || reg!.waiting;
        if (!sw) {
          resolve();
          return;
        }
        sw.addEventListener("statechange", () => {
          if (sw.state === "activated") resolve();
        });
      });
    }

    return reg;
  }, []);

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

  const ensurePushSubscription = useCallback(async (uid: string, reg: ServiceWorkerRegistration) => {
    const existingSub = await reg.pushManager.getSubscription();
    if (existingSub) {
      await saveSubscription(uid, existingSub.toJSON());
      registeredRef.current = true;
      console.log("[Push] Existing subscription refreshed");
      return;
    }

    const { data: setupData, error: setupErr } = await supabase.functions.invoke("vapid-setup");
    if (setupErr || !setupData?.publicKey) {
      throw new Error("VAPID setup failed");
    }

    const applicationServerKey = new Uint8Array(urlBase64ToUint8Array(setupData.publicKey));

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    await saveSubscription(uid, subscription.toJSON());
    registeredRef.current = true;
    console.log("[Push] New subscription created automatically");
  }, [saveSubscription]);

  const autoRegisterPush = useCallback(async () => {
    if (!userId || registeredRef.current) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    try {
      const reg = await getOrRegisterServiceWorker();
      const permission = Notification.permission;

      if (permission === "granted") {
        await ensurePushSubscription(userId, reg);
        return;
      }

      if (permission === "denied") {
        try { localStorage.setItem("notif_permission_declined", "1"); } catch {}
        return;
      }

      if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("push_auto_prompt_seen") === "1") {
        return;
      }

      if (typeof localStorage !== "undefined" && localStorage.getItem("notif_permission_declined") === "1") {
        return;
      }

      try { sessionStorage.setItem("push_auto_prompt_seen", "1"); } catch {}

      const requested = await Notification.requestPermission();
      if (requested === "granted") {
        await ensurePushSubscription(userId, reg);
      } else if (requested === "denied") {
        try { localStorage.setItem("notif_permission_declined", "1"); } catch {}
      }
    } catch (err) {
      console.error("[Push] Auto register failed:", err);
    }
  }, [ensurePushSubscription, getOrRegisterServiceWorker, userId]);

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
    autoRegisterPush();
  }, [autoRegisterPush]);
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
