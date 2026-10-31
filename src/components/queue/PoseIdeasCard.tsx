"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RefreshCw } from "lucide-react";
import { SeboothLoader } from "@/components/ui/SeboothLoader";
import { POSE_PEOPLE, POSE_VIBES, poseReferenceLinks, type PoseIdea, type PosePeople, type PoseVibe } from "@/config/poseIdeas";

const PEOPLE_LABEL: Record<PosePeople, string> = { "1": "SENDIRI", "2": "BERDUA", "3-4": "3-4 ORANG", "5+": "5+ ORANG" };

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

    // Hard offset shadows are the queue pages' brutalist system (AGENTS.md), not decoration
    const chip = (active: boolean) =>
        `min-h-[44px] px-3.5 border-2 border-black text-[0.75rem] font-black uppercase tracking-wider transition-[transform,box-shadow] duration-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
            active ? "bg-primary text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]" /* taste-skill-ignore */ : "bg-white text-primary shadow-[2px_2px_0px_rgba(0,0,0,1)]"
        }`;

    return (
        <motion.div
            id="guide-ticket-pose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border-4 border-black hard-shadow-black p-4"
        >
            <p className="text-primary text-[0.8rem] font-black uppercase tracking-widest mb-1 text-center border-b-2 border-black pb-2">
                BINGUNG MAU POSE APA?
            </p>
            <p className="text-primary/80 text-[0.85rem] font-semibold text-center mt-2 mb-4">Pilih dulu, nanti dikasih ide pose plus contoh fotonya.</p>

            <p className="text-primary/80 text-[0.75rem] font-black uppercase tracking-wider mb-2">FOTO BERAPA ORANG?</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {POSE_PEOPLE.map((p) => (
                    <button key={p} onClick={() => setPeople(p)} aria-pressed={people === p} className={chip(people === p)}>
                        {PEOPLE_LABEL[p]}
                    </button>
                ))}
            </div>

            <p className="text-primary/80 text-[0.75rem] font-black uppercase tracking-wider mb-2">MAU GAYA APA?</p>
            <div className="flex flex-wrap gap-2 mb-4">
                {POSE_VIBES.map((v) => (
                    <button key={v} onClick={() => setVibe(v)} aria-pressed={vibe === v} className={chip(vibe === v)}>
                        {v}
                    </button>
                ))}
            </div>

            <button
                onClick={fetchIdeas}
                disabled={!people || !vibe || loading}
                className={/* taste-skill-ignore: brutalist system */ "w-full bg-secondary text-white font-black text-[0.85rem] uppercase tracking-wider border-4 border-black py-3 flex items-center justify-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-[transform,box-shadow] duration-100 disabled:opacity-50 disabled:active:translate-x-0 disabled:active:translate-y-0"}
            >
                {loading ? (
                    <SeboothLoader variant="mini" className="w-5 h-5" />
                ) : ideas ? (
                    <>
                        <RefreshCw className="w-4 h-4" /> KASIH IDE LAIN
                    </>
                ) : (
                    "CARIKAN IDE POSE"
                )}
            </button>

            {error && (
                <p className="mt-3 bg-red-200 border-2 border-black px-3 py-2 text-red-700 text-[0.7rem] font-black uppercase tracking-wider">{error}</p>
            )}

            <div aria-live="polite">
            <AnimatePresence mode="popLayout">
                {ideas && !loading && (
                    <motion.ul key={ideas.map((i) => i.title).join("|")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 space-y-3">
                        {ideas.map((idea, i) => (
                            <li key={`${idea.title}-${i}`} className="border-2 border-black bg-gray-50 p-3">
                                <p className="text-primary text-[0.85rem] font-black uppercase tracking-wide">{idea.title}</p>
                                <p className="text-primary text-[0.9rem] font-medium mt-1 leading-normal">{idea.how}</p>
                                <div className="flex flex-wrap gap-1.5 mt-2.5">
                                    {poseReferenceLinks(idea.query).map((l) => (
                                        <a
                                            key={l.label}
                                            href={l.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 min-h-[36px] bg-white border-2 border-black px-2.5 text-[0.7rem] font-black uppercase tracking-wider text-primary hover:bg-yellow-200 transition-colors"
                                        >
                                            {l.label} <ExternalLink className="w-3 h-3" />
                                        </a>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
            </div>
        </motion.div>
    );
}
