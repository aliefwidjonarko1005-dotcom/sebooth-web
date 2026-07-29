'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Camera, QrCode, Sparkles, Image as ImageIcon } from 'lucide-react'
import { RotatingBadge } from '@/components/ui/RotatingBadge'

const PROCESS_STEPS = [
  {
    num: "01",
    title: "TAP & CHOOSE FRAME",
    desc: "Pilih template frame eksklusif favoritmu langsung di layar touch-screen kiosk Sebooth.",
    bgCard: "#ffffff",
    bgCircle: "#eef2ff",
    color: "#002366",
    icon: <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-[#002366]" />,
  },
  {
    num: "02",
    title: "POSE & SHOOT",
    desc: "Ambil foto bersama teman-temanmu dengan pencahayaan studio profesional dan filter cantik.",
    bgCard: "#ffffff",
    bgCircle: "#fff0eb",
    color: "#ff4500",
    icon: <Camera className="w-6 h-6 md:w-7 md:h-7 text-[#ff4500]" />,
  },
  {
    num: "03",
    title: "SCAN QR INSTANT",
    desc: "Scan QR Code di layar kiosk dengan HP-mu untuk langsung menghubungkan foto ke akunmu.",
    bgCard: "#ffffff",
    bgCircle: "#eef2ff",
    color: "#002366",
    icon: <QrCode className="w-6 h-6 md:w-7 md:h-7 text-[#002366]" />,
  },
  {
    num: "04",
    title: "SIMPAN SELAMANYA",
    desc: "Unduh Photo Strip, GIF Animasi, dan Live Photo berkualitas tinggi di profil pribadi Sebooth.",
    bgCard: "#ffffff",
    bgCircle: "#fff0eb",
    color: "#ff4500",
    icon: <ImageIcon className="w-6 h-6 md:w-7 md:h-7 text-[#ff4500]" />,
  },
]

export function ProcessPinningSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    // Calculate exact horizontal distance required to scroll all cards to the end
    const getScrollAmount = () => {
      return -(track.scrollWidth - window.innerWidth + 80)
    }

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: getScrollAmount,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: () => `+=${Math.abs(getScrollAmount()) + 200}`,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full h-screen bg-[#f8f9fa] overflow-hidden flex flex-col justify-center py-6 md:py-10"
    >
      {/* Background Soft Decorative Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70rem] h-[70rem] rounded-full bg-[#eef2ff] pointer-events-none z-0 opacity-70" />

      {/* Header Title (Compact Scale for Single Screen Viewport Fit) */}
      <div className="relative z-10 text-center px-6 mb-6 md:mb-8 shrink-0">
        <span className="text-[#002366] font-bold text-[0.65rem] md:text-xs uppercase tracking-widest bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#002366]/15 inline-block mb-2 shadow-sm">
          ✦ ALUR KERJA MESIN KOLONG ✦
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-[#002366] uppercase font-bayon leading-none tracking-tight">
          CARA KERJA SEBOOTH
        </h2>
        <p className="text-[#ff4500] font-bold text-xs md:text-sm uppercase max-w-md mx-auto mt-1.5 tracking-wide">
          Mudah, Cepat, dan Seru! Hanya 4 Langkah untuk Abadikan Kenanganmu.
        </p>
      </div>

      {/* Pinned Horizontal Track */}
      <div className="relative z-10 w-full overflow-hidden shrink-0">
        <div
          ref={trackRef}
          className="flex gap-4 md:gap-8 px-6 md:px-16 w-max items-center"
        >
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="w-[260px] sm:w-[300px] md:w-[350px] h-[340px] sm:h-[370px] md:h-[400px] rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-lg border border-gray-100 relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl shrink-0"
              style={{ backgroundColor: step.bgCard }}
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between">
                <span className="text-3xl md:text-4xl font-black font-bayon" style={{ color: step.color }}>
                  {step.num}
                </span>
                <div
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center shadow-xs border border-gray-100"
                  style={{ backgroundColor: step.bgCircle }}
                >
                  {step.icon}
                </div>
              </div>

              {/* Step Title & Description */}
              <div className="my-auto py-2">
                <h3
                  className="text-xl md:text-2xl font-black font-bayon uppercase leading-tight tracking-tight mb-2"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm font-medium uppercase text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="w-full flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  STEP {step.num} OF 04
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
              </div>
            </div>
          ))}

          {/* End Callout Card */}
          <div className="w-[260px] sm:w-[300px] md:w-[350px] h-[340px] sm:h-[370px] md:h-[400px] rounded-2xl bg-[#002366] p-6 md:p-8 text-white flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden shrink-0">
            <h3 className="text-2xl md:text-3xl font-bayon text-white uppercase leading-tight mb-2">
              SIAP COBA SEBOOTH?
            </h3>
            <p className="text-[11px] md:text-xs font-medium uppercase text-white/80 mb-6 max-w-xs leading-relaxed">
              Pesan Sebooth Photobooth untuk Acara Pernikahan, Ulang Tahun, atau Corporate Event-mu Sekarang!
            </p>
            <RotatingBadge
              text="BOOK SEBOOTH PHOTOBOOTH • NOW • "
              btnText="BOOK NOW"
              bgColor="#ff4500"
              textColor="#ffffff"
              size={110}
              href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
