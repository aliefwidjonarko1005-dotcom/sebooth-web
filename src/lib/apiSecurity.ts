import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ── Media URL allowlist (SSRF / open proxy / path traversal) ──────────────────

// Every media row in the database lives under one of these (checked across all 31k rows).
// Extra prefixes for future buckets: MEDIA_ALLOWED_PREFIXES="https://a/,https://b/"
const MEDIA_PREFIXES = [
  "https://storage.googleapis.com/sebooth-media-konser/",
  `${(process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "")}/storage/v1/object/public/`,
  ...(process.env.MEDIA_ALLOWED_PREFIXES || "").split(",").map((p) => p.trim()).filter(Boolean),
].filter((p) => p.startsWith("https://"));

export type MediaSource = { kind: "local"; path: string } | { kind: "remote"; url: string };

/**
 * Accepts only site-relative public paths ("/images/...") and URLs under an allowlisted media prefix.
 * Returns null for anything else (other hosts, "..", "//host", non-https, the /api proxy itself).
 */
export function resolveMediaSource(raw: string): MediaSource | null {
  if (raw.startsWith("/") && !raw.startsWith("//")) {
    const path = raw.split("?")[0].split("#")[0];
    let decoded: string;
    try {
      decoded = decodeURIComponent(path);
    } catch {
      return null;
    }
    if (decoded.includes("..") || decoded.includes("\\") || decoded.startsWith("/api/")) return null;
    return { kind: "local", path: decoded };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  // Normalised href, so "https://allowed/x/../../other" cannot slip past the prefix check
  const href = url.href;
  return MEDIA_PREFIXES.some((p) => href.startsWith(p)) ? { kind: "remote", url: href } : null;
}

// ── Rate limiting ──────────────────────────────────────────────────────────────

const buckets = new Map<string, { count: number; resetAt: number }>();

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "unknown").trim();
}

/**
 * Fixed-window limiter. Returns a 429 Response when the caller is over the limit, else null.
 * shortcut: in-memory per server instance, so on serverless the real ceiling is limit × warm instances;
 * move to a shared store (Upstash Redis / Supabase table) when abuse shows up in logs.
 */
export function rateLimit(req: Request, scope: string, limit: number, windowMs: number): Response | null {
  const now = Date.now();
  const key = `${scope}:${clientIp(req)}`;
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    }
    return null;
  }
  entry.count += 1;
  if (entry.count <= limit) return null;
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
  return new Response(JSON.stringify({ success: false, error: "Terlalu banyak permintaan. Coba lagi sebentar." }), {
    status: 429,
    headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) },
  });
}

// ── Shared-secret check (webhooks, kiosk) ──────────────────────────────────────

/** Fails closed: with no secret configured, every request is rejected. */
export function hasValidWebhookSecret(req: Request): boolean {
  const expected = process.env.QUEUE_WEBHOOK_SECRET;
  const given = req.headers.get("x-webhook-secret");
  if (!expected || !given || given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

// ── Admin check (same rule as /api/admin/*: env admin list or a row in `admins`) ──

export async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Safe to ignore in route handlers
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const email = (user.email || "").toLowerCase().trim();
  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (envAdmins.includes(email)) return user;

  const { data: adminRecord } = await supabase.from("admins").select("id").eq("email", email).maybeSingle();
  return adminRecord ? user : null;
}
