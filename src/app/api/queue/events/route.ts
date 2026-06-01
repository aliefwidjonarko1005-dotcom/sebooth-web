import { NextResponse } from "next/server";
import { fetchActiveQueueEvents } from "@/lib/queue/queueFetchers";

export const dynamic = "force-dynamic";

export async function GET() {
    const events = await fetchActiveQueueEvents();
    return NextResponse.json({ events });
}
