'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isHomepage = pathname === '/'
  const isProfile = pathname.startsWith('/profile')
  const isAccess = pathname.startsWith('/access')
  const isQueue = pathname.startsWith('/queue')
  const isExcluded = isHomepage || isProfile || isAccess || isQueue

  useEffect(() => {
    if (isExcluded) return

    // On mobile devices, native scroll is much smoother and prevents lag
    const isMobile = typeof window !== 'undefined' && (
      window.innerWidth < 1024 ||
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
    if (isMobile) return

    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateTicker)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateTicker)
      lenis.destroy()
    }
  }, [isExcluded])

  return <>{children}</>
}
