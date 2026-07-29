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
    icon: <Sparkles className="w-10 h-10 text-[#002366]" />,
  },
  {
    num: "02",
    title: "POSE & SHOOT",
    desc: "Ambil foto bersama teman-temanmu dengan pencahayaan studio profesional dan filter cantik.",
    bgCard: "#ffffff",
    bgCircle: "#fff0eb",
    color: "#ff4500",
    icon: <Camera className="w-10 h-10 text-[#ff4500]" />,
  },
  {
    num: "03",
    title: "SCAN QR INSTANT",
    desc: "Scan QR Code di layar kiosk dengan HP-mu untuk langsung menghubungkan foto ke akunmu.",
    bgCard: "#ffffff",
    bgCircle: "#eef2ff",
    color: "#002366",
    icon: <QrCode className="w-10 h-10 text-[#002366]" />,
  },
  {
    num: "04",
    title: "SIMPAN SELAMANYA",
    desc: "Unduh Photo Strip, GIF Animasi, dan Live Photo berkualitas tinggi di profil pribadi Sebooth.",
    bgCard: "#ffffff",
    bgCircle: "#fff0eb",
    color: "#ff4500",
    icon: <ImageIcon className="w-10 h-10 text-[#ff4500]" />,
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
      return -(track.scrollWidth - window.innerWidth + 120)
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
          end: () => `+=${Math.abs(getScrollAmount()) + 250}`,
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
      className="relative w-full h-screen bg-[#f8f9fa] overflow-hidden flex flex-col justify-center py-12"
    >
      {/* Background Big Decorative Soft Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85rem] h-[85rem] rounded-full bg-[#eef2ff] pointer-events-none z-0 opacity-80" />

      {/* Header Title */}
      <div className="relative z-10 text-center px-6 mb-8 md:mb-12 shrink-0">
        <span className="text-[#002366] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-3 shadow-sm">
          ✦ ALUR KERJA MESIN KOLONG ✦
        </span>
        <h2 className="h2 text-[#002366] uppercase font-bayon leading-none">
          CARA KERJA SEBOOTH
        </h2>
        <p className="text-[#ff4500] font-bold text-sm md:text-lg uppercase max-w-xl mx-auto mt-2 tracking-wide">
          Mudah, Cepat, dan Seru! Hanya 4 Langkah untuk Abadikan Kenanganmu.
        </p>
      </div>

      {/* Pinned Horizontal Track */}
      <div className="relative z-10 w-full overflow-hidden shrink-0">
        <div
          ref={trackRef}
          className="flex gap-6 md:gap-10 px-8 md:px-20 w-max items-center"
        >
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[340px] md:w-[420px] h-[450px] md:h-[500px] rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-xl border-2 border-gray-100 relative group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ backgroundColor: step.bgCard }}
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between">
                <span className="text-4xl md:text-6xl font-black font-bayon" style={{ color: step.color }}>
                  {step.num}
                </span>
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-sm border border-gray-100"
                  style={{ backgroundColor: step.bgCircle }}
                >
                  {step.icon}
                </div>
              </div>

              {/* Step Title & Description */}
              <div className="my-auto py-4">
                <h3
                  className="text-2xl md:text-4xl font-black font-bayon uppercase leading-tight tracking-tight mb-3"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-xs md:text-base font-semibold uppercase text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Decorative Indicator */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                  STEP {step.num} OF 04
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: step.color }}
                />
              </div>
            </div>
          ))}

          {/* End Callout Card */}
          <div className="w-[300px] md:w-[400px] h-[450px] md:h-[500px] rounded-3xl bg-[#002366] p-8 md:p-10 text-white flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
            <h3 className="h3 font-bayon text-white uppercase leading-tight mb-3">
              SIAP COBA SEBOOTH?
            </h3>
            <p className="text-xs md:text-sm font-semibold uppercase text-white/80 mb-8 max-w-xs">
              Pesan Sebooth Photobooth untuk Acara Pernikahan, Ulang Tahun, atau Corporate Event-mu Sekarang!
            </p>
            <RotatingBadge
              text="BOOK SEBOOTH PHOTOBOOTH • NOW • "
              btnText="BOOK NOW"
              bgColor="#ff4500"
              textColor="#ffffff"
              size={130}
              href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
