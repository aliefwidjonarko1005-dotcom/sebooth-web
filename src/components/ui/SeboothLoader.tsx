"use client";

import { useId, type CSSProperties } from "react";
import {
  LOGO_VIEWBOX,
  LETTER_S,
  LETTER_E,
  LETTER_B,
  LETTER_T,
  LETTER_H,
  EYE_LEFT,
  EYE_RIGHT,
  PHOTOBOOTH_LABEL,
  PAPER,
  PAPER_IMAGE,
  SLOT,
} from "./seboothLogoParts";

/** Colour presets. Any of them can be overridden per use with `background`, `ink` and `accent`. */
export const SEBOOTH_LOADER_THEMES = {
  royal: { background: "#1d43c4", ink: "#fe6b00", accent: "#fe6b00" },
  navy: { background: "#00113a", ink: "#ffffff", accent: "#ff4500" },
  orange: { background: "#ff4500", ink: "#ffffff", accent: "#00113a" },
  light: { background: "#eef2ff", ink: "#002366", accent: "#ff4500" },
  white: { background: "#ffffff", ink: "#fe6b00", accent: "#002366" },
} as const;

export type SeboothLoaderTheme = keyof typeof SEBOOTH_LOADER_THEMES;

interface SeboothLoaderProps {
  /**
   * screen: covers the viewport (page loads).
   * block: the full animated logo inside a section, on a transparent ground.
   * mini: just the O-O eyes looking around, sized like an icon (buttons, small spinners).
   */
  variant?: "screen" | "block" | "mini";
  theme?: SeboothLoaderTheme;
  /** Overrides the theme's ground colour (screen only). */
  background?: string;
  /** Overrides the theme's letter colour. Mini defaults to currentColor so it inherits text colour. */
  ink?: string;
  /** Overrides the theme's PHOTOBOOTH colour. */
  accent?: string;
  /** Accessible text announced while loading. */
  label?: string;
  /** Extra classes: sizing for mini (e.g. "h-4 w-4"), width for block. */
  className?: string;
}

// Pop-in order: S, E, B, O, O, T, H (ms)
const STAGGER = 90;
// Tight box around the two eyes, for the mini variant
const EYES_VIEWBOX = "390 62 232 152";

/**
 * One eye: the egg-shaped body with its notched hole cut out by a mask, so the hole is truly
 * transparent on any background. The hole slides inside the eye, so the notch (the pupil) looks around.
 */
function Eye({ uid, eye, delay, pop }: { uid: string; eye: { body: string; white: string }; delay: number; pop: boolean }) {
  const maskId = `${uid}-mask`;
  return (
    <g className={pop ? "sb-loader__pop" : undefined} style={pop ? { animationDelay: `${delay}ms` } : undefined}>
      <g className="sb-loader__blink">
        <mask id={maskId} maskUnits="userSpaceOnUse" x="380" y="50" width="260" height="180">
          <rect x="380" y="50" width="260" height="180" fill="#fff" />
          <path className="sb-loader__look" d={eye.white} fill="#000" />
        </mask>
        <path d={eye.body} mask={`url(#${maskId})`} />
      </g>
    </g>
  );
}

export function SeboothLoader({
  variant = "screen",
  theme = "royal",
  background,
  ink,
  accent,
  label = "Memuat",
  className = "",
}: SeboothLoaderProps) {
  const uid = `sb${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const preset = SEBOOTH_LOADER_THEMES[theme];
  const colors = {
    "--sb-bg": background ?? preset.background,
    "--sb-ink": ink ?? (variant === "mini" ? "currentColor" : preset.ink),
    "--sb-accent": accent ?? preset.accent,
  } as CSSProperties;

  if (variant === "mini") {
    return (
      <span role="status" className={`sb-loader-mini ${className}`} style={colors}>
        <span className="sr-only">{label}</span>
        <svg viewBox={EYES_VIEWBOX} aria-hidden="true" className="sb-loader-mini__svg">
          <Eye uid={`${uid}-l`} eye={EYE_LEFT} delay={0} pop={false} />
          <Eye uid={`${uid}-r`} eye={EYE_RIGHT} delay={0} pop={false} />
        </svg>
      </span>
    );
  }

  // The photo raster is drawn in the default orange; other letter colours get a flat vector print instead
  const rasterPaper = (ink ?? preset.ink).toLowerCase() === SEBOOTH_LOADER_THEMES.royal.ink;

  const mark = (
    <div role="status" aria-live="polite" className={`sb-loader ${variant === "block" ? `sb-loader--block ${className}` : ""}`} style={variant === "block" ? colors : undefined}>
      <span className="sr-only">{label}</span>
      <svg viewBox={LOGO_VIEWBOX} className="sb-loader__svg" aria-hidden="true">
        <defs>
          {rasterPaper && (
            <pattern id={`${uid}-paper`} patternContentUnits="objectBoundingBox" width="1" height="1">
              <image
                href={PAPER_IMAGE.href}
                width={PAPER_IMAGE.width}
                height={PAPER_IMAGE.height}
                transform={PAPER_IMAGE.transform}
                preserveAspectRatio="none"
              />
            </pattern>
          )}
          {/* Only what is below the slot is visible, so the paper comes out of it */}
          <clipPath id={`${uid}-mouth`}>
            <rect x="380" y={SLOT.y + SLOT.height / 2} width="280" height="160" />
          </clipPath>
        </defs>

        <path className="sb-loader__label" d={PHOTOBOOTH_LABEL} />

        <g clipPath={`url(#${uid}-mouth)`}>
          <path
            className="sb-loader__paper"
            d={PAPER}
            fill={rasterPaper ? `url(#${uid}-paper)` : "#ffffff"}
            stroke={rasterPaper ? undefined : "var(--sb-ink)"}
            strokeWidth={rasterPaper ? undefined : 6}
          />
        </g>
        <rect className="sb-loader__pop" style={{ animationDelay: `${STAGGER * 3}ms` }} {...SLOT} />

        <path className="sb-loader__pop" style={{ animationDelay: "0ms" }} d={LETTER_S} />
        <path className="sb-loader__pop" style={{ animationDelay: `${STAGGER}ms` }} d={LETTER_E} />
        <path className="sb-loader__pop" style={{ animationDelay: `${STAGGER * 2}ms` }} d={LETTER_B} />
        <Eye uid={`${uid}-l`} eye={EYE_LEFT} delay={STAGGER * 3} pop />
        <Eye uid={`${uid}-r`} eye={EYE_RIGHT} delay={STAGGER * 4} pop />
        <path className="sb-loader__pop" style={{ animationDelay: `${STAGGER * 5}ms` }} d={LETTER_T} />
        <path className="sb-loader__pop" style={{ animationDelay: `${STAGGER * 6}ms` }} d={LETTER_H} />
      </svg>
      {variant === "screen" && <div className="sb-loader__flash" aria-hidden="true" />}
    </div>
  );

  if (variant === "block") return mark;
  return (
    <div className={`sb-loader-screen ${className}`} style={colors}>
      {mark}
    </div>
  );
}
