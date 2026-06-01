import { NextRequest } from "next/server";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";
import {
    sendWaNotification,
    shouldNotify,
    markTicketNotified,
} from "@/lib/queue/whatsappNotifier";

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

    const payload = `data: ${JSON.stringify(data)}\n\n`;
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

            // Check and send WA notifications for eligible tickets
            await checkAndSendWaNotifications(eventId, status);

            // Heartbeat every 15 seconds to keep connection alive
            heartbeatInterval = setInterval(async () => {
                try {
                    const heartbeat = `event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`;
                    controller.enqueue(encoder.encode(heartbeat));

                    // Also re-fetch and push fresh status on each heartbeat
                    const freshStatus = await fetchQueueStatus(eventId);
                    const updatePayload = `event: queue_update\ndata: ${JSON.stringify(freshStatus)}\n\n`;
                    controller.enqueue(encoder.encode(updatePayload));

                    // Check WA notifications again
                    await checkAndSendWaNotifications(eventId, freshStatus);
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

/**
 * Check waiting tickets and send WA notifications to those at the threshold position.
 */
async function checkAndSendWaNotifications(
    eventId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    status: any
) {
    const { waitingTickets, event } = status;
    if (!waitingTickets || !event) return;

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sebooth.com";

    for (const ticket of waitingTickets) {
        if (
            !ticket.wa_notified &&
            ticket.phone_number &&
            shouldNotify(ticket.positionFromFront)
        ) {
            const estimatedWaitMin = Math.ceil(ticket.estimatedWaitMs / 60000);
            const sent = await sendWaNotification({
                ticketId: ticket.id,
                phone: ticket.phone_number,
                displayName: ticket.display_name,
                queueNumber: ticket.queue_number,
                eventName: event.name,
                positionFromFront: ticket.positionFromFront,
                estimatedWaitMin,
                ticketUrl: `${baseUrl}/queue/${eventId}/ticket/${ticket.id}`,
            });
            if (sent) {
                await markTicketNotified(ticket.id);
            }
        }
    }
}
