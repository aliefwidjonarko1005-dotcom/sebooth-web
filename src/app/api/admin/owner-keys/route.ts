import { NextRequest } from "next/server";
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server";
import { decodeCredentialPublicKey, cose } from "@simplewebauthn/server/helpers";
import { getAdminUser } from "@/lib/apiSecurity";
import { guardServiceClient, readTicket, RP_ID, RP_ORIGINS, signTicket } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** COSE public key -> JWK the kiosk can load with crypto.createPublicKey. ES256 and RS256 only. */
function coseToJwk(coseKey: Parameters<typeof decodeCredentialPublicKey>[0]): { alg: number; key: JsonWebKey } | null {
  const k = decodeCredentialPublicKey(coseKey) as unknown as Map<number, unknown>;
  const alg = Number(k.get(cose.COSEKEYS.alg));
  const b64 = (v: unknown) => Buffer.from(v as Uint8Array).toString("base64url");
  if (alg === -7 && k.get(cose.COSEKEYS.crv) === 1) {
    return { alg, key: { kty: "EC", crv: "P-256", x: b64(k.get(cose.COSEKEYS.x)), y: b64(k.get(cose.COSEKEYS.y)) } };
  }
  if (alg === -257) {
    return { alg, key: { kty: "RSA", n: b64(k.get(cose.COSEKEYS.n)), e: b64(k.get(cose.COSEKEYS.e)) } };
  }
  return null;
}

/**
 * POST /api/admin/owner-keys
 *   { step: "options" }                          -> { options, ticket }
 *   { step: "verify", ticket, response, label }  -> { pin }  (the snippet to pin in the kiosk build)
 * Adding a key here alone unlocks nothing: a booth only trusts keys pinned in its build.
 */
export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ success: false, error: "Unauthorized. Admin access required." }, { status: 401 });

  const svc = guardServiceClient();
  if (!svc) return Response.json({ success: false, error: "SUPABASE_SERVICE_ROLE_KEY not configured" }, { status: 503 });

  const body = await req.json().catch(() => null);

  if (body?.step === "options") {
    const { data: existing } = await svc.from("owner_keys").select("credential_id");
    const options = await generateRegistrationOptions({
      rpName: "Sebooth Owner",
      rpID: RP_ID,
      userName: admin.email || admin.id,
      attestationType: "none",
      supportedAlgorithmIDs: [-7, -257],
      authenticatorSelection: { residentKey: "preferred", userVerification: "required" },
      excludeCredentials: (existing || []).map((r: { credential_id: string }) => ({ id: r.credential_id })),
    });
    const ticket = signTicket({ challenge: options.challenge, uid: admin.id, exp: Date.now() + 5 * 60 * 1000 });
    if (!ticket) return Response.json({ success: false, error: "BOOTH_SIGNING_KEY not configured" }, { status: 503 });
    return Response.json({ success: true, options, ticket });
  }

  if (body?.step === "verify") {
    const t = readTicket(body.ticket);
    if (!t || t.uid !== admin.id) return Response.json({ success: false, error: "Registration expired, try again" }, { status: 400 });

    const result = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: String(t.challenge),
      expectedOrigin: RP_ORIGINS,
      expectedRPID: RP_ID,
      requireUserVerification: true,
      supportedAlgorithmIDs: [-7, -257],
    }).catch((e: Error) => ({ verified: false as const, error: e.message }));
    if (!result.verified) {
      return Response.json({ success: false, error: "Passkey could not be verified" }, { status: 400 });
    }

    const { credential } = result.registrationInfo;
    const jwk = coseToJwk(credential.publicKey);
    if (!jwk) return Response.json({ success: false, error: "Unsupported key type" }, { status: 400 });

    const label = typeof body.label === "string" ? body.label.slice(0, 60) : null;
    const { error } = await svc.from("owner_keys").insert({
      credential_id: credential.id,
      cose_public_key: Buffer.from(credential.publicKey).toString("base64url"),
      jwk,
      label,
      created_by: admin.id,
    });
    if (error) return Response.json({ success: false, error: "Could not save key" }, { status: 500 });

    const pin = { credentialId: credential.id, jwk: jwk.key, alg: jwk.alg, rpId: RP_ID, origins: RP_ORIGINS, label };
    return Response.json({ success: true, pin });
  }

  return Response.json({ success: false, error: "Unknown step" }, { status: 400 });
}
