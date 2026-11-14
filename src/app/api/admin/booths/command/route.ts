import { NextRequest } from "next/server";
import { getAdminUser } from "@/lib/apiSecurity";
import { parseBoothCommand } from "@/lib/boothGuardShared";
import {
  guardServiceClient,
  loadOwnerPins,
  recoveryKeysFromEnv,
  verifyOwnerAssertion,
  type OwnerAssertion,
} from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Server-side status that follows each owner command. The kiosk applies the command itself after
// checking the owner signature against its pinned keys; this only keeps the dashboard in step.
const STATUS_AFTER: Partial<Record<string, string>> = {
  approve: "approved",
  unlock: "approved",
  lock: "locked",
  revoke: "revoked",
};

/**
 * POST /api/admin/booths/command — relay an owner-signed command to a booth.
 * Body: { command, assertion }. Rejected unless the assertion is a valid owner signature over the command.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });

  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const command = parseBoothCommand(body?.command);
  const assertion = body?.assertion as OwnerAssertion | undefined;
  if (!command || !assertion) return Response.json({ success: false, error: "Invalid command" }, { status: 400 });
  if (command.expiresAt < Date.now()) return Response.json({ success: false, error: "Command expired" }, { status: 400 });

  const reason = verifyOwnerAssertion(command, assertion, await loadOwnerPins(svc), recoveryKeysFromEnv());
  if (reason) return Response.json({ success: false, error: `Owner signature rejected: ${reason}` }, { status: 403 });

  const { data: device } = await svc.from("booth_devices").select("id").eq("id", command.deviceId).maybeSingle();
  if (!device) return Response.json({ success: false, error: "Unknown booth" }, { status: 404 });

  const { error } = await svc.from("booth_commands").insert({
    id: command.id,
    device_id: command.deviceId,
    command,
    assertion,
    created_by: admin.id,
  });
  if (error) {
    const dup = error.code === "23505";
    return Response.json({ success: false, error: dup ? "Command already sent" : "Could not store command" }, { status: dup ? 409 : 500 });
  }

  const next = STATUS_AFTER[command.action];
  if (next) {
    await svc
      .from("booth_devices")
      .update({ status: next, lock_reason: command.action === "lock" ? "owner" : null })
      .eq("id", command.deviceId);
  }
  return Response.json({ success: true });
}
