"use client";

import React from "react";
import { LandingSlide } from "@/config/landingSlides";

interface SlideNavigationDotsProps {
  slides: LandingSlide[];
  activeIndex: number;
  onSelectSlide: (index: number) => void;
}

export const SlideNavigationDots: React.FC<SlideNavigationDotsProps> = ({
  slides,
  activeIndex,
  onSelectSlide,
}) => {
  return (
    <nav
      aria-label="Slide Navigation"
      className="hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-1 p-1.5 rounded-full bg-blue-dark"
    >
      {slides.map((slide, idx) => {
        const isActive = activeIndex === idx;
        return (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(idx)}
            aria-label={`Pindah ke Slide ${slide.slideNumber}: ${slide.title}`}
            className="group relative flex cursor-pointer items-center justify-center rounded-full p-1.5 focus-visible:outline-2 focus-visible:outline-white"
          >
            {/* Tooltip on Desktop */}
            <span className="hidden absolute right-full mr-3 rounded-lg bg-blue-dark px-3 py-1.5 text-sm font-medium text-white whitespace-nowrap pointer-events-none group-hover:block group-focus-visible:block">
              {slide.title}
            </span>

            {/* Dot Indicator */}
            <div
              className={`transition-[height,background-color] duration-300 rounded-full ${
                isActive
                  ? "w-2.5 h-7 bg-secondary"
                  : "w-2.5 h-2.5 bg-white/50 group-hover:bg-white"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
