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
  created_at: string
  // Joined fields (from event)
  queue_events?: QueueEvent
}
