import { NextRequest, NextResponse } from "next/server";
import { joinQueue } from "@/lib/queue/queueActions";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { eventId, displayName, phoneNumber } = body;

    if (!eventId || !displayName?.trim()) {
        return NextResponse.json(
            { success: false, error: "eventId dan displayName wajib diisi." },
            { status: 400 }
        );
    }

    const result = await joinQueue(eventId, displayName.trim(), phoneNumber?.trim());

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
        success: true,
        ticketId: result.ticketId,
        queueNumber: result.queueNumber,
    });
}
