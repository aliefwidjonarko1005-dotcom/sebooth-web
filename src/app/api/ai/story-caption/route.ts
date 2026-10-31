import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/apiSecurity";
import { generateJson } from "@/lib/gemini";

export const dynamic = "force-dynamic";

const FALLBACK = [
  "Kenang-kenangan kecil dari hari ini.",
  "Satu strip, banyak cerita.",
  "Simpan dulu, biar gak lupa rasanya.",
];

/** Short, plain IG Story captions for a claimed session. Only the event name is sent to Gemini. */
export async function POST(req: Request) {
  const limited = rateLimit(req, "ai-story-caption", 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const eventName = typeof body?.eventName === "string" ? body.eventName.slice(0, 80).trim() : "";

  const prompt = [
    "Tulis 3 caption pendek untuk Instagram Story dari foto photobooth.",
    eventName ? `Acaranya: "${eventName}".` : "Nama acaranya tidak diketahui, jadi buat caption umum.",
    "Bahasa Indonesia sehari-hari yang wajar, seperti orang biasa nulis caption. Jangan lebay, jangan dipaksa gaul atau lucu,",
    "jangan pakai emoji, hashtag, atau tanda seru berlebihan. Maksimal 10 kata per caption. Jangan sebut merek apa pun.",
    "Nadanya hangat dan positif, tentang momen seru bareng orang-orang terdekat.",
    'Contoh gaya yang pas: "Kenang-kenangan kecil dari hari ini." "Seru juga ternyata." "Satu strip, banyak cerita."',
  ].join(" ");

  const result = await generateJson<{ captions: string[] }>(prompt, {
    type: "OBJECT",
    properties: { captions: { type: "ARRAY", items: { type: "STRING" } } },
    required: ["captions"],
  });

  const captions = (result?.captions || [])
    .map((c) => String(c).trim())
    .filter((c) => c.length > 0 && c.length <= 90)
    .slice(0, 3);

  return NextResponse.json({ captions: captions.length ? captions : FALLBACK, ai: captions.length > 0 });
}
