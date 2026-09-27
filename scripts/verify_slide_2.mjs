import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function snap() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Advance to slide 2
  await page.keyboard.press('ArrowDown');
  await new Promise(r => setTimeout(r, 1500));

  const outDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'verify_slide_2_fixed.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot to:', outPath);

  // Also mobile viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.keyboard.press('ArrowDown');
  await new Promise(r => setTimeout(r, 1500));
  const outMobile = path.join(outDir, 'verify_slide_2_mobile_fixed.png');
  await page.screenshot({ path: outMobile });
  console.log('Saved mobile screenshot to:', outMobile);

  await browser.close();
}

snap().catch(console.error);
