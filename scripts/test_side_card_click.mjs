import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function testClick() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Go to slide 2
  await page.keyboard.press('ArrowDown');
  await new Promise(r => setTimeout(r, 1200));

  console.log('On Slide 2. Finding side card...');
  // Find all cards
  const cards = await page.$$('#product [data-slide-index="1"] div, #product .cursor-pointer');
  console.log(`Found ${cards.length} clickable elements in product`);

  // Let's click at coordinates of the right side card (e.g. x: 880, y: 480)
  const box = await page.evaluate(() => {
    // Get title of the active card
    const activeTitle = document.querySelector('#product h3')?.textContent;
    return { activeTitle };
  });
  console.log('Before click active card title:', box.activeTitle);

  // Click on the right card (offset +200px to the right of center)
  console.log('Clicking right card at x: 880, y: 460...');
  await page.mouse.click(880, 460);
  await new Promise(r => setTimeout(r, 1000));

  const afterBox = await page.evaluate(() => {
    const activeTitle = document.querySelector('#product h3')?.textContent;
    return { activeTitle };
  });
  console.log('After click active card title:', afterBox.activeTitle);

  const outDir = path.join(process.cwd(), 'public', 'screenshots');
  const outPath = path.join(outDir, 'verify_card_click_slid.png');
  await page.screenshot({ path: outPath });
  console.log('Saved screenshot after side card click:', outPath);

  await browser.close();
}

testClick().catch(console.error);
