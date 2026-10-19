/**
 * Single source of truth for Sebooth social & review destinations.
 * Override per deployment via NEXT_PUBLIC_* env vars.
 */

export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || 'sebooth.in'
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`

export const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL ||
  'https://search.google.com/local/writereview?placeid=ChIJMw7u0BePcC4RfJlnOavYI6k'

export const WHATSAPP_NUMBER = '6285713899441'

export function whatsappUrl(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
}
