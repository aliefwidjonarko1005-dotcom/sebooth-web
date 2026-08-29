"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { LANDING_SLIDES, LandingSlide } from "@/config/landingSlides";
import { SlideItem } from "./SlideItem";
import { SlideNavigationDots } from "./SlideNavigationDots";
import { ChevronDown } from "lucide-react";

interface SlideDeckLandingProps {
  slides?: LandingSlide[];
}

export const SlideDeckLanding: React.FC<SlideDeckLandingProps> = ({
  slides = LANDING_SLIDES,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Navigate to slide index smoothly using native scroll
  const goToSlide = useCallback((index: number) => {
    if (!containerRef.current) return;
    const targetEl = containerRef.current.children[index] as HTMLElement;
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
      setActiveIndex(index);
    }
  }, []);

  const nextSlide = useCallback(() => {
    if (activeIndex < slides.length - 1) {
      goToSlide(activeIndex + 1);
    }
  }, [activeIndex, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    if (activeIndex > 0) {
      goToSlide(activeIndex - 1);
    }
  }, [activeIndex, goToSlide]);

  // Track active slide with 120fps native IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-slide-index"));
            if (!isNaN(index)) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.52,
      }
    );

    const children = Array.from(container.children);
    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Listen for custom navigation events dispatched by nested sliders (e.g. Portfolio gallery)
  useEffect(() => {
    const handleCustomNext = () => nextSlide();
    const handleCustomPrev = () => prevSlide();
    const handleCustomGo = (e: Event) => {
      const customEvent = e as CustomEvent<number>;
      if (typeof customEvent.detail === "number") {
        goToSlide(customEvent.detail);
      }
    };

    window.addEventListener("sebooth:next-slide", handleCustomNext);
    window.addEventListener("sebooth:prev-slide", handleCustomPrev);
    window.addEventListener("sebooth:go-to-slide", handleCustomGo);

    return () => {
      window.removeEventListener("sebooth:next-slide", handleCustomNext);
      window.removeEventListener("sebooth:prev-slide", handleCustomPrev);
      window.removeEventListener("sebooth:go-to-slide", handleCustomGo);
    };
  }, [nextSlide, prevSlide, goToSlide]);

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-black select-none">
      {/* ── NATIVE HARDWARE ACCELERATED CSS SNAP SLIDE DECK (120FPS MOBILE) ── */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden [scroll-snap-type:y_mandatory] [scroll-behavior:smooth] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden touch-pan-y [transform:translate3d(0,0,0)]"
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide-index={index}
            className="w-full h-[100dvh] min-h-[100dvh] max-h-[100dvh] [scroll-snap-align:start] [scroll-snap-stop:always] shrink-0 relative overflow-hidden [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
          >
            <SlideItem
              slide={slide}
              index={index}
              isActive={activeIndex === index}
              isFirst={index === 0}
            />
          </div>
        ))}
      </div>

      {/* ── VERTICAL DOT NAVIGATION INDICATOR ── */}
      <SlideNavigationDots
        slides={slides}
        activeIndex={activeIndex}
        onSelectSlide={goToSlide}
      />

      {/* ── SCROLL DOWN CUE (Mobile HP & Slide 0 - STATIC) ── */}
      {activeIndex < slides.length - 1 && (
        <button
          onClick={nextSlide}
          aria-label="Scroll ke slide berikutnya"
          className={`fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-white hover:text-white transition-opacity duration-300 group cursor-pointer focus:outline-none ${
            activeIndex === 0 ? "flex" : "flex md:hidden"
          }`}
        >
          <span className="text-[9.5px] xs:text-xs sm:text-sm font-extrabold tracking-[0.2em] uppercase text-[#F59E0B] group-hover:text-[#FF5500] transition-colors drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] filter">
            SCROLL UNTUK GANTI SLIDE
          </span>
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/25 flex items-center justify-center group-hover:border-[#FF5500] group-hover:bg-[#FF5500]/30 transition-all shadow-lg">
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
          </div>
        </button>
      )}
    </div>
  );
};
