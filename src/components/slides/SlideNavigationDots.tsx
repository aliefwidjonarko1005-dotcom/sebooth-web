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
      className="hidden md:flex fixed right-8 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-3 p-3 rounded-full bg-black/30 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300"
    >
      {slides.map((slide, idx) => {
        const isActive = activeIndex === idx;
        return (
          <button
            key={slide.id}
            onClick={() => onSelectSlide(idx)}
            aria-label={`Pindah ke Slide ${slide.slideNumber}: ${slide.title}`}
            className="group relative flex items-center justify-center p-1.5 focus:outline-none"
          >
            {/* Tooltip on Desktop */}
            <span className="hidden md:block absolute right-full mr-3.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap opacity-0 pointer-events-none transition-all duration-200 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 shadow-lg">
              <span className="text-[#D4AF37] mr-1.5">[{slide.slideNumber}]</span>
              {slide.title}
            </span>

            {/* Dot Indicator */}
            <div
              className={`transition-all duration-300 rounded-full ${
                isActive
                  ? "w-3 h-8 md:w-3.5 md:h-9 bg-[#FF4500] ring-2 ring-white/60 shadow-[0_0_12px_#FF4500]"
                  : "w-2.5 h-2.5 md:w-3 md:h-3 bg-white/40 group-hover:bg-white/80 group-hover:scale-125"
              }`}
            />
          </button>
        );
      })}
    </nav>
  );
};
