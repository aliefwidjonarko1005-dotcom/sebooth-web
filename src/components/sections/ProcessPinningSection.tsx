'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Camera, QrCode, Sparkles, Image as ImageIcon } from 'lucide-react'
import { RotatingBadge } from '@/components/ui/RotatingBadge'

const PROCESS_STEPS = [
  {
    num: "01.",
    stepBadge: "1",
    title: "FILL OUT & CHOOSE FRAME",
    desc: "Pilih template frame eksklusif favoritmu langsung di layar touch-screen kiosk Sebooth.",
    bgCard: "#ffffff",
    bgIllustration: "#eef2ff",
    badgeBg: "#ff4500",
    color: "#002366",
    rotate: -6,
    icon: <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-[#002366]/40" />,
  },
  {
    num: "02.",
    stepBadge: "2",
    title: "POSE & SHOOT WITH FRIENDS",
    desc: "Ambil foto bersama teman-temanmu dengan pencahayaan studio profesional & filter cantik.",
    bgCard: "#ffffff",
    bgIllustration: "#fff0eb",
    badgeBg: "#002366",
    color: "#ff4500",
    rotate: 2,
    icon: <Camera className="w-16 h-16 md:w-20 md:h-20 text-[#ff4500]/40" />,
  },
  {
    num: "03.",
    stepBadge: "3",
    title: "SCAN QR INSTANT CLAIM",
    desc: "Scan QR Code di layar kiosk dengan HP-mu untuk langsung menghubungkan foto ke akunmu.",
    bgCard: "#ffffff",
    bgIllustration: "#eef2ff",
    badgeBg: "#ff4500",
    color: "#002366",
    rotate: -3,
    icon: <QrCode className="w-16 h-16 md:w-20 md:h-20 text-[#002366]/40" />,
  },
  {
    num: "04.",
    stepBadge: "4",
    title: "SAVE & PRINT FOREVER",
    desc: "Unduh Photo Strip, GIF Animasi, dan Live Photo berkualitas tinggi di profil pribadi Sebooth.",
    bgCard: "#ffffff",
    bgIllustration: "#fff0eb",
    badgeBg: "#002366",
    color: "#ff4500",
    rotate: 5,
    icon: <ImageIcon className="w-16 h-16 md:w-20 md:h-20 text-[#ff4500]/40" />,
  },
]

export function ProcessPinningSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const container = containerRef.current
    const cards = cardsRef.current.filter(Boolean)
    if (!container || cards.length === 0) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          pin: true,
          pinSpacing: true,
          start: 'top top',
          end: '+=1800',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })

      // Animate each card rising one by one in staggered overlap sequence
      cards.forEach((card, i) => {
        const targetRotate = PROCESS_STEPS[i].rotate

        tl.fromTo(
          card,
          {
            y: 350 + i * 50,
            opacity: 0,
            scale: 0.8,
            rotate: targetRotate + (i % 2 === 0 ? -12 : 12),
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: targetRotate,
            duration: 1,
            ease: 'power2.out',
          },
          i * 0.7
        )
      })
    }, container)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-transparent overflow-hidden flex flex-col justify-between py-8 md:py-12 select-none"
    >
      {/* Background Soft Circle Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] rounded-full bg-[#eef2ff]/40 blur-[140px] pointer-events-none z-0" />

      {/* Header Tagline & Title */}
      <div className="relative z-10 text-center px-6 shrink-0 mt-4 md:mt-8">
        <span className="text-[#002366] font-bold text-[0.65rem] md:text-xs uppercase tracking-widest bg-white/90 backdrop-blur-md px-5 py-2 rounded-full border border-[#002366]/15 inline-block mb-3 shadow-sm">
          ✦ ALUR KERJA MESIN KOLONG ✦
        </span>
        <h2 className="text-3xl sm:text-5xl md:text-6xl text-[#002366] uppercase font-bayon leading-none tracking-tight">
          CARA KERJA SEBOOTH
        </h2>
      </div>

      {/* Overlapping Card Container Stack (dontboardme style) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 my-auto flex items-center justify-center min-h-[440px] md:min-h-[500px]">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-center -space-x-8 sm:-space-x-12 md:-space-x-16 w-full">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              ref={(el) => { cardsRef.current[idx] = el }}
              className="w-[240px] sm:w-[280px] md:w-[320px] h-[370px] sm:h-[410px] md:h-[450px] rounded-3xl p-6 md:p-7 bg-white border-2 border-white shadow-2xl flex flex-col justify-between relative shrink-0 transition-shadow duration-300 hover:shadow-2xl hover:z-30"
              style={{
                boxShadow: '0 25px 50px -12px rgba(0, 35, 102, 0.15)',
              }}
            >
              {/* Circular Step Badge (Top-Left / Top-Right as in dontboardme layout) */}
              <div
                className="absolute -top-3 -left-3 w-8 h-8 md:w-10 md:h-10 rounded-full text-white font-black text-xs md:text-sm flex items-center justify-center border-2 border-white shadow-md z-20"
                style={{ backgroundColor: step.badgeBg }}
              >
                {step.stepBadge}
              </div>

              {/* Card Header Title */}
              <div>
                <h3
                  className="text-2xl sm:text-3xl md:text-4xl font-black font-bayon uppercase leading-[0.85] tracking-tight mb-2"
                  style={{ color: step.color }}
                >
                  {step.title}
                </h3>
                <span className="text-2xl md:text-3xl font-black font-bayon block" style={{ color: step.color }}>
                  {step.num}
                </span>
                <p className="text-[10px] md:text-xs font-semibold uppercase text-gray-500 mt-2 leading-relaxed line-clamp-2">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Pastel Illustration Container */}
              <div
                className="w-full h-[150px] sm:h-[180px] md:h-[200px] rounded-2xl border border-gray-100 flex items-center justify-center p-4 relative overflow-hidden mt-4"
                style={{ backgroundColor: step.bgIllustration }}
              >
                {step.icon}
                <div className="absolute bottom-2 right-3 text-[9px] font-black uppercase tracking-widest text-[#002366]/40">
                  SEBOOTH STEP {step.stepBadge}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Subtitle & Floating Rotating CTA Badge */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 text-center shrink-0 mb-4 md:mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] md:text-xs font-bold text-[#002366] uppercase tracking-wider max-w-md text-center md:text-left">
          JUST FOLLOW THE 4 SIMPLE STEPS, AND WE’LL BE HAPPY TO ELEVATE YOUR EVENT WITH SEBOOTH!
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
    </section>
  )
}
