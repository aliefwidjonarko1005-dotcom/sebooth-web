import { NextRequest, NextResponse } from "next/server";
import { fetchQueueStatus } from "@/lib/queue/queueFetchers";

export const dynamic = "force-dynamic";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    const { eventId } = await params;
    const status = await fetchQueueStatus(eventId);
    return NextResponse.json(status);
}
