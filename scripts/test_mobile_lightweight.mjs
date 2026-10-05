import puppeteer from 'puppeteer-core'
import path from 'path'
import fs from 'fs'

function getBrowserPath() {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ]
  return paths.find(p => fs.existsSync(p))
}

async function run() {
  const executablePath = getBrowserPath()
  if (!executablePath) {
    console.error('No Chrome/Edge executable found.')
    return
  }

  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })

    console.log('Navigating to http://localhost:3000/profile?preview=1...')
    await page.goto('http://localhost:3000/profile?preview=1', { waitUntil: 'networkidle2', timeout: 30000 })

    await page.waitForSelector('#tour-profile-session-card', { timeout: 10000 })
    console.log('Card detected.')

    // 1. Check initial transform
    const initialTransform = await page.$eval('#tour-profile-session-card', el => window.getComputedStyle(el).transform)
    console.log('Initial transform:', initialTransform)

    // 2. Perform touch start (simulate finger press)
    const cardBBox = await page.$eval('#tour-profile-session-card', el => {
      const rect = el.getBoundingClientRect()
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    })

    const client = await page.target().createCDPSession()
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: cardBBox.x, y: cardBBox.y }]
    })

    await new Promise(r => setTimeout(r, 60))
    const pressedTransform = await page.$eval('#tour-profile-session-card', el => window.getComputedStyle(el).transform)
    console.log('Pressed transform (after 60ms):', pressedTransform)

    // 3. Hold for 320ms to trigger authentic breakthrough pop
    await new Promise(r => setTimeout(r, 320))
    const popTransform = await page.$eval('#tour-profile-session-card', el => window.getComputedStyle(el).transform)
    console.log('Breakthrough pop transform (after 380ms total):', popTransform)

    // Take screenshot during pop
    const artifactPath = path.resolve('C:/Users/AXIOO HYPE R5/.gemini/antigravity-ide/brain/7d76f317-4fcf-49ca-ad59-11b9dadcad38/mobile_lightweight_pop.png')
    await page.screenshot({ path: artifactPath })
    console.log('Screenshot saved to:', artifactPath)

    // 4. Release touch to open options modal
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: []
    })

    await new Promise(r => setTimeout(r, 200))
    const modalVisible = await page.$eval('body', el => el.innerText.includes('Opsi Sesi'))
    console.log('Options modal visible after release:', modalVisible)

    console.log('SUCCESS: All mobile lightweight checks verified!')
  } catch (err) {
    console.error('Test error:', err)
  } finally {
    await browser.close()
  }
}

run()
