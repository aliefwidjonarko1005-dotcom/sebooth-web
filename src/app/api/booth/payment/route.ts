import { NextRequest } from "next/server";
import { createHash, createHmac, randomUUID } from "crypto";
import { authenticateApprovedBooth, signedJson } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/payment";
const ORDER_ID = /^[A-Za-z0-9_-]{6,64}$/;

/**
 * POST /api/booth/payment — signing proxy to DOKU / Midtrans for approved booths, so the merchant keys
 * live only in Vercel env (DOKU_CLIENT_ID, DOKU_SECRET_KEY, DOKU_SANDBOX, MIDTRANS_SERVER_KEY,
 * MIDTRANS_PRODUCTION). Returns the gateway's own JSON; the kiosk parses it as before (payment.ipc.ts).
 * Body (device-signed): { deviceId, ts, counter, gateway: "doku"|"midtrans", op: "create"|"status", orderId, amount? }
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateApprovedBooth(req, PATH);
  if (auth instanceof Response) return auth;
  const { gateway, op, orderId, amount } = auth.body;

  if (typeof orderId !== "string" || !ORDER_ID.test(orderId) || (op !== "create" && op !== "status")) {
    return signedJson(PATH, { ok: false, error: "Invalid order" });
  }
  if (op === "create" && (typeof amount !== "number" || !Number.isInteger(amount) || amount < 1000 || amount > 50_000_000)) {
    return signedJson(PATH, { ok: false, error: "Invalid amount" });
  }

  try {
    const res = gateway === "doku" ? await doku(op, orderId, amount as number)
      : gateway === "midtrans" ? await midtrans(op, orderId, amount as number)
      : null;
    if (!res) return signedJson(PATH, { ok: false, error: "Unknown gateway or gateway not configured" });
    const data = await res.json().catch(() => null);
    return signedJson(PATH, { ok: res.ok, data });
  } catch (e) {
    console.error("[BoothGuard] payment proxy failed:", e);
    return signedJson(PATH, { ok: false, error: "Gateway unreachable" });
  }
}

async function doku(op: string, orderId: string, amount: number): Promise<Response | null> {
  const clientId = process.env.DOKU_CLIENT_ID;
  const secretKey = process.env.DOKU_SECRET_KEY;
  if (!clientId || !secretKey) return null;
  const base = process.env.DOKU_SANDBOX === "true" ? "https://api-sandbox.doku.com" : "https://api.doku.com";

  const target = op === "create" ? "/checkout/v1/payment" : `/orders/v1/status/${orderId}`;
  const body = op === "create"
    ? JSON.stringify({
        order: {
          invoice_number: orderId,
          amount,
          line_items: [{ name: "Sebooth Photobooth Session", price: amount, quantity: 1 }],
          callback_url: "https://doku.com",
        },
        payment: { payment_due_date: 60, payment_method_types: ["QRIS"] },
      })
    : "";
  const timestamp = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const requestId = randomUUID();
  let toSign = `Client-Id:${clientId}\nRequest-Id:${requestId}\nRequest-Timestamp:${timestamp}\nRequest-Target:${target}`;
  if (body) toSign += `\nDigest:${createHash("sha256").update(body, "utf8").digest("base64")}`;
  const signature = "HMACSHA256=" + createHmac("sha256", secretKey).update(toSign).digest("base64");

  return fetch(base + target, {
    method: op === "create" ? "POST" : "GET",
    headers: {
      "Client-Id": clientId,
      "Request-Id": requestId,
      "Request-Timestamp": timestamp,
      Signature: signature,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body || undefined,
  });
}

async function midtrans(op: string, orderId: string, amount: number): Promise<Response | null> {
  const key = process.env.MIDTRANS_SERVER_KEY;
  if (!key) return null;
  const base = process.env.MIDTRANS_PRODUCTION === "true" ? "https://api.midtrans.com" : "https://api.sandbox.midtrans.com";
  const headers = { Authorization: `Basic ${Buffer.from(`${key}:`).toString("base64")}`, Accept: "application/json" };
  if (op === "status") return fetch(`${base}/v2/${orderId}/status`, { headers });
  return fetch(`${base}/v2/charge`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      payment_type: "qris",
      transaction_details: { order_id: orderId, gross_amount: amount },
      qris: { acquirer: "gopay" },
    }),
  });
}
