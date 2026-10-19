"use client";

import { useEffect, useState } from "react";
import { SeboothLoader } from "./SeboothLoader";

const SEEN_KEY = "sb-boot-seen";
// First hard load of a visit plays the whole reveal; later hard loads only cover the first paint
const FULL_REVEAL_MS = 3100;
const REPEAT_MIN_MS = 600;

/**
 * Logo splash over the first paint of every hard page load (typed URL, refresh, QR scan).
 * Client-side navigations are covered by app/loading.tsx instead.
 */
export function BootSplash() {
  const [phase, setPhase] = useState<"on" | "out" | "gone">("on");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Storage blocked (private mode): behave like a repeat visit
      seen = true;
    }
    const minMs = seen ? REPEAT_MIN_MS : FULL_REVEAL_MS;
    let hideTimer: ReturnType<typeof setTimeout>;
    let removeTimer: ReturnType<typeof setTimeout>;

    const hide = () => {
      // performance.now() counts from the start of the navigation, so the splash time already shown counts
      hideTimer = setTimeout(() => {
        setPhase("out");
        removeTimer = setTimeout(() => setPhase("gone"), 450);
      }, Math.max(0, minMs - performance.now()));
    };

    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });

    return () => {
      window.removeEventListener("load", hide);
      clearTimeout(hideTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div className={`sb-boot ${phase === "out" ? "sb-boot--out" : ""}`} aria-hidden={phase === "out"}>
      <SeboothLoader label="Memuat Sebooth" />
    </div>
  );
}
