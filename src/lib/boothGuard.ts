// Booth Guard server side. Server-only (node:crypto, service-role key).
//
// Wire format, shared with the kiosk (src/main/guard/protocol.ts in sebooth-vertical-button):
//   kiosk -> server: JSON body, header x-booth-sig = Ed25519(device key, "SEBOOTH-BOOTH-V1\n<path>\n<raw body>")
//   server -> kiosk: JSON body, header x-server-sig = Ed25519(BOOTH_SIGNING_KEY, "SEBOOTH-SERVER-V1\n<path>\n<raw body>")
//   owner -> kiosk: a BoothCommand plus either a passkey assertion whose challenge is
//                   base64url(sha256(canonicalJSON(command))), or a recovery Ed25519 signature over
//                   "SEBOOTH-OWNER-V1\n<canonicalJSON(command)>".
// The kiosk trusts only the owner keys pinned in its build. This file checks the same signatures so
// the dashboard status matches what the kiosk will do; it is not what keeps a booth locked.

import { createHash, createPrivateKey, createPublicKey, sign, verify, type KeyObject } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { canonicalJSON, type BoothCommand } from "./boothGuardShared";
import { sendPushToUser, type PushPayload } from "./queue/pushSender";
import { hasValidWebhookSecret } from "./apiSecurity";

export const DEVICE_SIG_PREFIX = "SEBOOTH-BOOTH-V1";
export const SERVER_SIG_PREFIX = "SEBOOTH-SERVER-V1";
export const RECOVERY_SIG_PREFIX = "SEBOOTH-OWNER-V1";
export const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

/** Passkey relying party. Override with BOOTH_RP_ID / BOOTH_ORIGINS for local testing on localhost. */
export const RP_ID = process.env.BOOTH_RP_ID || "sebooth.in";
export const RP_ORIGINS = (process.env.BOOTH_ORIGINS || "https://www.sebooth.in,https://sebooth.in")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export interface OwnerKeyPin {
  credentialId: string; // base64url
  jwk: JsonWebKey;
  alg: number; // COSE: -7 ES256, -257 RS256
  rpId: string;
  origins: string[];
}

export type OwnerAssertion =
  | { type: "passkey"; credentialId: string; authenticatorData: string; clientDataJSON: string; signature: string }
  | { type: "recovery"; signature: string };

// ── Supabase (service role only; the booth tables have no public grants) ─────────

export function guardServiceClient(): SupabaseClient | null {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}

// ── Hashing / signatures ───────────────────────────────────────────────────────

export const sha256 = (data: Buffer | string) => createHash("sha256").update(data).digest();

export function commandChallenge(cmd: BoothCommand): string {
  return sha256(canonicalJSON(cmd)).toString("base64url");
}

export function verifyDeviceSignature(spkiB64: string, path: string, raw: string, sigB64: string | null): boolean {
  if (!sigB64) return false;
  try {
    const key = createPublicKey({ key: Buffer.from(spkiB64, "base64"), format: "der", type: "spki" });
    if (key.asymmetricKeyType !== "ed25519") return false;
    return verify(null, Buffer.from(`${DEVICE_SIG_PREFIX}\n${path}\n${raw}`), key, Buffer.from(sigB64, "base64"));
  } catch {
    return false;
  }
}

let serverKey: KeyObject | null | undefined;
function serverSigningKey(): KeyObject | null {
  if (serverKey === undefined) {
    const k = process.env.BOOTH_SIGNING_KEY;
    try {
      serverKey = k ? createPrivateKey({ key: Buffer.from(k, "base64"), format: "der", type: "pkcs8" }) : null;
    } catch {
      console.error("[BoothGuard] BOOTH_SIGNING_KEY is not a base64 PKCS8 Ed25519 key");
      serverKey = null;
    }
  }
  return serverKey;
}

/** JSON response signed for the kiosk. */
export function signedJson(path: string, body: unknown, status = 200): Response {
  const key = serverSigningKey();
  if (!key) return Response.json({ success: false, error: "BOOTH_SIGNING_KEY not configured" }, { status: 503 });
  const raw = JSON.stringify(body);
  const sig = sign(null, Buffer.from(`${SERVER_SIG_PREFIX}\n${path}\n${raw}`), key).toString("base64");
  return new Response(raw, {
    status,
    headers: { "content-type": "application/json", "x-server-sig": sig, "cache-control": "no-store" },
  });
}

/** Short-lived, server-signed token that carries a passkey registration challenge between two requests. */
export function signTicket(payload: Record<string, unknown>): string | null {
  const key = serverSigningKey();
  if (!key) return null;
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return body + "." + sign(null, Buffer.from(body), key).toString("base64url");
}

export function readTicket(ticket: string): Record<string, unknown> | null {
  const key = serverSigningKey();
  const [body, sig] = String(ticket || "").split(".");
  if (!key || !body || !sig) return null;
  try {
    if (!verify(null, Buffer.from(body), createPublicKey(key), Buffer.from(sig, "base64url"))) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    return typeof payload.exp === "number" && payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// ── Owner assertion (same algorithm as the kiosk) ──────────────────────────────

/** Returns null when the assertion is a valid owner signature over `cmd`, else the reason it is not. */
export function verifyOwnerAssertion(
  cmd: BoothCommand,
  a: OwnerAssertion,
  pins: OwnerKeyPin[],
  recoveryKeys: string[],
): string | null {
  try {
    if (a?.type === "recovery") {
      const msg = Buffer.from(`${RECOVERY_SIG_PREFIX}\n${canonicalJSON(cmd)}`);
      const sig = Buffer.from(a.signature, "base64");
      const ok = recoveryKeys.some((pk) =>
        verify(null, msg, createPublicKey({ key: Buffer.from(pk, "base64"), format: "der", type: "spki" }), sig),
      );
      return ok ? null : "recovery signature does not match";
    }
    if (a?.type !== "passkey") return "unknown assertion type";

    const pin = pins.find((p) => p.credentialId === a.credentialId);
    if (!pin) return "credential is not an owner key";

    const clientDataBytes = Buffer.from(a.clientDataJSON, "base64url");
    const clientData = JSON.parse(clientDataBytes.toString("utf8"));
    if (clientData.type !== "webauthn.get") return "wrong clientData type";
    if (clientData.challenge !== commandChallenge(cmd)) return "challenge does not match the command";
    if (!pin.origins.includes(clientData.origin)) return "origin not allowed";
    if (clientData.crossOrigin === true) return "cross-origin assertion";

    const authData = Buffer.from(a.authenticatorData, "base64url");
    if (authData.length < 37) return "authenticatorData too short";
    if (!authData.subarray(0, 32).equals(sha256(pin.rpId))) return "rpId does not match";
    const flags = authData[32];
    if (!(flags & 0x01) || !(flags & 0x04)) return "user presence and verification are required";

    const signed = Buffer.concat([authData, sha256(clientDataBytes)]);
    const key = createPublicKey({ key: pin.jwk as never, format: "jwk" });
    const sig = Buffer.from(a.signature, "base64url");
    const ok =
      pin.alg === -7
        ? verify("sha256", signed, { key, dsaEncoding: "der" }, sig)
        : pin.alg === -257
          ? verify("sha256", signed, key, sig)
          : false;
    return ok ? null : "signature does not verify";
  } catch {
    return "malformed assertion";
  }
}

export function recoveryKeysFromEnv(): string[] {
  return (process.env.BOOTH_RECOVERY_PUBKEYS || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

export async function loadOwnerPins(svc: SupabaseClient): Promise<OwnerKeyPin[]> {
  const { data } = await svc.from("owner_keys").select("credential_id, jwk");
  return (data || []).map((r: { credential_id: string; jwk: { alg: number; key: JsonWebKey } }) => ({
    credentialId: r.credential_id,
    jwk: r.jwk.key,
    alg: r.jwk.alg,
    rpId: RP_ID,
    origins: RP_ORIGINS,
  }));
}

/**
 * Authenticates a signed kiosk request for a cloud service (uploads, rows). Same counter rule as the
 * heartbeat: only one copy of an identity can move the counter forward; a step back locks the booth.
 * Only `approved` booths get through, so an unapproved or cloned install gets no cloud access.
 */
export async function authenticateApprovedBooth(
  req: Request,
  path: string,
): Promise<{ svc: SupabaseClient; deviceId: string; body: Record<string, unknown> } | Response> {
  const raw = await req.text();
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
  const { deviceId, ts, counter } = body;
  if (
    typeof deviceId !== "string" || !/^[0-9a-f-]{36}$/i.test(deviceId) ||
    typeof counter !== "number" || !Number.isSafeInteger(counter) ||
    typeof ts !== "number" || Math.abs(Date.now() - ts) > MAX_CLOCK_SKEW_MS
  ) {
    return Response.json({ success: false, error: "Bad request or clock skew" }, { status: 400 });
  }
  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "Server not configured" }, { status: 503 });

  const { data: device } = await svc
    .from("booth_devices")
    .select("id, public_key, status")
    .eq("id", deviceId)
    .maybeSingle();
  if (!device || !verifyDeviceSignature(device.public_key, path, raw, req.headers.get("x-booth-sig"))) {
    return Response.json({ success: false, error: "Unknown booth or bad signature" }, { status: 401 });
  }
  const { data: advanced } = await svc
    .from("booth_devices")
    .update({ counter, last_seen: new Date().toISOString() })
    .eq("id", device.id)
    .lt("counter", counter)
    .select("id");
  if (!advanced || advanced.length === 0) {
    if (device.status !== "locked" && device.status !== "revoked") {
      await svc.from("booth_devices").update({ status: "locked", lock_reason: "clone" }).eq("id", device.id);
      await notifyOwners(svc, {
        title: "Booth terkunci: identitas ganda",
        body: `Booth ${device.id.slice(0, 8).toUpperCase()} dipakai di lebih dari satu PC. Booth dikunci.`,
        url: "/admin?tab=booths",
        tag: `booth-clone-${device.id}`,
        requireInteraction: true,
      });
    }
    return Response.json({ success: false, error: "Counter replay" }, { status: 409 });
  }
  if (device.status !== "approved") {
    return Response.json({ success: false, error: `Booth is ${device.status}` }, { status: 403 });
  }
  return { svc, deviceId: device.id, body };
}

/**
 * Kiosk auth for routes that predate Booth Guard: a request signed by an approved booth (answered with
 * a server-signed response), or the legacy shared QUEUE_WEBHOOK_SECRET for kiosks without the guard.
 */
export async function kioskAuth(
  req: Request,
  path: string,
): Promise<{ body: Record<string, unknown>; respond: (body: unknown, status?: number) => Response } | Response> {
  if (req.headers.get("x-booth-sig")) {
    const auth = await authenticateApprovedBooth(req, path);
    if (auth instanceof Response) return auth;
    return { body: auth.body, respond: (b, s = 200) => signedJson(path, b, s) };
  }
  if (!hasValidWebhookSecret(req)) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  return { body, respond: (b, s = 200) => Response.json(b, { status: s }) };
}

/** Push to every admin who registered an owner passkey. Never throws. */
export async function notifyOwners(svc: SupabaseClient, payload: PushPayload): Promise<void> {
  try {
    const { data } = await svc.from("owner_keys").select("created_by");
    const ids = [...new Set((data || []).map((r: { created_by: string | null }) => r.created_by).filter(Boolean))];
    await Promise.all(ids.map((id) => sendPushToUser(id as string, payload)));
  } catch (e) {
    console.error("[BoothGuard] notifyOwners failed:", e);
  }
}
