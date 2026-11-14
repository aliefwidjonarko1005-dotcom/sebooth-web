import { getAdminUser } from "@/lib/apiSecurity";
import { guardServiceClient, RP_ID } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** GET /api/admin/booths — every booth, the owner credential ids to sign with, and unacknowledged commands. */
export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });

  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });

  const [devices, keys, pending] = await Promise.all([
    svc
      .from("booth_devices")
      .select("id, hostname, label, app_version, status, lock_reason, last_seen, last_ip, last_status, created_at")
      .order("created_at", { ascending: false }),
    svc.from("owner_keys").select("credential_id, label, created_at"),
    svc.from("booth_commands").select("id, device_id, command, created_at").is("acked_at", null),
  ]);

  return Response.json({
    success: true,
    rpId: RP_ID,
    devices: devices.data || [],
    ownerKeys: keys.data || [],
    pendingCommands: pending.data || [],
  });
}
