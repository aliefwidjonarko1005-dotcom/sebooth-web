/// <reference lib="webworker" />

/**
 * Sebooth Queue Push Notification Service Worker
 * Handles incoming push events and notification click actions.
 */

// Activate immediately — don't wait for old SW to die
self.addEventListener("install", function (event) {
    event.waitUntil(self.skipWaiting());
});

// Claim all clients immediately so push works right away
self.addEventListener("activate", function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("push", function (event) {
    if (!event.data) return;

    let data;
    try {
        data = event.data.json();
    } catch {
        data = { title: "Sebooth Antrean", body: event.data.text() };
    }

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
        // Ensure notification shows even if app is in foreground
        renotify: true,
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
