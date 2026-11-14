import { NextRequest } from "next/server";
import { authenticateApprovedBooth, signedJson } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/rows";
const BUCKET = process.env.GCS_BUCKET_NAME || "sebooth-media-konser";

// The only rows a kiosk writes (src/main/ipc/cloud.ipc.ts enqueueSessionUpload), column by column.
function clean(table: unknown, row: Record<string, unknown>): Record<string, unknown> | null {
  if (table === "sessions") {
    if (typeof row.id !== "string" || row.id.length > 80) return null;
    return {
      id: row.id,
      event_name: typeof row.event_name === "string" ? row.event_name.slice(0, 200) : null,
      is_claimed: false,
      created_at: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    };
  }
  if (table === "media") {
    const url = String(row.url || "");
    if (typeof row.session_id !== "string" || !url.startsWith(`https://storage.googleapis.com/${BUCKET}/${row.session_id}/`)) return null;
    if (!["photo", "gif", "live"].includes(String(row.type))) return null;
    return {
      session_id: row.session_id,
      type: row.type,
      url,
      metadata: row.metadata && typeof row.metadata === "object" ? { is_strip: !!(row.metadata as { is_strip?: boolean }).is_strip } : {},
    };
  }
  return null;
}

/**
 * POST /api/booth/rows — insert a session/media row for an approved booth (service role; no anon writes needed).
 * Body (device-signed): { deviceId, ts, counter, table, row }
 * `dropped: true` tells the kiosk the row itself is bad, so it stops retrying it.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateApprovedBooth(req, PATH);
  if (auth instanceof Response) return auth;
  const { table, row } = auth.body;
  const cleaned = row && typeof row === "object" ? clean(table, row as Record<string, unknown>) : null;
  if (!cleaned) return signedJson(PATH, { success: false, dropped: true, error: "Row not allowed" });

  const { error } = table === "sessions"
    ? await auth.svc.from("sessions").upsert(cleaned, { onConflict: "id" })
    : await auth.svc.from("media").insert(cleaned);
  if (error) {
    console.error(`[BoothGuard] ${table} row rejected:`, error.code, error.message);
    return signedJson(PATH, { success: false, dropped: !!error.code, error: error.message });
  }
  return signedJson(PATH, { success: true });
}
