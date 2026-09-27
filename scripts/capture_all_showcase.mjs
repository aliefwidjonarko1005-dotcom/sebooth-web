import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.resolve('public', 'screenshots');

const FAKE_USER = {
  id: 'e42f79ce-4721-4c15-84f3-f429ad9df958',
  email: 'seboothin@gmail.com',
  app_metadata: { provider: 'email' },
  user_metadata: { full_name: 'Sebooth Admin User' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z'
};

const FAKE_SESSION = {
  access_token: 'fake-jwt-token',
  token_type: 'bearer',
  expires_in: 86400,
  refresh_token: 'fake-refresh',
  user: FAKE_USER
};

// Target views to capture
const TARGETS = [
  { id: '01_slide_hero', type: 'slide', index: 0, name: 'Slide 01 — Hero Banner & CTA' },
  { id: '02_slide_services', type: 'slide', index: 1, name: 'Slide 02 — Services & 3D Coverflow' },
  { id: '03_slide_frames', type: 'slide', index: 2, name: 'Slide 03 — Exclusive Frames Marquee' },
  { id: '04_slide_gallery', type: 'slide', index: 3, name: 'Slide 04 — Pinterest Masonry Gallery' },
  { id: '05_slide_pricing', type: 'slide', index: 4, name: 'Slide 05 — Pricing & Rental Packages' },
  { id: '06_slide_faq', type: 'slide', index: 5, name: 'Slide 06 — Vector Folder 3D FAQ' },
  { id: '07_myphotos_focus', type: 'page', url: '/profile?preview=1', name: 'My Photos — Focus 3D Photo Stack' },
  { id: '08_myphotos_overview', type: 'page', url: '/profile?preview=1', overview: true, name: 'My Photos — Zoom-Out Matrix Overview' },
  { id: '09_frames_catalog', type: 'page', url: '/frames', name: 'Frames Catalog — Dedicated Subpage' },
  { id: '10_login', type: 'page', url: '/login', name: 'Login Page — Auth & Session Claim' },
  { id: '11_register', type: 'page', url: '/register', name: 'Register Page — Form Registrasi' },
  { id: '12_admin', type: 'page', url: '/admin?preview=1', name: 'Admin CMS Panel — Operator Dashboard' },
  { id: '13_access_claim', type: 'page', url: '/access/1f57ef74-61c4-492f-9b98-a9429b197f0e', name: 'QR Access Point — Softfile Claim' },
  { id: '14_queue_display', type: 'page', url: '/queue/b9fcefd4-3dff-4fa6-84c2-6b5d140a0789/display', name: 'Queue TV Display — Layar Monitor Venue' }
];

async function setupPage(page, auth = false) {
  await page.evaluateOnNewDocument((fakeSession, fakeUser, isAuth) => {
    // Hide Next.js dev overlay indicator
    const style = document.createElement('style');
    style.textContent = `
      nextjs-portal, #nextjs-dev-overlay, [data-nextjs-toast] {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);

    if (isAuth) {
      try {
        localStorage.setItem('sb-hfheuhivhwooaobgjtqv-auth-token', JSON.stringify(fakeSession));
      } catch (e) {}
      document.cookie = `sb-hfheuhivhwooaobgjtqv-auth-token=${encodeURIComponent(JSON.stringify(fakeSession))}; path=/; max-age=86400`;
    }
  }, FAKE_SESSION, FAKE_USER, auth);

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (auth && (u.includes('/auth/v1/user') || u.includes('/auth/v1/session'))) {
      req.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(FAKE_USER)
      });
    } else {
      req.continue();
    }
  });
}

async function captureAll() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Starting capture to: ${OUT_DIR}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  // 1. CAPTURE DESKTOP
  console.log('\n--- CAPTURING DESKTOP (1440x900) ---');
  for (const t of TARGETS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });
    await setupPage(page, t.auth);

    try {
      if (t.type === 'slide') {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1200));

        // Navigate to slide
        await page.evaluate((idx) => {
          window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: idx }));
          const el = document.querySelector(`[data-slide-index="${idx}"]`);
          if (el) el.scrollIntoView({ behavior: 'instant' });
        }, t.index);

        await new Promise(r => setTimeout(r, 1800));
      } else {
        await page.goto(`${BASE_URL}${t.url}`, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 2200));

        if (t.overview) {
          // Trigger overview mode in My Photos
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const gridBtn = btns.find(b => b.querySelector('svg.lucide-layout-grid') || b.getAttribute('aria-label')?.includes('grid'));
            if (gridBtn) gridBtn.click();
          });
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      // Hide dev overlay again just in case
      await page.evaluate(() => {
        document.querySelectorAll('nextjs-portal, #nextjs-dev-overlay').forEach(el => el.remove());
      });

      const desktopFile = path.join(OUT_DIR, `${t.id}_desktop.png`);
      await page.screenshot({ path: desktopFile });
      console.log(`[OK] Desktop: ${t.id}`);
    } catch (err) {
      console.error(`[ERR] Desktop ${t.id}:`, err.message);
    } finally {
      await page.close();
    }
  }

  // 2. CAPTURE MOBILE
  console.log('\n--- CAPTURING MOBILE (390x844 iPhone 14) ---');
  for (const t of TARGETS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await setupPage(page, t.auth);

    try {
      if (t.type === 'slide') {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
        await new Promise(r => setTimeout(r, 1200));

        // Navigate to slide
        await page.evaluate((idx) => {
          window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: idx }));
          const el = document.querySelector(`[data-slide-index="${idx}"]`);
          if (el) el.scrollIntoView({ behavior: 'instant' });
        }, t.index);

        await new Promise(r => setTimeout(r, 1800));
      } else {
        await page.goto(`${BASE_URL}${t.url}`, { waitUntil: 'networkidle2', timeout: 20000 });
        await new Promise(r => setTimeout(r, 2200));

        if (t.overview) {
          // Trigger overview mode in My Photos
          await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const gridBtn = btns.find(b => b.querySelector('svg.lucide-layout-grid') || b.getAttribute('aria-label')?.includes('grid'));
            if (gridBtn) gridBtn.click();
          });
          await new Promise(r => setTimeout(r, 1500));
        }
      }

      // Hide dev overlay
      await page.evaluate(() => {
        document.querySelectorAll('nextjs-portal, #nextjs-dev-overlay').forEach(el => el.remove());
      });

      const mobileFile = path.join(OUT_DIR, `${t.id}_mobile.png`);
      await page.screenshot({ path: mobileFile });
      console.log(`[OK] Mobile: ${t.id}`);
    } catch (err) {
      console.error(`[ERR] Mobile ${t.id}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\nAll screenshots captured successfully!');
}

captureAll().catch(console.error);
