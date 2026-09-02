'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  MoreHorizontal, 
  Search, 
  Palette, 
  Heart, 
  User, 
  SlidersHorizontal,
  Plus,
  Share2,
  Lock,
  Mic,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  X,
  MessageCircle
} from 'lucide-react'

export interface ProductItem {
  id: string
  num: string
  title: string
  subtitle: string
  desc: string
  image: string
  avatar: string
  ctaText: string
  waText: string
  features: string[]
  badge: string
  priceTag?: string
}

const PRODUCTS: ProductItem[] = [
  {
    id: 'mini-studio',
    num: '01',
    title: 'Mini Studio Photobooth',
    subtitle: 'Studio Lighting & Professional Backdrop',
    desc: 'Pengalaman mini studio foto profesional lengkap dengan lighting studio, backdrop kustom, dan pilihan properti foto seru untuk setiap momen spesialmu.',
    image: '/images/products/mini_studio_booth.png',
    avatar: '/images/products/mini_studio_booth.png',
    ctaText: 'Mau ini dong',
    waText: 'Halo Sebooth, saya berminat dengan Mini Studio Photobooth!',
    features: ['Professional Studio Lighting', 'Custom Backdrop Selection', 'High Res Digital Softfiles', 'Instant QR Scan Access', 'Cetak Strip High Quality'],
    badge: 'MOST FAVORITE',
    priceTag: 'Mulai 1.2jt'
  },
  {
    id: 'vending-machine',
    num: '02',
    title: 'Vending Machine Photobooth',
    subtitle: 'Self-Service Kiosk & Futuristic Experience',
    desc: 'Konsep photobooth mandiri bergaya Vending Machine interaktif modern. Solusi estetik & futuristik untuk event, mall, cafe, dan brand activation.',
    image: '/images/products/vending_machine_booth.png',
    avatar: '/images/products/vending_machine_booth.png',
    ctaText: 'Mau ini dong',
    waText: 'Halo Sebooth, saya tertarik dengan Vending Machine Photobooth!',
    features: ['Self-Service Interactive Touchscreen', 'Custom Branding Wrap', 'Instant High-Speed Printing', 'QR Softfile & GIF Download', 'Compact Futuristic Design'],
    badge: 'POPULAR & UNIQUE',
    priceTag: 'Exclusive Rate'
  },
  {
    id: 'sebooth-partner',
    num: '03',
    title: 'Jadi Partner Sebooth',
    subtitle: 'Kemitraan & Kolaborasi Event Official',
    desc: 'Gabung sebagai partner resmi Sebooth untuk WO & EO. Dapatkan komisi profit sharing, prioritas operator support, dan fasilitas sponsorship event.',
    image: '/images/products/partner_sebooth.png',
    avatar: '/images/products/partner_sebooth.png',
    ctaText: 'Mau ini dong',
    waText: 'Halo Sebooth, saya mau join sebagai Partner resmi Sebooth!',
    features: ['Komisi & Profit Sharing', 'Priority Operator Support', 'Marketing Assets Support', 'Sponsorship Event Partner', 'Co-Branding Options'],
    badge: 'PARTNERSHIP',
    priceTag: 'Join Partner'
  }
]

const PARTNER_LOGOS = [
  { id: 'logo-1', src: '/images/partners/logo_1.png', alt: 'Partner Logo 1' },
  { id: 'logo-2', src: '/images/partners/logo_2.png', alt: 'Partner Logo 2' },
  { id: 'logo-3', src: '/images/partners/logo_3.png', alt: 'Partner Logo 3' },
  { id: 'logo-4', src: '/images/partners/logo_4.png', alt: 'Partner Logo 4' },
  { id: 'logo-5', src: '/images/partners/logo_5.png', alt: 'Partner Logo 5' },
  { id: 'logo-6', src: '/images/partners/logo_6.png', alt: 'Partner Logo 6', scaleClass: 'scale-[1.45] sm:scale-[1.55]' },
]

interface ProductProps {
  initialData?: Record<string, string>
  isActive?: boolean
}

export function Product({ initialData = {}, isActive = true }: ProductProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({})
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Touch Swipe Handling
  const touchStartX = useRef<number | null>(null)

  const count = PRODUCTS.length
  const normalizedActiveIdx = ((activeIdx % count) + count) % count
  const activeProduct = PRODUCTS[normalizedActiveIdx]

  // Auto-play infinite sliding loop timer (5s interval, pauses when slide is not active or card hovered)
  useEffect(() => {
    if (!isActive || isHovered || selectedProduct) return

    const timer = setInterval(() => {
      setActiveIdx((prev) => prev + 1)
    }, 5000)

    return () => clearInterval(timer)
  }, [isActive, isHovered, selectedProduct])

  const handlePrev = () => {
    setActiveIdx((prev) => prev - 1)
  }

  const handleNext = () => {
    setActiveIdx((prev) => prev + 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext()
      else handlePrev()
    }
    touchStartX.current = null
  }

  const toggleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setIsLiked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <section 
      id="product" 
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-white text-gray-900 overflow-hidden select-none flex flex-col justify-between items-center px-3 sm:px-8 lg:px-16 pt-[76px] xs:pt-[82px] sm:pt-24 md:pt-28 pb-2 sm:pb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── ABSTRACT BLUR BLOBS (DESKTOP ONLY FOR 120FPS MOBILE) ── */}
      <div className="hidden sm:block absolute top-[-5%] left-[10%] w-[32rem] h-[32rem] rounded-full bg-[#FF4500]/20 blur-[120px] pointer-events-none z-0" />
      <div className="hidden sm:block absolute top-1/4 right-[-5%] w-[45rem] h-[45rem] rounded-full bg-[#FF5E00]/25 blur-[150px] pointer-events-none z-0" />
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-[#3B82F6]/20 blur-[130px] pointer-events-none z-0" />

      {/* ── PERFECTLY CENTERED VERTICAL & HORIZONTAL CONTENT WRAPPER ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-between flex-1 min-h-0 text-center gap-1 sm:gap-4 my-auto">
        
        {/* ── SECTION TITLE (CENTERED & SAFE TOP MARGIN) ── */}
        <div className="flex flex-col items-center text-center w-full px-2 shrink-0 pt-0.5">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black font-bayon text-[#002366] uppercase tracking-tight leading-normal drop-shadow-sm text-center">
            SEBUTIN APA YANG KAMU MAU!
          </h2>
        </div>

        {/* ── 3D COVERFLOW SPATIAL CAROUSEL (CENTERED, ULTRA SMOOTH 120FPS) ── */}
        <div 
          className="relative w-full flex-1 min-h-0 flex items-center justify-center py-1 sm:py-2"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{ perspective: '1200px' }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {PRODUCTS.map((prod, idx) => {
              // Infinite circular distance math
              let diff = idx - normalizedActiveIdx
              if (diff > count / 2) diff -= count
              if (diff < -count / 2) diff += count

              const isActive = diff === 0
              const isDirectNeighbor = Math.abs(diff) <= 1

              // 3D Perspective Transformations for Spatial Coverflow
              // Scaled for desktop & mobile
              let rotateY = diff * -18
              let translateX = diff * 210
              let translateZ = -Math.abs(diff) * 110
              let scale = isActive ? 1 : Math.max(0.78, 1 - Math.abs(diff) * 0.15)
              let opacity = isActive ? 1 : Math.max(0.35, 1 - Math.abs(diff) * 0.3)
              let zIndex = 30 - Math.abs(diff) * 10

              // On mobile screens (< 640px), calculate hardware-composited 2D transforms
              if (typeof window !== 'undefined' && window.innerWidth < 640) {
                translateX = diff * 90
                rotateY = diff * -8
                translateZ = -Math.abs(diff) * 50
                scale = isActive ? 1 : 0.85
                opacity = isActive ? 1 : 0.45
              }

              return (
                <div
                  key={prod.id}
                  onClick={() => setActiveIdx((prev) => prev + diff)}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity: isDirectNeighbor || isActive ? opacity : 0,
                    zIndex,
                    transformStyle: 'preserve-3d',
                    position: 'absolute',
                    willChange: 'transform, opacity',
                    transition: 'transform 0.4s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.35s ease',
                    pointerEvents: isActive ? 'auto' : 'none'
                  }}
                  className="w-[210px] xs:w-[240px] sm:w-[300px] md:w-[340px] lg:w-[360px] xl:w-[380px] h-[310px] xs:h-[350px] sm:h-[450px] md:h-[500px] lg:h-[520px] xl:h-[550px] cursor-pointer shrink-0 [backface-visibility:hidden]"
                >
                  {/* ── CARD MODEL (PROPORTIONAL VERTICAL PORTRAIT + PROGRESSIVE BLUR) ── */}
                  <div className="relative w-full h-full rounded-[24px] sm:rounded-[36px] overflow-hidden border-2 border-white/35 shadow-[0_20px_50px_rgba(0,0,0,0.65)] bg-zinc-900 group flex flex-col justify-between">
                    {/* Full Card Background Image */}
                    <Image
                      src={prod.image}
                      alt={prod.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 320px, 400px"
                      priority={isActive}
                      className="object-cover object-center w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Card Top Action Controls */}
                    <div className="relative z-20 p-2.5 sm:p-4 flex items-center justify-between gap-1.5">
                      <button 
                        onClick={(e) => toggleLike(prod.id, e)}
                        className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full bg-black/60 border border-white/25 flex items-center justify-center text-white hover:bg-black/80 transition-all shadow-md pointer-events-auto"
                        title="Favorite"
                      >
                        <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked[prod.id] ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(prod)
                        }}
                        className="px-2.5 sm:px-3 py-1 rounded-full bg-white/25 border border-white/30 text-white text-[10px] sm:text-[11px] font-bold tracking-wider flex items-center gap-1 hover:bg-white/40 transition-all shadow-md uppercase pointer-events-auto"
                      >
                        <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>Expand</span>
                      </button>

                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(prod)
                        }}
                        className="w-8 h-8 sm:w-9.5 sm:h-9.5 rounded-full bg-black/60 border border-white/25 flex items-center justify-center text-white hover:bg-black/80 transition-all shadow-md pointer-events-auto"
                        title="More Options"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>

                    {/* ── CLEAN GRADIENT OVERLAY SYSTEM (LIGHTWEIGHT 60FPS) ── */}
                    <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none overflow-hidden rounded-b-[24px] sm:rounded-b-[36px] z-10 bg-gradient-to-t from-black/95 via-black/75 via-black/35 to-transparent" />

                    {/* Card Bottom Content Container */}
                    <div className="relative z-20 inset-x-0 p-3 sm:p-6 pt-6 sm:pt-10 flex flex-col justify-end text-left">
                      {/* Badge Pill */}
                      <div className="mb-1">
                        <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-orange-300 bg-black/60 border border-orange-400/40 px-2 py-0.5 rounded-full">
                          {prod.badge}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base xs:text-lg sm:text-2xl font-extrabold text-white leading-tight mb-1 tracking-tight drop-shadow-md">
                        {prod.title}
                      </h3>

                      {/* Subtitle / Description */}
                      <p className="line-clamp-2 text-[10.5px] xs:text-[11px] sm:text-xs text-white/85 leading-tight mb-2.5 sm:mb-4 font-medium">
                        {prod.desc}
                      </p>

                      {/* CTA Button ("Mau ini dong" - Orange-to-Purple Gradient Pill) */}
                      <a
                        href={`https://wa.me/6285713899441?text=${encodeURIComponent(prod.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full rounded-full py-2 xs:py-2.5 sm:py-3.5 px-3.5 sm:px-5 bg-gradient-to-r from-[#FF5E00] via-[#FF3900] to-[#551286] text-white font-extrabold text-xs sm:text-base text-center tracking-wide border border-white/25 shadow-[0_4px_16px_rgba(255,94,0,0.35)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer pointer-events-auto"
                      >
                        <span>{prod.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TRUSTED BY SECTION WITH INFINITE AUTO-SLIDING LOGO MARQUEE (CENTERED) ── */}
        <div className="w-full max-w-md mx-auto pt-1 sm:pt-4 border-t border-black/10 flex flex-col items-center text-center">
          <span className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#002366]/60 block mb-1 text-center">
            TRUSTED BY
          </span>

          {/* Infinite Marquee Track Container */}
          <div className="relative w-full overflow-hidden select-none">
            {/* Infinite Scrolling Track */}
            <div 
              className="animate-marquee-left flex items-center justify-center gap-2 sm:gap-3"
              style={{
                animationPlayState: isActive ? "running" : "paused",
              }}
            >
              {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, lIdx) => (
                <div 
                  key={lIdx} 
                  className="relative h-6 sm:h-12 w-14 sm:w-28 shrink-0 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    unoptimized
                    sizes="150px"
                    className={`object-contain object-center ${logo.scaleClass || ''}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPAND DETAIL MODAL (PORTAL TO BODY TO ESCAPE SLIDE TRACK TRANSFORMS) ── */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 z-[9999] bg-black/85 flex items-center justify-center p-3 xs:p-4 sm:p-6"
            >
              <motion.div
                initial={{ scale: 0.92, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 15 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: "transform, opacity" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-xl md:max-w-2xl bg-zinc-900 border border-white/20 rounded-[20px] sm:rounded-[28px] overflow-hidden shadow-2xl text-white p-4 xs:p-5 sm:p-7 flex flex-col md:flex-row gap-4 sm:gap-6 max-h-[86vh] overflow-y-auto [transform:translate3d(0,0,0)] [backface-visibility:hidden]"
              >
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Left Product Image (Enlarged & Clean without overlay badges) */}
                <div className="relative w-full md:w-1/2 h-56 xs:h-64 sm:h-72 md:h-auto min-h-[220px] xs:min-h-[250px] md:min-h-[340px] rounded-xl sm:rounded-2xl overflow-hidden shrink-0 bg-black/40">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover object-center"
                  />
                </div>

                <div className="flex flex-col justify-between w-full md:w-1/2 text-left">
                  <div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-extrabold text-white mb-0.5 sm:mb-1 font-bayon uppercase tracking-tight">{selectedProduct.title}</h3>
                    <p className="text-[11px] xs:text-xs text-orange-400 font-bold uppercase tracking-wider mb-2 sm:mb-3">{selectedProduct.subtitle}</p>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3 sm:mb-4 font-medium">{selectedProduct.desc}</p>

                    <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      <h4 className="text-[10.5px] xs:text-xs font-bold uppercase text-white/70 tracking-widest">Fitur Utama:</h4>
                      {selectedProduct.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 xs:gap-2 text-[11px] xs:text-xs sm:text-sm text-gray-200 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href={`https://wa.me/6285713899441?text=${encodeURIComponent(selectedProduct.waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full rounded-full py-2.5 sm:py-3.5 px-4 sm:px-6 bg-gradient-to-r from-[#FF5E00] via-[#FF3900] to-[#551286] text-white font-bold text-xs xs:text-sm sm:text-base text-center tracking-wide border border-white/20 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                    <span>Mau ini dong (Konsultasi WA)</span>
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}
