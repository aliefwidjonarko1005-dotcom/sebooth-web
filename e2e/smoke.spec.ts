import { expect, test } from '@playwright/test'

const PUBLIC_PAGES = [
  '/',
  '/about',
  '/partnership',
  '/frames',
  '/artikel',
  '/artikel/rekomendasi-photobooth-tembalang-event-kampus-wisuda-undip',
]

for (const path of PUBLIC_PAGES) {
  test(`${path} loads with one h1 and no horizontal overflow at 375px`, async ({ page }) => {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
    await expect(page.locator('h1')).toHaveCount(1)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    )
    expect(overflow).toBeLessThanOrEqual(0)
  })
}

test('/artikel contents list jumps to its category', async ({ page }) => {
  await page.goto('/artikel')
  await page
    .getByRole('navigation', { name: 'Kategori artikel' })
    .getByRole('link', { name: /WEDDING/ })
    .click()
  await expect(page).toHaveURL(/#wedding$/)
  await expect(page.getByRole('heading', { level: 2, name: 'WEDDING', exact: true })).toBeInViewport()
})

test('/frames loads the webp copies, never the 4.6 MB catalogue PNGs', async ({ page }) => {
  const pngs: string[] = []
  page.on('request', (req) => {
    if (/\/images\/frames\/[^/]+\.png/.test(req.url())) pngs.push(req.url())
  })
  await page.goto('/frames')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await page.mouse.wheel(0, 2000)
  await page.waitForTimeout(800)
  expect(pngs).toEqual([])
})

test('homepage sends no article data to the browser', async ({ page }) => {
  const scripts: Promise<string>[] = []
  page.on('response', (res) => {
    if (res.url().includes('/_next/static/chunks/') && res.url().endsWith('.js')) scripts.push(res.text())
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  const bodies = await Promise.all(scripts)
  expect(bodies.length).toBeGreaterThan(0)
  // A field only the full article data has: the home slide receives just the card fields, as props
  expect(bodies.some((b) => b.includes('metaDescription'))).toBe(false)
})

test('mobile menu opens as a dialog and Escape returns focus to the button', async ({ page }) => {
  await page.goto('/about')
  const opener = page.getByRole('button', { name: 'Buka Menu Navigasi' })
  await opener.click()
  await expect(page.getByRole('dialog', { name: 'Menu navigasi' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tutup Menu' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
  await expect(opener).toBeFocused()
})

test('unknown claim session shows the not-found page', async ({ page }) => {
  // Status stays 200: app/loading.tsx starts the stream before notFound() runs
  await page.goto('/access/e2e-session-that-does-not-exist')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Fotonya nggak ketemu/)
  await expect(page).toHaveTitle(/tidak ditemukan/i)
})

test.describe('admin API without login', () => {
  for (const path of ['/api/admin/insights', '/api/admin/session-lookup', '/api/admin/user-claims']) {
    test(`${path} returns 401`, async ({ request }) => {
      const res = await request.get(path)
      expect(res.status()).toBe(401)
    })
  }

  test('/api/admin/me reports not admin', async ({ request }) => {
    const res = await request.get('/api/admin/me')
    expect(res.ok()).toBe(true)
    expect(await res.json()).toMatchObject({ isAdmin: false })
  })
})
