'use client'

import { useCallback, useEffect, useState } from 'react'

interface UseGuideOptions {
  /** Open by itself once for first-time visitors. */
  autoStart?: boolean
  /** Delay before auto-start so the page can settle and the visitor can look first. */
  delay?: number
  /** Gate auto-start on page readiness (data loaded, no other modal open). */
  enabled?: boolean
}

export function useGuide(storageKey: string, { autoStart = true, delay = 1400, enabled = true }: UseGuideOptions = {}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!autoStart || !enabled) return
    let seen = true
    try {
      seen = localStorage.getItem(storageKey) === 'true'
    } catch {}
    if (seen) return
    const t = setTimeout(() => setOpen(true), delay)
    return () => clearTimeout(t)
  }, [storageKey, autoStart, delay, enabled])

  const start = useCallback(() => setOpen(true), [])
  const close = useCallback(() => setOpen(false), [])

  return { open, start, close }
}
