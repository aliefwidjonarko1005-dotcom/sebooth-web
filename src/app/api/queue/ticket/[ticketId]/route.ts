import { NextRequest, NextResponse } from "next/server";
import { cancelQueueTicket } from "@/lib/queue/queueActions";

export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    const { ticketId } = await params;
    const result = await cancelQueueTicket(ticketId);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
