// Global in-memory broadcaster map: eventId → Set of controller writers
// In production (serverless), each instance has its own map.
// For Vercel, this works within a single invocation's lifetime.
// The client auto-reconnects when the SSE connection drops (every ~25s on Vercel).
export const eventControllers = new Map<string, Set<ReadableStreamDefaultController>>();

/**
 * Broadcast a queue update to all SSE clients watching a specific event.
 * Called internally when operator actions or webhooks update queue state.
 */
export function broadcastQueueUpdate(eventId: string, data: unknown) {
    const controllers = eventControllers.get(eventId);
    if (!controllers || controllers.size === 0) return;

    const payload = `event: queue_update\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();
    const encoded = encoder.encode(payload);

    controllers.forEach((controller) => {
        try {
            controller.enqueue(encoded);
        } catch {
            // Controller already closed, will be cleaned up on disconnect
        }
    });
}
