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
  media?: MediaItem[]
}
