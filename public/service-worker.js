/// <reference lib="webworker" />

/**
 * Sebooth Queue Push Notification Service Worker
 * Handles incoming push events and notification click actions.
 */

self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};

    const title = data.title || "Sebooth Antrean";
    const options = {
        body: data.body || "Ada update untuk antrean kamu!",
        icon: "/logo-text-black.png",
        badge: "/logo-text-black.png",
        tag: data.tag || "queue-notification",
        data: {
            url: data.url || "/queue",
        },
        vibrate: data.vibrate || [200, 100, 200],
        requireInteraction: data.requireInteraction || false,
        actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    const url = event.notification.data?.url || "/queue";

    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
            // Focus existing tab if found
            for (const client of clientList) {
                if (client.url.includes(url) && "focus" in client) {
                    return client.focus();
                }
            }
            // Open new tab
            if (self.clients.openWindow) {
                return self.clients.openWindow(url);
            }
        })
    );
});
