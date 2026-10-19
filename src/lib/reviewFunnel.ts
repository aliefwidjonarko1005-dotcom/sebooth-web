/**
 * Post-download funnel state (rating → Google Review → Instagram), per session, per device.
 * Stored in localStorage so the sheet never nags twice and can resume where the user left off.
 */

export type FunnelStage = 'rating' | 'google' | 'instagram' | 'done'

export interface FunnelState {
  rating?: number
  ratedAt?: string
  googleOpenedAt?: string
  googleSkipped?: boolean
  igOpenedAt?: string
  igSkipped?: boolean
  dismissedAt?: string
}

const key = (sessionId: string) => `sebooth_funnel_${sessionId}`

export function readFunnel(sessionId: string): FunnelState {
  try {
    const raw = localStorage.getItem(key(sessionId))
    if (raw) return JSON.parse(raw) as FunnelState
    // Legacy rating from the old /review roulette page
    const legacy = localStorage.getItem(`sebooth_review_${sessionId}`)
    if (legacy) {
      const parsed = JSON.parse(legacy)
      if (typeof parsed.ratingScore === 'number') return { rating: parsed.ratingScore, ratedAt: parsed.submittedAt }
    }
  } catch {}
  return {}
}

export function writeFunnel(sessionId: string, patch: Partial<FunnelState>): FunnelState {
  const next = { ...readFunnel(sessionId), ...patch }
  try {
    localStorage.setItem(key(sessionId), JSON.stringify(next))
  } catch {}
  return next
}

export function nextStage(state: FunnelState): FunnelStage {
  if (!state.rating) return 'rating'
  if (!state.googleOpenedAt && !state.googleSkipped) return 'google'
  if (!state.igOpenedAt && !state.igSkipped) return 'instagram'
  return 'done'
}

/** True when the sheet should open by itself after a download finishes. */
export function shouldAutoOpen(state: FunnelState): boolean {
  return !state.dismissedAt && nextStage(state) !== 'done'
}
