import { NextRequest } from "next/server";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/apiSecurity";
import { authenticateApprovedBooth, signedJson } from "@/lib/boothGuard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PATH = "/api/booth/email";
const BUCKET = process.env.GCS_BUCKET_NAME || "sebooth-media-konser";
const SITES = [process.env.NEXT_PUBLIC_SITE_URL || "", "https://www.sebooth.in", "https://sebooth.in"]
  .filter(Boolean)
  .map((s) => s.replace(/\/$/, "") + "/");
const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[A-Za-z]{2,}$/;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * POST /api/booth/email — send a customer their gallery link from an approved booth. The Gmail app
 * password lives only in Vercel env (GMAIL_USER, GMAIL_APP_PASSWORD). Links are limited to this site
 * and the media bucket, so a booth cannot use it to mail arbitrary content.
 * Body (device-signed): { deviceId, ts, counter, to, sessionId, galleryUrl, photoStripUrl? }
 */
export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "booth-email", 60, 60 * 60 * 1000);
  if (limited) return limited;
  const auth = await authenticateApprovedBooth(req, PATH);
  if (auth instanceof Response) return auth;
  const { to, sessionId, galleryUrl, photoStripUrl } = auth.body;

  const mediaPrefix = `https://storage.googleapis.com/${BUCKET}/`;
  if (
    typeof to !== "string" || !EMAIL.test(to) ||
    typeof sessionId !== "string" || !/^[A-Za-z0-9_-]{6,80}$/.test(sessionId) ||
    typeof galleryUrl !== "string" || !(SITES.some((s) => galleryUrl.startsWith(s)) || galleryUrl.startsWith(mediaPrefix)) ||
    (photoStripUrl !== undefined && (typeof photoStripUrl !== "string" || !photoStripUrl.startsWith(mediaPrefix)))
  ) {
    return signedJson(PATH, { success: false, error: "Invalid email request" });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return signedJson(PATH, { success: false, error: "Email not configured on the server" });

  try {
    const info = await nodemailer.createTransport({ service: "gmail", auth: { user, pass } }).sendMail({
      from: `"Sebooth Photos" <${user}>`,
      to,
      subject: "Foto Sebooth kamu sudah siap",
      html: `<!DOCTYPE html><html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#f4f6fb;padding:32px;text-align:center;color:#111">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <h1 style="font-size:24px;margin:0 0 12px">Foto Sebooth kamu sudah siap</h1>
    <p style="color:#444;line-height:1.6">Lihat dan unduh semua foto, GIF, dan live photo dari sesi kamu di galeri online.</p>
    <a href="${escapeHtml(galleryUrl)}" style="display:inline-block;margin:16px 0;padding:14px 28px;background:#1d43c4;color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Buka galeri</a>
    <p style="color:#888;font-size:12px;margin-top:24px">Sesi ${escapeHtml(sessionId)}</p>
  </div></body></html>`,
      attachments: photoStripUrl ? [{ filename: "sebooth-strip" + (photoStripUrl.match(/\.\w+$/)?.[0] || ".jpg"), path: photoStripUrl }] : [],
    });
    return signedJson(PATH, { success: true, messageId: info.messageId });
  } catch (e) {
    console.error("[BoothGuard] email failed:", e);
    return signedJson(PATH, { success: false, error: "Email could not be sent" });
  }
}
