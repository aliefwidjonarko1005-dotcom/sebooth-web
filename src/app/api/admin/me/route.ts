import { NextResponse } from "next/server";
import { getAdminStatus } from "@/lib/apiSecurity";

export const dynamic = "force-dynamic";

// The admin panel asks here instead of reading the admin email list in the browser.
export async function GET() {
    const status = await getAdminStatus();
    return NextResponse.json(
        { isAdmin: Boolean(status), isSuper: status?.isSuper ?? false },
        { headers: { "Cache-Control": "no-store" } }
    );
}
