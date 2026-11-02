"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw } from "lucide-react";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { POSE_PEOPLE, POSE_VIBES, poseReferenceLinks, type PoseIdea, type PosePeople, type PoseVibe } from "@/config/poseIdeas";
import { FLOW_BUTTON_ORANGE, FLOW_HEADING } from "@/components/ui/FlowHero";

const PEOPLE_LABEL: Record<PosePeople, string> = { "1": "Sendiri", "2": "Berdua", "3-4": "3-4 orang", "5+": "5+ orang" };

/** While waiting in line: pick group size + vibe, get pose ideas with links to reference photos. */
export default function PoseIdeasCard() {
    const [people, setPeople] = useState<PosePeople | null>(null);
    const [vibe, setVibe] = useState<PoseVibe | null>(null);
    const [ideas, setIdeas] = useState<PoseIdea[] | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchIdeas = async () => {
        if (!people || !vibe) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/ai/pose-ideas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ people, vibe }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Gagal memuat ide pose.");
            setIdeas(data.ideas);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Gagal memuat ide pose.");
        } finally {
            setLoading(false);
        }
    };

    const chip = (active: boolean) =>
        `min-h-11 rounded-full px-4 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
            active ? "bg-primary text-white" : "bg-blue-light text-primary hover:bg-slate-200"
        }`;

    return (
        <section id="guide-ticket-pose" className="rounded-2xl bg-white p-5 text-blue-dark">
            <h2 className={FLOW_HEADING}>Bingung Mau Pose Apa?</h2>
            <p className="mt-1.5 text-[17px] leading-snug">Pilih dulu, nanti dikasih ide pose plus contoh fotonya.</p>

            <p className="mt-4 text-[15px] leading-snug font-bold">Foto berapa orang?</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {POSE_PEOPLE.map((p) => (
                    <button key={p} type="button" onClick={() => setPeople(p)} aria-pressed={people === p} className={chip(people === p)}>
                        {PEOPLE_LABEL[p]}
                    </button>
                ))}
            </div>

            <p className="mt-4 text-[15px] leading-snug font-bold">Mau gaya apa?</p>
            <div className="mt-2 flex flex-wrap gap-2">
                {POSE_VIBES.map((v) => (
                    <button key={v} type="button" onClick={() => setVibe(v)} aria-pressed={vibe === v} className={chip(vibe === v)}>
                        {v}
                    </button>
                ))}
            </div>

            <button type="button" onClick={fetchIdeas} disabled={!people || !vibe || loading} className={`mt-5 ${FLOW_BUTTON_ORANGE}`}>
                {loading ? (
                    <SeboothLoader variant="mini" className="h-5 w-5" />
                ) : ideas ? (
                    <>
                        <RefreshCw className="h-5 w-5" aria-hidden="true" /> Kasih Ide Lain
                    </>
                ) : (
                    "Carikan Ide Pose"
                )}
            </button>

            {error && (
                <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-[15px] leading-snug font-medium text-red-700">
                    {error}
                </p>
            )}

            <div aria-live="polite">
                <AnimatePresence mode="popLayout">
                    {ideas && !loading && (
                        <motion.ul key={ideas.map((i) => i.title).join("|")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-5">
                            {ideas.map((idea, i) => (
                                <li key={`${idea.title}-${i}`}>
                                    <p className="text-[17px] leading-snug font-bold text-primary">{idea.title}</p>
                                    <p className="mt-1 text-[17px] leading-snug">{idea.how}</p>
                                    <div className="mt-2.5 flex flex-wrap gap-2">
                                        {poseReferenceLinks(idea.query).map((l) => (
                                            <a
                                                key={l.label}
                                                href={l.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-blue-light px-4 text-[15px] font-semibold text-primary transition-colors hover:bg-slate-200"
                                            >
                                                {l.label} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                                            </a>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
