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
    bgCircle: "#e6dfe7",
    color: "#e33529",
    icon: <Sparkles className="w-10 h-10 text-[#e33529]" />,
  },
  {
    num: "02",
    title: "POSE & SHOOT",
    desc: "Ambil foto bersama teman-temanmu dengan pencahayaan studio profesional dan filter cantik.",
    bgCard: "#ffffff",
    bgCircle: "#ead9ec",
    color: "#2b6786",
    icon: <Camera className="w-10 h-10 text-[#2b6786]" />,
  },
  {
    num: "03",
    title: "SCAN QR INSTANT",
    desc: "Scan QR Code di layar kiosk dengan HP-mu untuk langsung menghubungkan foto ke akunmu.",
    bgCard: "#ffffff",
    bgCircle: "#eacdef",
    color: "#693413",
    icon: <QrCode className="w-10 h-10 text-[#693413]" />,
  },
  {
    num: "04",
    title: "SIMPAN SELAMANYA",
    desc: "Unduh Photo Strip, GIF Animasi, dan Live Photo berkualitas tinggi di profil pribadi Sebooth.",
    bgCard: "#ffffff",
    bgCircle: "#d8b3df",
    color: "#e33529",
    icon: <ImageIcon className="w-10 h-10 text-[#e33529]" />,
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

    const totalScroll = track.scrollWidth - window.innerWidth + 100

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: -totalScroll,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          pin: true,
          scrub: 0.8,
          end: () => `+=${totalScroll * 1.2}`,
          invalidateOnRefresh: true,
        },
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#f4ced3] overflow-hidden flex flex-col justify-center py-16"
    >
      {/* Background Big Decorative Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95rem] h-[95rem] rounded-full bg-[#f3c3cb] pointer-events-none z-0" />

      {/* Header Title */}
      <div className="relative z-10 text-center px-6 mb-12">
        <span className="text-[#e33529] font-bold text-xs md:text-sm uppercase tracking-widest bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#e33529]/20 inline-block mb-3">
          ✦ ALUR KERJA MESIN KOLONG ✦
        </span>
        <h2 className="h2 text-[#e33529] uppercase font-bayon leading-none">
          CARA KERJA SEBOOTH
        </h2>
        <p className="text-[#e33529] font-medium text-sm md:text-lg uppercase max-w-xl mx-auto mt-2">
          Mudah, Cepat, dan Seru! Hanya 4 Langkah untuk Abadikan Kenanganmu.
        </p>
      </div>

      {/* Pinned Horizontal Track */}
      <div className="relative z-10 w-full overflow-hidden">
        <div
          ref={trackRef}
          className="flex gap-6 md:gap-10 px-8 md:px-20 w-max items-center"
        >
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="w-[280px] sm:w-[340px] md:w-[420px] h-[480px] md:h-[540px] rounded-3xl p-8 md:p-10 flex flex-col justify-between shadow-xl border-2 border-white/60 relative group transition-transform duration-300 hover:-translate-y-2"
              style={{ backgroundColor: step.bgCard }}
            >
              {/* Step Number Badge */}
              <div className="flex items-center justify-between">
                <span className="text-4xl md:text-5xl font-black font-bayon" style={{ color: step.color }}>
                  {step.num}
                </span>
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{ backgroundColor: step.bgCircle }}
                >
                  {step.icon}
                </div>
              </div>

              {/* Step Title & Illustration Preview */}
              <div className="my-auto py-6">
                <h3
                  className="text-2xl md:text-4xl font-black font-bayon uppercase leading-tight tracking-tight mb-4"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <p className="text-xs md:text-base font-semibold uppercase text-gray-700 leading-relaxed">
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
          <div className="w-[300px] md:w-[380px] h-[480px] md:h-[540px] rounded-3xl bg-[#e33529] p-8 md:p-10 text-white flex flex-col justify-center items-center text-center shadow-xl">
            <h3 className="h3 font-bayon text-white uppercase leading-tight mb-4">
              SIAP COBA SEBOOTH?
            </h3>
            <p className="text-sm font-semibold uppercase text-white/80 mb-8">
              Pesan Sebooth Photobooth untuk Acara Pernikahan, Ulang Tahun, atau Corporate Event-mu Sekarang!
            </p>
            <RotatingBadge
              text="BOOK SEBOOTH PHOTOBOOTH • NOW • "
              btnText="BOOK"
              bgColor="#fff500"
              textColor="#e33529"
              size={120}
              href="https://wa.me/6285713899441?text=Halo%20Sebooth%2C%20saya%20ingin%20booking%20photobooth"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
