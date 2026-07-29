'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Sparkles, Handshake, ArrowRight, Check } from 'lucide-react'
import { EditableText } from '@/components/admin/EditableText'
import { RotatingBadge } from '@/components/ui/RotatingBadge'

const SERVICES = [
  {
    id: 'standard',
    num: '01',
    name: 'STANDARD KIOSK',
    tagline: 'Ringkas, Cepat & Sangat Populer',
    desc: 'Photobooth kiosk compact dengan layar sentuh HD intuitif, pencahayaan ringlight studio, dan sistem claim QR instant tanpa penundaan.',
    features: ['Ringlight Lighting Studio', 'Softfile Photo Strip & GIF', 'QR Scan Instant Claim', 'Operator Pendamping'],
    bgColor: '#eef2ff',
    textColor: '#002366',
    badgeColor: '#002366',
    icon: <Camera className="w-12 h-12 text-[#002366]" />,
  },
  {
    id: 'deluxe',
    num: '02',
    name: 'DELUXE EVENT',
    tagline: 'Pengalaman Photobooth Spesial Paket Lengkap',
    desc: 'Solusi photobooth terlaris untuk pesta pernikahan & event korporat. Dilengkapi kustomisasi desain frame overlay eksklusif dan cetak unlimited.',
    features: ['Cetak Strip Unlimited High Quality', 'Kustom Design Frame Overlay', 'Properti Foto Unik & Seru', 'Live Photo (Video Short) Support'],
    bgColor: '#fff0eb',
    textColor: '#ff4500',
    badgeColor: '#ff4500',
    icon: <Sparkles className="w-12 h-12 text-[#ff4500]" />,
  },
  {
    id: 'glamour',
    num: '03',
    name: 'GLAMOUR VIP',
    tagline: 'Fitur VIP & Glamour Filter High-End',
    desc: 'Pengalaman foto eksklusif kelas atas dengan filter glamour smooth-skin, kamera DSLR full-frame, dan galeri cloud publik untuk para tamu.',
    features: ['DSLR Full-Frame Camera', 'Live Glamour Skin Smoothing', 'Galeri Event Cloud Online', 'Prioritas Antrean Digital'],
    bgColor: '#eef2ff',
    textColor: '#002366',
    badgeColor: '#ff4500',
    icon: <Handshake className="w-12 h-12 text-[#002366]" />,
  },
]

interface ProductProps {
  initialData?: Record<string, string>;
}

export function Product({ initialData = {} }: ProductProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const currentService = SERVICES[activeIdx]

  return (
    <section id="product" className="relative w-full min-h-screen bg-[#f8f9fa] py-24 px-6 md:px-16 overflow-hidden select-none">
      {/* Big Circular Background (dontboardme styling) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85rem] h-[85rem] rounded-full bg-[#eef2ff] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[#002366] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-3 shadow-sm">
            ✦ PILIHAN LAYANAN SEBOOTH ✦
          </span>
          <EditableText
            section="product"
            fieldKey="section_title"
            defaultValue="SEBUTIN APA YANG LOE MAU!"
            as="h2"
            className="h2 text-[#002366] font-bayon uppercase leading-none"
          >
            SEBUTIN APA YANG LOE MAU!
          </EditableText>
        </div>

        {/* Interactive Service Wheel & Card Stack */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">
          {/* Left: Service Nav Tabs */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {SERVICES.map((srv, idx) => (
              <motion.button
                key={srv.id}
                onClick={() => setActiveIdx(idx)}
                whileHover={{ x: 6 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  activeIdx === idx
                    ? 'bg-white border-[#002366] shadow-lg translate-x-2'
                    : 'bg-white/60 border-white/80 hover:bg-white/90'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bayon text-2xl md:text-3xl text-[#002366]">
                    {srv.num}
                  </span>
                  <div>
                    <h3 className="font-bayon text-xl md:text-2xl text-[#002366] uppercase leading-none">
                      {srv.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-500 uppercase mt-1">
                      {srv.tagline}
                    </p>
                  </div>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    activeIdx === idx ? 'bg-[#ff4500] text-white' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Right: Active Service Display Card */}
          <div className="lg:col-span-8 w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.4 }}
                className="w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl border-4 border-white flex flex-col justify-between relative overflow-hidden"
              >
                {/* Background Pastel Pill Accent */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 rounded-full -translate-y-24 translate-x-24 opacity-40 pointer-events-none"
                  style={{ backgroundColor: currentService.bgColor }}
                />

                <div className="relative z-10 flex items-start justify-between gap-6 mb-6">
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                      PACKAGE {currentService.num} / 03
                    </span>
                    <h3
                      className="h3 font-bayon uppercase leading-none mt-1"
                      style={{ color: currentService.textColor }}
                    >
                      {currentService.name}
                    </h3>
                  </div>

                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: currentService.bgColor }}
                  >
                    {currentService.icon}
                  </div>
                </div>

                <p className="relative z-10 text-base md:text-xl font-medium text-gray-700 uppercase leading-relaxed mb-8">
                  {currentService.desc}
                </p>

                {/* Features Grid */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {currentService.features.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: currentService.textColor }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                      <span className="text-xs md:text-sm font-bold uppercase text-gray-800">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                  <span className="text-xs font-bold uppercase text-gray-400">
                    KONSULTASIKAN KEBUTUHAN EVENT-MU
                  </span>

                  <RotatingBadge
                    text="SEBOOTH PHOTOBOOTH • TANYA PAKET • "
                    btnText="TANYA"
                    bgColor={currentService.textColor}
                    textColor="#ffffff"
                    size={110}
                    href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20tertarik%20dengan%20paket%20"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
