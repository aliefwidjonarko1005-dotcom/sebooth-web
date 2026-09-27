import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-usermedia-screen-capturing',
      '--auto-select-desktop-capture-source=Entire screen',
      '--use-fake-ui-for-media-stream',
      '--window-size=1280,800',
      '--disable-gpu-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });

  const base64Data = await page.evaluate(async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false
    });

    const mime = 'video/webm;codecs=vp9';
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5000000 });
    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(100);
    await new Promise(r => setTimeout(r, 2000));

    return new Promise(resolve => {
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: mime });
        const reader = new FileReader();
        reader.onloadend = () => resolve({ mime, base64: reader.result.split(',')[1] });
        reader.readAsDataURL(blob);
      };
      recorder.stop();
    });
  });

  const buffer = Buffer.from(base64Data.base64, 'base64');
  console.log('Recorded bytes:', buffer.length, 'MIME:', base64Data.mime);
  fs.writeFileSync('public/videos/test_clip.' + (base64Data.mime.includes('mp4') ? 'mp4' : 'webm'), buffer);
  await browser.close();
}

test().catch(console.error);
