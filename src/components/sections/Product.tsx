'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Handshake, ArrowRight, Check } from 'lucide-react'
import { EditableText } from '@/components/admin/EditableText'
import { RotatingBadge } from '@/components/ui/RotatingBadge'

const SERVICES = [
  {
    id: 'batch',
    num: '01',
    name: 'BATCH BOOKING PACKAGE',
    tagline: 'Paket Booking Hemat untuk Multiple Event',
    desc: 'Solusi booking photobooth efisien untuk event organizer & brand yang membutuhkan layanan photobooth rutin dengan harga bundling khusus.',
    features: ['Harga Bundling Hemat', 'Kustom Design Frame Overlay', 'Prioritas Reservasi Tanggal Event', 'Sistem Claim QR Scan Instant'],
    bgColor: '#eef2ff',
    textColor: '#002366',
    accentColor: '#ff4500',
    icon: <Camera className="w-20 h-20 md:w-28 md:h-28 text-[#002366]" />,
  },
  {
    id: 'unlimited',
    num: '02',
    name: 'ALL YOU CAN PHOTOS',
    tagline: 'Cetak Foto Unlimited & Akses Tanpa Batas',
    desc: 'Pengalaman photobooth paling puas untuk pesta pernikahan, ulang tahun, dan gathering. Cetak strip sepuasnya tanpa batas kuota!',
    features: ['Cetak Strip Unlimited High Quality', 'Softfile Photo Strip & GIF', 'Live Photo (Video Short) Support', 'Properti Foto Unik & Seru'],
    bgColor: '#fff0eb',
    textColor: '#ff4500',
    accentColor: '#002366',
    icon: <Sparkles className="w-20 h-20 md:w-28 md:h-28 text-[#ff4500]" />,
  },
  {
    id: 'partnership',
    num: '03',
    name: 'JADIIN SEBOOTH PARTNER LOE',
    tagline: 'Program Kemitraan & Kolaborasi Event',
    desc: 'Gabung sebagai partner resmi Sebooth untuk dapatkan komisi menarik, dukungan peralatan studio profesional, dan paket sponsorship event.',
    features: ['Komisi & Profit Sharing menarik', 'Priority Operator Support', 'Marketing Kit & Asset Promosi', 'Paket Sponsorship Event Partner'],
    bgColor: '#eef2ff',
    textColor: '#002366',
    accentColor: '#ff4500',
    icon: <Handshake className="w-20 h-20 md:w-28 md:h-28 text-[#002366]" />,
  },
]

interface ProductProps {
  initialData?: Record<string, string>;
}

export function Product({ initialData = {} }: ProductProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  // Auto-switch active service periodically every 4.5 seconds
  useEffect(() => {
    if (isHovered) return
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SERVICES.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [isHovered])

  const currentService = SERVICES[activeIdx]

  return (
    <section id="product" className="relative w-full min-h-screen bg-[#f8f9fa] py-20 px-6 md:px-16 overflow-hidden select-none flex flex-col justify-between">
      {/* Concentric Growing Circles (dontboardme styling) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90rem] h-[90rem] rounded-full bg-[#eef2ff] pointer-events-none z-0 opacity-70" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[65rem] h-[65rem] rounded-full bg-[#ffffff] pointer-events-none z-0 shadow-inner opacity-80" />

      <div className="relative z-10 max-w-7xl mx-auto w-full my-auto flex flex-col items-center">
        {/* Header Title (dontboardme styling with floating ball icon) */}
        <div className="text-center mb-10 relative">
          <div className="absolute -top-6 right-8 md:right-12 w-8 h-8 md:w-12 md:h-12 rounded-full bg-[#ff4500] animate-bounce shadow-md pointer-events-none" />
          
          <span className="text-[#002366] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-3 shadow-sm">
            ✦ PILIHAN LAYANAN SEBOOTH ✦
          </span>
          <EditableText
            section="product"
            fieldKey="section_title"
            defaultValue="SEBUTIN APA YANG LOE MAU!"
            as="h2"
            className="text-4xl sm:text-6xl md:text-8xl text-[#002366] font-bayon uppercase leading-[0.82] tracking-tight"
          >
            SEBUTIN APA YANG LOE MAU!
          </EditableText>
        </div>

        {/* Main Service Wheel Showcase (dontboardme layout) */}
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-4"
        >
          {/* Left: Giant Display Step Number (dontboardme "01", "02", "03" layout) */}
          <div className="lg:col-span-3 flex lg:flex-col items-center justify-center lg:items-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.num}
                initial={{ opacity: 0, x: -30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.8 }}
                transition={{ duration: 0.4 }}
                className="text-center lg:text-left"
              >
                <span className="text-7xl sm:text-9xl md:text-[11rem] font-black font-bayon leading-none block" style={{ color: currentService.accentColor }}>
                  {currentService.num}
                </span>
                <span className="text-xs md:text-sm font-black uppercase tracking-widest text-[#002366]/60 block -mt-4">
                  SERVICE {currentService.num} OF 03
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: Active Service Display Card */}
          <div className="lg:col-span-6 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.45 }}
                className="w-full bg-white rounded-3xl p-8 md:p-10 shadow-2xl border-4 border-white flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background Pastel Pill Accent */}
                <div
                  className="absolute top-0 right-0 w-56 h-56 rounded-full -translate-y-20 translate-x-20 opacity-40 pointer-events-none"
                  style={{ backgroundColor: currentService.bgColor }}
                />

                {/* Card Top Header */}
                <div className="relative z-10 flex items-start justify-between gap-6 mb-6">
                  <div>
                    <h3
                      className="text-3xl md:text-4xl font-bayon uppercase leading-tight"
                      style={{ color: currentService.textColor }}
                    >
                      {currentService.name}
                    </h3>
                    <p className="text-xs md:text-sm font-bold uppercase text-gray-400 tracking-wider mt-1">
                      {currentService.tagline}
                    </p>
                  </div>

                  <div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                    style={{ backgroundColor: currentService.bgColor }}
                  >
                    {currentService.icon}
                  </div>
                </div>

                {/* Description */}
                <p className="relative z-10 text-sm md:text-base font-medium text-gray-700 uppercase leading-relaxed mb-6">
                  {currentService.desc}
                </p>

                {/* Features Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-8">
                  {currentService.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: currentService.accentColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="text-xs font-bold uppercase text-gray-800">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Card Bottom CTA */}
                <div className="relative z-10 flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff4500] animate-pulse" />
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-gray-400">
                      AUTO-ROTATING SERVICE
                    </span>
                  </div>

                  <RotatingBadge
                    text="SEBOOTH PHOTOBOOTH • TANYA PAKET • "
                    btnText="TANYA"
                    bgColor={currentService.accentColor}
                    textColor="#ffffff"
                    size={105}
                    href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20tertarik%20dengan%20paket%20"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Service Selector Tabs (dontboardme arc pills) */}
          <div className="lg:col-span-3 flex lg:flex-col gap-3 justify-center">
            {SERVICES.map((srv, idx) => {
              const isActive = activeIdx === idx
              return (
                <motion.button
                  key={srv.id}
                  onClick={() => setActiveIdx(idx)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={`p-4 md:p-5 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-white border-[#ff4500] shadow-lg text-[#002366]'
                      : 'bg-white/80 border-transparent hover:bg-white text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bayon text-sm ${
                      isActive ? 'bg-[#ff4500] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {srv.num}
                    </span>
                    <span className="font-bayon text-sm md:text-base uppercase tracking-tight line-clamp-1">
                      {srv.name}
                    </span>
                  </div>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isActive ? 'text-[#ff4500] translate-x-1' : 'text-gray-300'}`} />
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
