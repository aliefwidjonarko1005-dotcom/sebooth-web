import { expect, test } from '@playwright/test'

const sessionId = process.env.E2E_SESSION_ID

test.describe('Download All on the claim page', () => {
  test.skip(!sessionId, 'Set E2E_SESSION_ID to a real session id to run this test')

  test('opens the sheet with ZIP and separate-file options', async ({ page }) => {
    await page.addInitScript(() => {
      // Skip the interactive guide and never let a real download start
      localStorage.setItem('guide_seen_access_v2', 'true')
      HTMLAnchorElement.prototype.click = function () {}
    })

    await page.goto(`/access/${sessionId}`)
    await page.getByRole('button', { name: 'Download All Photo' }).click()

    const sheet = page.getByRole('dialog')
    await expect(sheet).toBeVisible()
    await expect(sheet.getByText('Satu file ZIP')).toBeVisible()
    await expect(sheet.getByText('File terpisah')).toBeVisible()
  })
})
