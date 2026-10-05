"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════════════════
   iOS DEPTH DOCK — Ultra-Lightweight Apple-Grade Mobile Navigation
   ─────────────────────────────────────────────────────────────────────────
   Design System (matching iOS reference image):
   • Translucent Dark Frosted Glass Capsule:
     Rich slate-midnight glass material with 1px continuous specular top highlight.
   • Authentic iOS Recessed Depth (No liquid/cairan deformation):
     Selected tab indicator is a sunken/recessed depth pill with calibrated
     inner shadows, dark upper bevel, and ambient bottom bounce.
   • Pure Hardware-Accelerated Compositor Translation:
     Zero JavaScript ticker loops, zero requestAnimationFrame thrashing.
     Transitions smoothly via GPU compositor (cubic-bezier(0.16, 1, 0.3, 1))
     at silky 60/120 FPS on all mobile devices.
   • Crisp Solid Active Icon vs Refined Outline Inactive Icons:
     Matches the reference image's contrast hierarchy.
   • 0ms Instant Tactile Touch Response:
     Immediate micro-scale on tap with optional haptic trigger.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface LiquidDockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Optional solid/filled icon rendered when item is selected (like iOS reference). */
  activeIcon?: React.ReactNode;
  /** Click handler (used when `href` is not provided). */
  onSelect?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Render as a Next.js Link instead of a button. */
  href?: string;
  /** DOM id for tours / testing. */
  domId?: string;
  title?: string;
  disabled?: boolean;
  /** `danger` tints the depth pill into a rich ruby recessed well (e.g. logout). */
  tone?: "default" | "danger";
}

interface LiquidGlassDockProps {
  items: LiquidDockItem[];
  activeId: string | null;
  ariaLabel: string;
  /** Surface style: defaults to "dark" matching the iOS reference image. */
  surface?: "light" | "dark";
  /** Show tiny text labels under the icons. */
  showLabels?: boolean;
  /** Width/height classes applied to every item AND the indicator. */
  itemSizeClassName?: string;
  className?: string;
  /** Optional tactile haptic click trigger */
  onHaptic?: (type?: "tick" | "pop") => void;
}

export function LiquidGlassDock({
  items,
  activeId,
  ariaLabel,
  surface = "dark",
  showLabels = false,
  itemSizeClassName = "w-[52px] sm:w-[58px] h-10 sm:h-11",
  className = "",
  onHaptic,
}: LiquidGlassDockProps) {
  const activeIndex = items.findIndex((item) => item.id === activeId);
  const hasActive = activeIndex >= 0;
  const activeItem = hasActive ? items[activeIndex] : null;

  const [pressedId, setPressedId] = useState<string | null>(null);

  // Keep the indicator parked at the last active slot so it doesn't snap to slot 0 when inactive
  const parkedIndexRef = useRef<number>(Math.max(activeIndex, 0));
  if (hasActive) parkedIndexRef.current = activeIndex;
  const targetIndex = hasActive ? activeIndex : parkedIndexRef.current;

  const isDanger = activeItem?.tone === "danger";

  return (
    <nav
      aria-label={ariaLabel}
      role="tablist"
      className={`liquid-dock pointer-events-auto relative p-1 sm:p-1.5 rounded-full overflow-hidden ${className}`}
    >
      <div className="relative flex items-center">
        {/* ─── iOS Depth Recessed Indicator (Pure GPU Compositor CSS Transition) ─── */}
        <span
          aria-hidden="true"
          className={`liquid-dock__indicator absolute left-0 top-0 bottom-0 pointer-events-none ${itemSizeClassName}`}
          style={{
            transform: `translate3d(${targetIndex * 100}%, 0, 0)`,
            opacity: hasActive ? 1 : 0,
            transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease-out",
          }}
        >
          <span
            className={`liquid-dock__blob absolute inset-0.5 rounded-full ${
              isDanger ? "liquid-dock__blob--danger" : ""
            }`}
          />
        </span>

        {items.map((item, index) => {
          const isActive = index === activeIndex;
          const isPressed = pressedId === item.id;
          const currentIcon = isActive && item.activeIcon ? item.activeIcon : item.icon;

          const content = (
            <span
              className={`liquid-dock__content relative z-10 flex flex-col items-center justify-center gap-0.5 ${
                isActive ? "liquid-dock__content--active" : ""
              } ${isPressed ? "liquid-dock__content--pressed" : ""}`}
            >
              {currentIcon}
              {showLabels && (
                <span className="text-[9px] leading-none font-bold tracking-wide whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </span>
          );

          const sharedClass = `relative shrink-0 flex items-center justify-center rounded-full select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/70 [-webkit-tap-highlight-color:transparent] transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${itemSizeClassName} ${
            isActive
              ? "text-white"
              : item.tone === "danger"
                ? "text-white/60 hover:text-rose-400"
                : "text-white/60 hover:text-white/95"
          }`;

          const handleTouchStart = () => {
            setPressedId(item.id);
          };

          const handleTouchEnd = () => {
            setPressedId(null);
          };

          const handleClick = (e: React.MouseEvent<HTMLElement>) => {
            setPressedId(null);
            if (!isActive) {
              if (onHaptic) {
                onHaptic(item.tone === "danger" ? "pop" : "tick");
              } else if (typeof navigator !== "undefined" && "vibrate" in navigator) {
                try {
                  navigator.vibrate(10);
                } catch {
                  /* ignore */
                }
              }
            }
            item.onSelect?.(e);
          };

          if (item.href) {
            return (
              <Link
                key={item.id}
                id={item.domId}
                href={item.href}
                role="tab"
                aria-selected={isActive}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                title={item.title ?? item.label}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={sharedClass}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              id={item.domId}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={handleClick}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchEnd}
              onMouseDown={handleTouchStart}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              disabled={item.disabled}
              title={item.title ?? item.label}
              aria-label={item.label}
              aria-pressed={isActive}
              className={sharedClass}
            >
              {content}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
