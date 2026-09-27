import puppeteer from 'puppeteer-core';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 1000));
  await page.keyboard.press('ArrowDown');
  await new Promise(r => setTimeout(r, 1200));

  const getActive = async () => {
    return await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('#product div')).filter(d => d.style && d.style.transformStyle === 'preserve-3d');
      const activeCard = cards.find(c => c.style.zIndex === '30');
      return {
        activeText: activeCard?.querySelector('h3')?.textContent,
        cardsCount: cards.length,
        all: cards.map(c => ({
          title: c.querySelector('h3')?.textContent,
          zIndex: c.style.zIndex,
          transform: c.style.transform
        }))
      };
    });
  };

  console.log('--- BEFORE CLICK ---');
  const before = await getActive();
  console.log(JSON.stringify(before, null, 2));

  console.log('--- CLICKING RIGHT CARD AT (880, 460) ---');
  await page.mouse.click(880, 460);
  await new Promise(r => setTimeout(r, 600));

  console.log('--- AFTER CLICK ---');
  const after = await getActive();
  console.log(JSON.stringify(after, null, 2));

  await browser.close();
}

run().catch(console.error);
