import { NextRequest } from "next/server";
import { clientIp } from "@/lib/apiSecurity";
import {
  guardServiceClient,
  MAX_CLOCK_SKEW_MS,
  notifyOwners,
  signedJson,
  verifyDeviceSignature,
} from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/heartbeat";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/booth/heartbeat — every 30 s from each kiosk.
 * Body: { deviceId, ts, counter, fingerprint, status?, acks?: [{ id, result }] }, signed by the device key.
 * Returns the server status and every unacknowledged owner command, signed by the server key.
 * The counter must grow on every request: a repeat, a step back or a different machine means two
 * copies share one identity, so the booth is locked and the owner alerted.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { deviceId, ts, counter, fingerprint } = body;
  if (
    typeof deviceId !== "string" || !UUID.test(deviceId) ||
    typeof counter !== "number" || !Number.isSafeInteger(counter) ||
    typeof ts !== "number" || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS
  ) {
    return Response.json({ success: false, error: "Bad request or clock skew" }, { status: 400 });
  }

  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "Server not configured" }, { status: 503 });

  const { data: device } = await svc
    .from("booth_devices")
    .select("id, public_key, fingerprint, status, lock_reason, counter, hostname, label")
    .eq("id", deviceId)
    .maybeSingle();
  // Unknown or revoked identity: the kiosk wipes it and registers again.
  if (!device) return signedJson(PATH, { deviceId, counter, status: "unknown", commands: [], serverTime: Date.now() });

  if (!verifyDeviceSignature(device.public_key, PATH, raw, req.headers.get("x-booth-sig"))) {
    return Response.json({ success: false, error: "Bad signature" }, { status: 401 });
  }

  const status = body.status && typeof body.status === "object" && JSON.stringify(body.status).length < 4000 ? body.status : null;
  // Conditional update: only one of two concurrent copies can move the counter forward.
  const { data: advanced } =
    fingerprint === device.fingerprint
      ? await svc
          .from("booth_devices")
          .update({
            counter,
            last_seen: new Date().toISOString(),
            last_ip: clientIp(req),
            ...(status ? { last_status: status, app_version: String((status as Record<string, unknown>).appVersion || "").slice(0, 40) || null } : {}),
          })
          .eq("id", device.id)
          .lt("counter", counter)
          .select("id")
      : { data: [] };

  if (!advanced || advanced.length === 0) {
    if (device.status !== "locked" && device.status !== "revoked") {
      await svc.from("booth_devices").update({ status: "locked", lock_reason: "clone" }).eq("id", device.id);
      await notifyOwners(svc, {
        title: "Booth terkunci: identitas ganda",
        body: `${device.label || device.hostname || device.id} dipakai di lebih dari satu PC. Booth dikunci.`,
        url: "/admin?tab=booths",
        tag: `booth-clone-${device.id}`,
        requireInteraction: true,
      });
    }
    return signedJson(PATH, { deviceId, counter, status: "locked", lockReason: "clone", commands: [], serverTime: Date.now() });
  }

  const acks = Array.isArray(body.acks) ? body.acks.slice(0, 50) : [];
  for (const ack of acks) {
    if (!ack || typeof ack.id !== "string" || !UUID.test(ack.id)) continue;
    await svc
      .from("booth_commands")
      .update({ acked_at: new Date().toISOString(), ack_result: String(ack.result || "").slice(0, 200) })
      .eq("id", ack.id)
      .eq("device_id", device.id);
  }

  const { data: commands } = await svc
    .from("booth_commands")
    .select("command, assertion")
    .eq("device_id", device.id)
    .is("acked_at", null)
    .order("created_at", { ascending: true })
    .limit(20);

  return signedJson(PATH, {
    deviceId,
    counter,
    status: device.status,
    lockReason: device.lock_reason,
    commands: commands || [],
    serverTime: Date.now(),
  });
}
