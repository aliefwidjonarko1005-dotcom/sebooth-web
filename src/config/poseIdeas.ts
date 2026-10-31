/** Choices for the pose idea finder on the queue ticket page (shared by UI and /api/ai/pose-ideas). */
export const POSE_PEOPLE = ["1", "2", "3-4", "5+"] as const
export const POSE_VIBES = ["Seru", "Santai", "Formal", "Lucu", "Romantis", "Keren"] as const

export type PosePeople = (typeof POSE_PEOPLE)[number]
export type PoseVibe = (typeof POSE_VIBES)[number]
export type PoseIdea = { title: string; how: string; query: string }

/** Reference search links. These are plain search URLs; nothing is scraped. */
export function poseReferenceLinks(query: string) {
  const q = encodeURIComponent(query)
  return [
    { label: 'Pinterest', href: `https://id.pinterest.com/search/pins/?q=${q}` },
    { label: 'Google', href: `https://www.google.com/search?tbm=isch&q=${q}` },
    // Instagram has no public search URL, and a hashtag built from the whole phrase never exists
    { label: 'Instagram', href: 'https://www.instagram.com/explore/tags/photoboothpose/' },
  ]
}
