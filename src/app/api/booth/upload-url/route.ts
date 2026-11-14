import { NextRequest } from "next/server";
import { Storage } from "@google-cloud/storage";
import { authenticateApprovedBooth, signedJson } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/upload-url";
const BUCKET = process.env.GCS_BUCKET_NAME || "sebooth-media-konser";
// <sessionId>/<file name>, exactly what the kiosk's enqueueSessionUpload produces
const DEST = /^[A-Za-z0-9_-]{8,80}\/[A-Za-z0-9_.-]{1,120}$/;
const TYPES = /^(image\/(png|jpeg|gif|webp)|video\/(mp4|webm))$/;

let storage: Storage | null | undefined;
function gcs(): Storage | null {
  if (storage === undefined) {
    const json = process.env.GCS_SERVICE_ACCOUNT_JSON; // base64 of the service-account key file
    storage = json ? new Storage({ credentials: JSON.parse(Buffer.from(json, "base64").toString("utf8")) }) : null;
  }
  return storage;
}

/**
 * POST /api/booth/upload-url — a short-lived signed PUT URL for one session file, for approved booths only.
 * The GCS key stays on the server, so a copied or cracked kiosk cannot upload anything.
 * Body (device-signed): { deviceId, ts, counter, destinationPath, contentType }
 * The URL can only create the object (if-generation-match: 0); a retry after success gets 412.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateApprovedBooth(req, PATH);
  if (auth instanceof Response) return auth;
  const { destinationPath, contentType } = auth.body;
  if (typeof destinationPath !== "string" || !DEST.test(destinationPath) || typeof contentType !== "string" || !TYPES.test(contentType)) {
    return signedJson(PATH, { success: false, dropped: true, error: "Invalid destination or type" });
  }
  const client = gcs();
  if (!client) return Response.json({ success: false, error: "GCS_SERVICE_ACCOUNT_JSON not configured" }, { status: 503 });

  const headers = { "content-type": contentType, "x-goog-if-generation-match": "0", "cache-control": "public, max-age=31536000" };
  const [url] = await client.bucket(BUCKET).file(destinationPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
    extensionHeaders: { "x-goog-if-generation-match": "0", "cache-control": headers["cache-control"] },
  });
  return signedJson(PATH, { success: true, url, headers });
}
