"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type { FrameItem } from "@/data/frames";
import { frameImage } from "@/data/frameEvents";
import s from "./eventFrames.module.css";

export interface FrameSliderHandle {
    goTo: (index: number, instant?: boolean) => void;
}

interface FrameSliderProps {
    frames: FrameItem[];
    onActiveChange: (index: number) => void;
}

function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Phones centre the frame; desktop lines it up with the left margin (see .slide in the CSS). */
function isStartAligned(slide: HTMLElement) {
    return getComputedStyle(slide).scrollSnapAlign.includes("start");
}

/**
 * One frame per page on a native scroll-snap track, so the slide follows the finger at full frame rate
 * on any phone. Neighbours peek in at the edges and grow as they reach the centre.
 */
export const FrameSlider = forwardRef<FrameSliderHandle, FrameSliderProps>(function FrameSlider(
    { frames, onActiveChange },
    ref
) {
    const trackRef = useRef<HTMLDivElement>(null);
    const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
    const activeRef = useRef(0);

    const goTo = useCallback((index: number, instant = false) => {
        const track = trackRef.current;
        const slide = slideRefs.current[index];
        if (!track || !slide) return;
        const left = isStartAligned(slide)
            ? slide.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || "0")
            : slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;
        track.scrollTo({ left, behavior: instant || prefersReducedMotion() ? "auto" : "smooth" });
    }, []);

    useImperativeHandle(ref, () => ({ goTo }), [goTo]);

    // Scale and dim each slide by its distance from the centre; report the slide that sits there
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        let frame = 0;
        const reduce = prefersReducedMotion();

        function paint() {
            frame = 0;
            const first = slideRefs.current[0];
            if (!track || !first) return;
            // The resting spot of the active slide's left edge
            const anchor = isStartAligned(first)
                ? track.scrollLeft + parseFloat(getComputedStyle(track).scrollPaddingLeft || "0")
                : track.scrollLeft + (track.clientWidth - first.clientWidth) / 2;
            let nearest = 0;
            let nearestDist = Infinity;
            slideRefs.current.forEach((slide, i) => {
                if (!slide) return;
                const step = slide.clientWidth + 12; // .slides gap
                const d = (slide.offsetLeft - anchor) / step;
                const abs = Math.min(1, Math.abs(d));
                if (Math.abs(d) < nearestDist) {
                    nearestDist = Math.abs(d);
                    nearest = i;
                }
                if (reduce) return;
                slide.style.setProperty("--k", abs.toFixed(3));
                slide.style.setProperty("--d", Math.max(-1, Math.min(1, d)).toFixed(3));
            });
            if (nearest !== activeRef.current) {
                activeRef.current = nearest;
                onActiveChange(nearest);
            }
        }

        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(paint);
        };
        paint();
        track.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            cancelAnimationFrame(frame);
            track.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        };
    }, [onActiveChange]);

    return (
        <div ref={trackRef} className={s.track} tabIndex={-1}>
            <ul className={s.slides}>
                {frames.map((f, i) => (
                    <li
                        key={f.id}
                        ref={(el) => {
                            slideRefs.current[i] = el;
                        }}
                        className={s.slide}
                        aria-roledescription="slide"
                        aria-label={`${i + 1} dari ${frames.length}: ${f.title}`}
                    >
                        <div className={s.slideCard}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={frameImage(f.image_url, "modal")}
                                alt={`Desain frame ${f.title}`}
                                width={1200}
                                height={943}
                                draggable={false}
                                loading={i < 2 ? "eager" : "lazy"}
                                fetchPriority={i === 0 ? "high" : "auto"}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
});
