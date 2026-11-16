import { NextRequest } from "next/server";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import { eventControllers } from "@/lib/queue/broadcast";

export const dynamic = "force-dynamic";

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
