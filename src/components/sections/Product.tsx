'use client'

import React, { useCallback, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useModalFocus } from '@/lib/useModalFocus'
import { ArrowRight, MessageCircle, X } from 'lucide-react'

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
    image: '/images/products/mini_studio_booth.webp',
    avatar: '/images/products/mini_studio_booth.webp',
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
    image: '/images/products/vending_machine_booth.webp',
    avatar: '/images/products/vending_machine_booth.webp',
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
    image: '/images/products/partner_sebooth.webp',
    avatar: '/images/products/partner_sebooth.webp',
    ctaText: 'Mau ini dong',
    waText: 'Halo Sebooth, saya mau join sebagai Partner resmi Sebooth!',
    features: ['Komisi & Profit Sharing', 'Priority Operator Support', 'Marketing Assets Support', 'Sponsorship Event Partner', 'Co-Branding Options'],
    badge: 'PARTNERSHIP',
    priceTag: 'Join Partner'
  }
]

const PARTNER_LOGOS = [
  { id: 'logo-1', src: '/images/partners/logo_1.webp', alt: 'Partner Logo 1' },
  { id: 'logo-2', src: '/images/partners/logo_2.webp', alt: 'Partner Logo 2' },
  { id: 'logo-3', src: '/images/partners/logo_3.webp', alt: 'Partner Logo 3' },
  { id: 'logo-4', src: '/images/partners/logo_4.webp', alt: 'Partner Logo 4' },
  { id: 'logo-5', src: '/images/partners/logo_5.webp', alt: 'Partner Logo 5' },
  { id: 'logo-6', src: '/images/partners/logo_6.webp', alt: 'Partner Logo 6', scaleClass: 'scale-[1.45] sm:scale-[1.55]' },
]

interface ProductProps {
  initialData?: Record<string, string>
  isActive?: boolean
}

export function Product({ initialData = {}, isActive = true }: ProductProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const detailRef = useRef<HTMLDivElement>(null)
  const closeDetail = useCallback(() => setSelectedProduct(null), [])
  useModalFocus(selectedProduct !== null, detailRef, closeDetail)

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

  return (
    <section 
      id="product" 
      className="relative w-full h-[100svh] min-h-[100svh] max-h-[100svh] bg-[#eef2ff] text-gray-900 overflow-hidden select-none flex flex-col justify-between items-center px-3 sm:px-8 lg:px-16 pt-16 sm:pt-20 md:pt-22 pb-2 sm:pb-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      {/* ── PERFECTLY CENTERED VERTICAL & HORIZONTAL CONTENT WRAPPER ── */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center justify-between flex-1 min-h-0 text-center gap-1 sm:gap-2 my-auto">
        
        {/* ── SECTION TITLE (CENTERED & SAFE TOP MARGIN) ── */}
        <div className="flex flex-col items-center text-center w-full px-2 shrink-0 pt-0.5">
          <h2 className="text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl font-bayon text-primary uppercase leading-none text-center">
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
              let translateX = diff * 185
              let translateZ = -Math.abs(diff) * 110
              let scale = isActive ? 1 : Math.max(0.78, 1 - Math.abs(diff) * 0.15)
              let opacity = isActive ? 1 : Math.max(0.35, 1 - Math.abs(diff) * 0.3)
              let zIndex = 30 - Math.abs(diff) * 10

              // On mobile screens (< 640px), calculate hardware-composited 2D transforms
              if (typeof window !== 'undefined' && window.innerWidth < 640) {
                translateX = diff * 100
                rotateY = diff * -8
                translateZ = -Math.abs(diff) * 50
                scale = isActive ? 1 : 0.85
                opacity = isActive ? 1 : 0.45
              }

              return (
                <div
                  key={prod.id}
                  onClick={(e) => {
                    if (!isActive) {
                      e.stopPropagation()
                      setActiveIdx((prev) => prev + diff)
                    }
                  }}
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
                    pointerEvents: isDirectNeighbor || isActive ? 'auto' : 'none',
                    cursor: isActive ? 'default' : 'pointer'
                  }}
                  className="w-[240px] min-[375px]:w-[270px] md:w-[280px] lg:w-[300px] xl:w-[320px] h-[350px] min-[375px]:h-[400px] lg:h-[410px] xl:h-[430px] max-h-[58svh] shrink-0 [backface-visibility:hidden] select-none"
                >
                  {/* ── CARD MODEL (PROPORTIONAL VERTICAL PORTRAIT + PROGRESSIVE BLUR) ── */}
                  <div className={`relative w-full h-full rounded-2xl overflow-hidden shadow-[0_12px_32px_rgba(0,17,58,0.35)] bg-blue-dark group flex flex-col justify-between ${
                    !isActive ? 'hover:brightness-110 transition-all cursor-pointer' : ''
                  }`}>
                    {/* Inactive card transparent click interceptor shield */}
                    {!isActive && (
                      <div 
                        className="absolute inset-0 z-30 bg-black/15 hover:bg-black/0 transition-colors cursor-pointer"
                        title="Klik untuk memilih layanan ini"
                      />
                    )}

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

                    {/* Card Top Action: the one real control, opens the detail sheet */}
                    <div className="relative z-20 flex justify-end p-2 sm:p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedProduct(prod)
                        }}
                        className="min-h-11 cursor-pointer rounded-full bg-blue-dark px-4 text-sm font-bold text-white transition-colors hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white pointer-events-auto"
                      >
                        Detail
                      </button>
                    </div>

                    {/* ── CLEAN GRADIENT OVERLAY SYSTEM (LIGHTWEIGHT 60FPS) ── */}
                    <div className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none overflow-hidden z-10 bg-gradient-to-t from-black/95 via-black/75 via-black/35 to-transparent" />

                    {/* Card Bottom Content Container */}
                    <div className="relative z-20 inset-x-0 p-3 sm:p-4 flex flex-col justify-end text-left">
                      {/* Title */}
                      <h3 className="text-[17px] sm:text-xl font-bold text-white leading-tight">
                        {prod.title}
                      </h3>

                      {/* Subtitle / Description */}
                      <p className="line-clamp-2 mt-1 mb-3 text-sm text-white leading-snug">
                        {prod.desc}
                      </p>

                      {/* CTA Button */}
                      <a
                        href={`https://wa.me/6285713899441?text=${encodeURIComponent(prod.waText)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full min-h-11 rounded-full px-3 sm:px-4 bg-secondary hover:bg-white text-blue-dark font-bold text-[15px] text-center transition-colors active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer pointer-events-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                      >
                        <span>{prod.ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── TRUSTED BY SECTION WITH INFINITE AUTO-SLIDING LOGO MARQUEE (CENTERED) ── */}
        <div className="w-full max-w-md mx-auto pt-1.5 sm:pt-2 flex flex-col items-center text-center shrink-0 relative z-30 mt-auto mb-11 sm:mb-1">
          <span className="text-sm font-bold text-primary block mb-1 text-center">
            Trusted by
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
                  className="relative h-6 sm:h-9 w-14 sm:w-22 shrink-0 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    unoptimized
                    sizes="120px"
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
              className="fixed inset-0 z-[9999] bg-blue-dark/80 flex items-end justify-center md:items-center md:p-6"
            >
              <motion.div
                ref={detailRef}
                role="dialog"
                aria-modal="true"
                aria-label={selectedProduct.title}
                initial={{ y: 32 }}
                animate={{ y: 0 }}
                exit={{ y: 32 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ willChange: "transform, opacity" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full md:max-w-2xl bg-primary rounded-t-2xl md:rounded-2xl text-white p-5 md:p-7 flex flex-col md:flex-row gap-4 md:gap-6 max-h-[92svh] overflow-y-auto"
              >
                <button
                  onClick={closeDetail}
                  aria-label="Tutup detail layanan"
                  className="absolute top-2 right-2 z-10 h-12 w-12 cursor-pointer rounded-full bg-blue-dark flex items-center justify-center text-white transition-colors hover:text-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>

                {/* Left Product Image (Enlarged & Clean without overlay badges) */}
                <div className="relative w-full md:w-1/2 h-64 md:h-auto md:min-h-[340px] rounded-lg overflow-hidden shrink-0">
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
                  <div className="text-[17px] leading-relaxed">
                    <h3 className="font-bayon text-[2rem] leading-[1.05] uppercase">{selectedProduct.title}</h3>
                    <p className="mt-1.5 font-bold">{selectedProduct.subtitle}</p>
                    <p className="mt-3">{selectedProduct.desc}</p>

                    <h4 className="mt-4 font-bold">Fitur Utama</h4>
                    <ul className="mt-1 mb-5 list-disc space-y-1 pl-5 marker:text-secondary">
                      {selectedProduct.features.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={`https://wa.me/6285713899441?text=${encodeURIComponent(selectedProduct.waText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-14 rounded-full px-5 bg-secondary hover:bg-white text-blue-dark font-bold text-[17px] text-center transition-colors active:scale-[0.98] flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <MessageCircle className="h-5 w-5" aria-hidden="true" />
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
