import { NextRequest, NextResponse } from "next/server";
import { cancelQueueTicket } from "@/lib/queue/queueActions";
import { getQueueUser } from "@/lib/queue/queueAuth";

export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ ticketId: string }> }
) {
    const user = await getQueueUser();
    if (!user) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;
    const result = await cancelQueueTicket(ticketId, user.id);

    if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
