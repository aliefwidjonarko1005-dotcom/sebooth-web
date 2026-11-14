import { NextRequest } from "next/server";
import { clientIp, rateLimit } from "@/lib/apiSecurity";
import {
  guardServiceClient,
  MAX_CLOCK_SKEW_MS,
  notifyOwners,
  signedJson,
  verifyDeviceSignature,
} from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/register";

/**
 * POST /api/booth/register — a kiosk install announces its device key. New keys start `pending`
 * (locked on the kiosk) and the owner gets a push to approve them from their own device.
 * Body: { publicKey, fingerprint, hostname, appVersion, ts }, signed with the key it announces.
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "booth-register", 10, 60 * 60 * 1000);
  if (limited) return limited;

  const raw = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { publicKey, fingerprint, hostname, appVersion, ts } = body;
  if (
    typeof publicKey !== "string" || publicKey.length > 200 ||
    typeof fingerprint !== "string" || !/^[0-9a-f]{64}$/.test(fingerprint) ||
    typeof ts !== "number" || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS
  ) {
    return Response.json({ success: false, error: "Bad request or clock skew" }, { status: 400 });
  }
  if (!verifyDeviceSignature(publicKey, PATH, raw, req.headers.get("x-booth-sig"))) {
    return Response.json({ success: false, error: "Bad signature" }, { status: 401 });
  }

  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "Server not configured" }, { status: 503 });

  const { data: existing } = await svc
    .from("booth_devices")
    .select("id, status")
    .eq("public_key", publicKey)
    .maybeSingle();
  if (existing) {
    return signedJson(PATH, { deviceId: existing.id, status: existing.status, serverTime: Date.now() });
  }

  const name = typeof hostname === "string" ? hostname.slice(0, 100) : null;
  const { data: created, error } = await svc
    .from("booth_devices")
    .insert({
      public_key: publicKey,
      fingerprint,
      hostname: name,
      app_version: typeof appVersion === "string" ? appVersion.slice(0, 40) : null,
      last_seen: new Date().toISOString(),
      last_ip: clientIp(req),
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("[BoothGuard] register insert failed:", error?.message);
    return Response.json({ success: false, error: "Could not register" }, { status: 500 });
  }

  await notifyOwners(svc, {
    title: "Booth baru minta approval",
    body: `${name || "Perangkat tanpa nama"} terkunci sampai kamu approve.`,
    url: "/admin?tab=booths",
    tag: `booth-${created.id}`,
    requireInteraction: true,
  });

  return signedJson(PATH, { deviceId: created.id, status: "pending", serverTime: Date.now() });
}
