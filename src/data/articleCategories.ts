import type { ArticleItem } from './articles'

// Anchor of each category on the /artikel hub, in the order a reader planning an event usually looks.
// A Record, so a new category in the data fails the build instead of vanishing from the hub.
export const CATEGORY_IDS: Record<ArticleItem['category'], string> = {
  'KAMPUS & WISUDA': 'kampus-wisuda',
  'EVENT SEMARANG': 'event-semarang',
  WEDDING: 'wedding',
  'KONSER & FESTIVAL': 'konser-festival',
  'TIPS & PANDUAN': 'tips-panduan',
}
