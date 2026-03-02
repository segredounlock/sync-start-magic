// Service Worker for Push Notifications
// This file handles background push events when the browser is minimized

self.addEventListener("push", (event) => {
  let data = { title: "Recargas Brasil", body: "Nova notificação" };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    try {
      data.body = event.data?.text() || data.body;
    } catch {}
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.png",
    badge: "/favicon.png",
    vibrate: [200, 100, 200],
    tag: data.title,
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
