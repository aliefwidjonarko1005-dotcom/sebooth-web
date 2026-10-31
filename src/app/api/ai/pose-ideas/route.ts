import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/apiSecurity";
import { generateJson } from "@/lib/gemini";
import { POSE_PEOPLE, POSE_VIBES, type PoseIdea } from "@/config/poseIdeas";

export const dynamic = "force-dynamic";

const FALLBACK: PoseIdea[] = [
  { title: "Tatap kamera bareng", how: "Berdiri rapat, semua lihat lensa, senyum natural.", query: "photobooth pose group natural" },
  { title: "Candid ketawa", how: "Satu orang bilang sesuatu yang lucu, foto pas semua ketawa.", query: "photobooth candid laugh pose" },
  { title: "Props di depan muka", how: "Pegang props di depan wajah, yang lain menoleh ke arahnya.", query: "photobooth props pose ideas" },
  { title: "Pose ganti tiap frame", how: "Sepakati pose beda untuk tiap jepretan: kaget, cool, peace.", query: "photobooth strip pose sequence" },
];

/** Pose suggestions for the booth, each with a search phrase for Pinterest/Google/IG references. */
export async function POST(req: Request) {
  const limited = rateLimit(req, "ai-pose-ideas", 8, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const people = (POSE_PEOPLE as readonly string[]).includes(body?.people) ? (body.people as string) : "2";
  const vibe = (POSE_VIBES as readonly string[]).includes(body?.vibe) ? (body.vibe as string) : "Seru";

  const prompt = [
    `Kasih 4 ide pose photobooth untuk ${people} orang dengan suasana "${vibe}".`,
    "Booth-nya mengambil 3-4 jepretan berurutan dari depan, jadi pose harus muat dalam satu frame dan mudah ditiru dalam beberapa detik.",
    "Untuk tiap ide: title (maks 5 kata, Bahasa Indonesia), how (1 kalimat cara melakukannya, bahasa sehari-hari yang wajar),",
    "dan query (frasa pencarian singkat dalam Bahasa Inggris untuk cari foto referensi di Pinterest, maks 6 kata).",
  ].join(" ");

  const result = await generateJson<{ ideas: PoseIdea[] }>(prompt, {
    type: "OBJECT",
    properties: {
      ideas: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: { title: { type: "STRING" }, how: { type: "STRING" }, query: { type: "STRING" } },
          required: ["title", "how", "query"],
        },
      },
    },
    required: ["ideas"],
  });

  const ideas = (result?.ideas || [])
    .filter((i) => i && i.title && i.how && i.query)
    .map((i) => ({ title: i.title.slice(0, 60), how: i.how.slice(0, 200), query: i.query.slice(0, 80) }))
    .slice(0, 4);

  return NextResponse.json({ ideas: ideas.length ? ideas : FALLBACK, ai: ideas.length > 0 });
}
