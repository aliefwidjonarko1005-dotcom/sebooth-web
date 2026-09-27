import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ sessionId }) => {
    frameCount++;
    await client.send('Page.screencastFrameAck', { sessionId });
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 80,
    everyNthFrame: 1
  });

  console.log('Started screencast. Simulating scrolling...');
  for (let i = 1; i <= 3; i++) {
    await page.evaluate((idx) => {
      window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: idx }));
    }, i);
    await new Promise(r => setTimeout(r, 1000));
  }

  await client.send('Page.stopScreencast');
  console.log('Total screencast frames captured:', frameCount);
  await browser.close();
}

test().catch(console.error);
