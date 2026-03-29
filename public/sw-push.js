// ══════════════════════════════════════════════════════════════════
// Service Worker — Push Notifications (Enhanced)
// Handles background push, notification actions, click routing,
// badge count, auto-resubscribe and keep-alive.
// ══════════════════════════════════════════════════════════════════

const APP_ICON = "/favicon.png";
const DEFAULT_URL = "/";

// ── Push Event ──
self.addEventListener("push", (event) => {
  let data = { title: "Sistema de Recargas", body: "Nova notificação" };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    try { data.body = event.data?.text() || data.body; } catch {}
  }

  const options = {
    body: data.body,
    icon: data.icon || APP_ICON,
    badge: APP_ICON,
    image: data.image || undefined,
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || data.type || "general",
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: false,
    timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
    data: {
      url: data.url || DEFAULT_URL,
      type: data.type || "general",
      id: data.id || null,
    },
  };

  // Add action buttons based on notification type
  if (data.type === "deposit") {
    options.actions = [
      { action: "view", title: "💰 Ver Depósito" },
      { action: "dismiss", title: "Fechar" },
    ];
  } else if (data.type === "recarga") {
    options.actions = [
      { action: "view", title: "📱 Ver Recarga" },
      { action: "dismiss", title: "Fechar" },
    ];
  } else if (data.type === "new_user") {
    options.actions = [
      { action: "view", title: "👤 Ver Usuário" },
      { action: "dismiss", title: "Fechar" },
    ];
  } else if (data.actions && Array.isArray(data.actions)) {
    options.actions = data.actions;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options).then(() => {
      // Update badge count
      if (navigator.setAppBadge) {
        return updateBadgeCount();
      }
    })
  );
});

// ── Notification Click ──
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const action = event.action;
  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || DEFAULT_URL;

  // Dismiss action — just close
  if (action === "dismiss") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to focus an existing window and navigate it
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus().then((focused) => {
            if (focused && "navigate" in focused) {
              return focused.navigate(targetUrl);
            }
            return focused;
          });
        }
      }
      // No window found — open new
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }).then(() => {
      // Decrease badge after interaction
      if (navigator.setAppBadge) {
        return updateBadgeCount();
      }
    })
  );
});

// ── Notification Close (dismiss without click) ──
self.addEventListener("notificationclose", (event) => {
  // Track dismissals if needed in future
});

// ── Push Subscription Change (auto re-subscribe) ──
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("[SW] Push subscription changed, re-subscribing...");

  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription?.options || {
      userVisibleOnly: true,
    }).then((newSub) => {
      const json = newSub.toJSON();
      // Notify the app to save the new subscription
      return self.clients.matchAll({ type: "window" }).then((clientList) => {
        for (const client of clientList) {
          client.postMessage({
            type: "PUSH_SUBSCRIPTION_CHANGED",
            subscription: json,
          });
        }
      });
    }).catch((err) => {
      console.error("[SW] Failed to re-subscribe:", err);
    })
  );
});

// ── Badge Count Helper ──
async function updateBadgeCount() {
  try {
    const notifications = await self.registration.getNotifications();
    const count = notifications.length;
    if (count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.clearAppBadge();
    }
  } catch {}
}

// ── Periodic keep-alive (keeps SW active for faster push delivery) ──
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "push-keepalive") {
    event.waitUntil(Promise.resolve());
  }
});

// ── Install & Activate ──
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
