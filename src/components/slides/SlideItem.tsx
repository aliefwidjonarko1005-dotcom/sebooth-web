"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LandingSlide, SlideCta } from "@/config/landingSlides";
import { ArrowUpRight, MessageCircle, Sparkles } from "lucide-react";
import { Product } from "@/components/sections/Product";
import { FramesSlider } from "@/components/sections/FramesSlider";
import { PortfolioSlider } from "@/components/sections/PortfolioSlider";
import { PricingSlider } from "@/components/sections/PricingSlider";
import { FaqStackSlider } from "@/components/sections/FaqStackSlider";

interface SlideItemProps {
  slide: LandingSlide;
  index: number;
  isActive: boolean;
  isFirst: boolean;
}

export const SlideItem: React.FC<SlideItemProps> = ({
  slide,
  index,
  isActive,
  isFirst,
}) => {
  const [desktopError, setDesktopError] = useState(false);
  const [mobileError, setMobileError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fallback placeholder SVGs if user's PNGs are not yet added
  const desktopPlaceholder = `/images/slides/placeholders/desktop-slide-${slide.slideNumber}.svg`;
  const mobilePlaceholder = `/images/slides/placeholders/mobile-slide-${slide.slideNumber}.svg`;

  const desktopSrc = desktopError ? desktopPlaceholder : (slide.desktopImage || desktopPlaceholder);
  const mobileSrc = mobileError ? mobilePlaceholder : (slide.mobileImage || mobilePlaceholder);

  const isDesktopSvg = desktopSrc.endsWith(".svg");
  const isMobileSvg = mobileSrc.endsWith(".svg");

  const renderCtaButton = (cta: SlideCta, idx: number) => {
    const isWa = cta.variant === "whatsapp";
    const isGold = cta.variant === "gold";

    const baseStyles =
      "inline-flex items-center gap-2.5 px-6 py-3.5 text-sm md:text-base font-bold uppercase tracking-wider rounded-xl transition-all duration-300 transform active:scale-95 shadow-2xl hover:-translate-y-1";

    let colorStyles =
      "bg-primary text-white hover:bg-primary-dark border border-white/20";

    if (isWa) {
      colorStyles =
        "bg-[#25D366] text-black hover:bg-[#20bd5a] border-2 border-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    } else if (isGold) {
      colorStyles =
        "bg-[#D4AF37] text-black hover:bg-[#bfa030] border-2 border-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    } else if (cta.variant === "secondary") {
      colorStyles =
        "bg-white/95 backdrop-blur-md text-black hover:bg-white border-2 border-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    } else {
      colorStyles =
        "bg-[#FF4500] text-white hover:bg-[#e03d00] border-2 border-black font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
    }

    const content = (
      <>
        {isWa && <MessageCircle className="w-5 h-5 fill-current" />}
        {isGold && <Sparkles className="w-5 h-5" />}
        <span>{cta.text}</span>
        <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </>
    );

    if (cta.isExternal) {
      return (
        <a
          key={idx}
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group ${baseStyles} ${colorStyles}`}
        >
          {content}
        </a>
      );
    }

    return (
      <Link key={idx} href={cta.href} className={`group ${baseStyles} ${colorStyles}`}>
        {content}
      </Link>
    );
  };

  return (
    <section
      id={`slide-${slide.id}`}
      data-slide-index={index}
      className="relative w-full h-full min-h-full max-h-full shrink-0 overflow-hidden flex items-center justify-center bg-black select-none [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
      style={{
        backgroundColor: slide.bgFallbackColor || "#000000",
      }}
    >
      {/* ── MODE 1: ANIMATED HERO (PANNING BACKGROUND + CENTERED OVERLAY) ── */}
      {slide.isAnimatedHero && slide.heroBackground && slide.heroOverlay ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          {/* Seamless Infinite Panning Background Track (Right to Left) */}
          <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
            <div 
              className="animate-pan-left flex h-full will-change-transform"
              style={{
                animationPlayState: isActive ? "running" : "paused",
              }}
            >
              {/* Copy 1 */}
              <div className="relative h-full w-[180vw] md:w-[150vw] lg:w-[140vw] shrink-0">
                <Image
                  src={slide.heroBackground}
                  alt="Sebooth Compilation Photos 1"
                  fill
                  priority
                  quality={65}
                  sizes="(max-width: 768px) 180vw, 150vw"
                  className="object-cover object-center w-full h-full brightness-90 saturate-[1.1]"
                />
              </div>
              {/* Copy 2 (For seamless looping) */}
              <div className="relative h-full w-[180vw] md:w-[150vw] lg:w-[140vw] shrink-0">
                <Image
                  src={slide.heroBackground}
                  alt="Sebooth Compilation Photos 2"
                  fill
                  priority
                  quality={65}
                  sizes="(max-width: 768px) 180vw, 150vw"
                  className="object-cover object-center w-full h-full brightness-90 saturate-[1.1]"
                />
              </div>
            </div>
          </div>

          {/* Contrast Enhancing Vignette & Darkening Gradients */}
          <div className="absolute inset-0 bg-black/35 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/40 pointer-events-none" />

          {/* Centered Graphic Overlay Element */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full pointer-events-none">
            <div className="relative w-full max-w-[92vw] sm:max-w-[88vw] md:max-w-[1050px] lg:max-w-[1250px] xl:max-w-[1400px] max-h-[76vh] flex items-center justify-center p-2 sm:p-4">
              <Image
                src={slide.heroOverlay}
                alt={slide.alt || "Sebooth Hero Overlay"}
                width={2000}
                height={1200}
                priority
                quality={75}
                className="w-auto h-auto max-w-full max-h-[76vh] object-contain scale-100 sm:scale-105 md:scale-115 lg:scale-120 drop-shadow-2xl md:drop-shadow-[0_28px_65px_rgba(0,0,0,0.92)] select-none"
              />
            </div>
          </div>
        </div>
      ) : slide.id === "services" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          <Product isActive={isActive} />
        </div>
      ) : slide.id === "frames" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          <FramesSlider isActive={isActive} />
        </div>
      ) : slide.id === "portfolio" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          <PortfolioSlider isActive={isActive} />
        </div>
      ) : slide.id === "pricing" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          <PricingSlider isActive={isActive} />
        </div>
      ) : slide.id === "faq" || slide.id === "contact" ? (
        <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center">
          <FaqStackSlider isActive={isActive} />
        </div>
      ) : (
        /* ── MODE 2: STANDARD RESPONSIVE STATIC/SVG SLIDE ── */
        <>
          {/* Desktop Image Container (>= 768px) */}
          <div className="hidden md:block absolute inset-0 w-full h-full">
            <Image
              src={desktopSrc}
              alt={`${slide.alt} - Desktop View`}
              fill
              unoptimized={isDesktopSvg}
              priority={isFirst || index === 1}
              loading={isFirst || index === 1 ? "eager" : "lazy"}
              sizes="100vw"
              className={`object-cover object-center w-full h-full transition-opacity duration-700 ${
                isLoaded ? "opacity-100" : "opacity-90"
              }`}
              onError={() => setDesktopError(true)}
              onLoad={() => setIsLoaded(true)}
            />
          </div>

          {/* Mobile Image Container (< 768px) */}
          <div className="block md:hidden absolute inset-0 w-full h-full">
            <Image
              src={mobileSrc}
              alt={`${slide.alt} - Mobile View`}
              fill
              unoptimized={isMobileSvg}
              priority={isFirst || index === 1}
              loading={isFirst || index === 1 ? "eager" : "lazy"}
              sizes="100vw"
              className={`object-cover object-center w-full h-full transition-opacity duration-700 ${
                isLoaded ? "opacity-100" : "opacity-90"
              }`}
              onError={() => setMobileError(true)}
              onLoad={() => setIsLoaded(true)}
            />
          </div>

          {/* Subtle Ambient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
        </>
      )}

      {/* ── OPTIONAL INTERACTIVE CTA OVERLAY ── */}
      {slide.ctas && slide.ctas.length > 0 && slide.id !== "services" && slide.id !== "frames" && (
        <div
          className={`absolute z-20 transition-all duration-700 transform ${
            isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } ${
            slide.ctas[0]?.position === "bottom-right"
              ? "bottom-12 right-6 md:right-16"
              : slide.ctas[0]?.position === "bottom-left"
              ? "bottom-12 left-6 md:left-16"
              : isFirst
              ? "bottom-[14vh] sm:bottom-[16vh] md:bottom-[18vh] left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-3 w-full px-4"
              : "bottom-10 sm:bottom-12 md:bottom-14 left-1/2 -translate-x-1/2 flex flex-wrap items-center justify-center gap-3 w-full px-4"
          }`}
        >
          {slide.ctas.map((cta, idx) => renderCtaButton(cta, idx))}
        </div>
      )}
    </section>
  );
};
