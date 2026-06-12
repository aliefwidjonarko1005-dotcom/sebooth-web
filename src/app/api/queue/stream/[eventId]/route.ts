import { NextRequest } from "next/server";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";

export const dynamic = "force-dynamic";

// Global in-memory broadcaster map: eventId → Set of controller writers
// In production (serverless), each instance has its own map.
// For Vercel, this works within a single invocation's lifetime.
// The client auto-reconnects when the SSE connection drops (every ~25s on Vercel).
const eventControllers = new Map<string, Set<ReadableStreamDefaultController>>();

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

/**
 * SSE Route: GET /api/queue/stream/[eventId]
 * Maintains a long-lived connection and pushes queue updates to the client.
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;
    const encoder = new TextEncoder();

    let controller: ReadableStreamDefaultController;
    let heartbeatInterval: ReturnType<typeof setInterval>;

    const stream = new ReadableStream({
        async start(ctrl) {
            controller = ctrl;

            // Register this controller
            if (!eventControllers.has(eventId)) {
                eventControllers.set(eventId, new Set());
            }
            eventControllers.get(eventId)!.add(controller);

            // Send initial state immediately
            const status = await fetchQueueStatus(eventId);
            const initialPayload = `event: queue_update\ndata: ${JSON.stringify(status)}\n\n`;
            controller.enqueue(encoder.encode(initialPayload));

            // Heartbeat every 15 seconds to keep connection alive
            heartbeatInterval = setInterval(async () => {
                try {
                    const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`;
                    controller.enqueue(encoder.encode(heartbeat));

                    // Also re-fetch and push fresh status on each heartbeat
                    const freshStatus = await fetchQueueStatus(eventId);
                    const updatePayload = `event: queue_update\ndata: ${JSON.stringify(freshStatus)}\n\n`;
                    controller.enqueue(encoder.encode(updatePayload));
                } catch {
                    clearInterval(heartbeatInterval);
                }
            }, 15000);
        },
        cancel() {
            // Cleanup on client disconnect
            clearInterval(heartbeatInterval);
            if (controller && eventControllers.has(eventId)) {
                eventControllers.get(eventId)!.delete(controller);
                if (eventControllers.get(eventId)!.size === 0) {
                    eventControllers.delete(eventId);
                }
            }
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no", // Disable Nginx buffering
        },
    });
}
