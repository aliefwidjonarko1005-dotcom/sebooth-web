export interface SessionItem {
  id: string
  created_at: string
  event_name: string | null
  user_id: string | null
  is_claimed: boolean
  queue_ticket_id?: string | null
}

export interface UserInfo {
  id: string
  email: string | null
  full_name: string | null
  phone_number: string | null
  created_at: string | null
}

export interface QueueTicketInfo {
  id: string
  queue_number: number
  display_name: string
  phone_number: string | null
  status: string
  event_name?: string
  created_at: string
}

export interface MediaSummary {
  total: number
  photos: number
  gifs: number
  lives: number
}

export interface DetailedResult {
  session: SessionItem
  user: UserInfo | null
  userTotalClaims?: number
  queueTicket: QueueTicketInfo | null
  mediaSummary: MediaSummary
}
