"use client";

import React from "react";

export interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  onSelect?: (e: React.MouseEvent<HTMLElement>) => void;
  /** DOM id for the guide and tests. */
  domId?: string;
  title?: string;
  disabled?: boolean;
  /** `danger` turns the pill red while this item is active (e.g. logging out). */
  tone?: "default" | "danger";
}

interface DockProps {
  items: DockItem[];
  activeId: string;
  ariaLabel: string;
  className?: string;
  onHaptic?: (type?: "tick" | "pop") => void;
}

/** Floating bottom navigation: a row of icon buttons with a pill that slides to the active one. */
export function Dock({ items, activeId, ariaLabel, className = "", onHaptic }: DockProps) {
  const activeIndex = Math.max(items.findIndex((item) => item.id === activeId), 0);
  const isDanger = items[activeIndex]?.tone === "danger";

  return (
    <nav
      aria-label={ariaLabel}
      className={`pointer-events-auto rounded-full bg-blue-dark p-1 shadow-[0_8px_24px_rgba(0,17,58,0.4)] ${className}`}
    >
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-14 rounded-full transition-[transform,background-color] duration-200 ease-out motion-reduce:transition-none ${
            isDanger ? "bg-red-600" : "bg-secondary"
          }`}
          style={{ transform: `translate3d(${activeIndex * 100}%, 0, 0)` }}
        />

        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.id}
              id={item.domId}
              type="button"
              onClick={(e) => {
                if (!isActive) onHaptic?.(item.tone === "danger" ? "pop" : "tick");
                item.onSelect?.(e);
              }}
              disabled={item.disabled}
              title={item.title ?? item.label}
              aria-label={item.label}
              aria-current={isActive ? "true" : undefined}
              className={`relative flex h-12 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-[color,transform] duration-150 outline-none select-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-white active:scale-90 disabled:cursor-wait ${
                isActive && !isDanger ? "text-blue-dark" : "text-white"
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
