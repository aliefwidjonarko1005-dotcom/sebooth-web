export interface MediaItem {
  id: string
  session_id: string
  url: string
  type: 'image' | 'video' | 'gif' | 'photo' | 'live'
  metadata?: Record<string, unknown>
  created_at: string
}

export interface SessionData {
  id: string
  created_at: string
  event_name: string | null
  user_id: string | null
  is_claimed: boolean
  queue_ticket_id?: string | null
  media?: MediaItem[]
}

export type QueueTicketStatus =
  | 'waiting'
  | 'called'
  | 'in_session'
  | 'completed'
  | 'expired'
  | 'cancelled'

export interface QueueEvent {
  id: string
  name: string
  booth_name: string
  is_active: boolean
  avg_session_duration_sec: number
  created_at: string
}

export interface QueueTicket {
  id: string
  event_id: string
  queue_number: number
  display_name: string
  phone_number: string | null
  user_id: string | null
  status: QueueTicketStatus
  called_at: string | null
  completed_at: string | null
  session_id: string | null
  wa_notified: boolean
  expires_at: string | null
  is_checked_in: boolean
  created_at: string
  // Joined fields (from event)
  queue_events?: QueueEvent
}

// ═══════════════════════════════════════
// 4-TIER PROXIMITY STATUS CATEGORIES
// ═══════════════════════════════════════

export type QueueProximityTier =
  | 'waiting'      // 🟢 Masih jauh (5+ sesi lagi)
  | 'approaching'  // 🟡 Hampir (3-4 sesi lagi)
  | 'preparing'    // 🟠 Bersiap (1-2 sesi lagi)
  | 'your_turn'    // 🔴 Giliran Anda! (status === 'called')

/**
 * Calculate proximity tier from position and ticket status.
 */
export function getProximityTier(positionFromFront: number, status: QueueTicketStatus): QueueProximityTier {
  if (status === 'called' || status === 'in_session') return 'your_turn';
  if (positionFromFront <= 2) return 'preparing';
  if (positionFromFront <= 4) return 'approaching';
  return 'waiting';
}

/**
 * Get the display label for a proximity tier (Indonesian).
 */
export function getProximityTierLabel(tier: QueueProximityTier): string {
  switch (tier) {
    case 'waiting': return 'Menunggu';
    case 'approaching': return 'Hampir';
    case 'preparing': return 'Bersiap';
    case 'your_turn': return 'Giliran Anda!';
  }
}

/**
 * Get the color config for a proximity tier.
 */
export function getProximityTierColor(tier: QueueProximityTier): {
  bg: string; text: string; border: string; ring: string; hex: string;
} {
  switch (tier) {
    case 'waiting':
      return { bg: 'bg-[#0F3D2E]', text: 'text-white', border: 'border-2 border-black', ring: 'ring-black', hex: '#0F3D2E' };
    case 'approaching':
      return { bg: 'bg-yellow-400', text: 'text-primary', border: 'border-2 border-black', ring: 'ring-black', hex: '#FACC15' };
    case 'preparing':
      return { bg: 'bg-orange-500', text: 'text-white', border: 'border-2 border-black', ring: 'ring-black', hex: '#F97316' };
    case 'your_turn':
      return { bg: 'bg-red-600', text: 'text-white', border: 'border-2 border-black', ring: 'ring-black', hex: '#DC2626' };
  }
}
