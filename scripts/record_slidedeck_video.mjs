import puppeteer from 'puppeteer-core';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve('public/videos');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const MP4_OUTPUT = path.join(OUTPUT_DIR, 'sebooth_slidedeck_demo.mp4');
const WEBM_OUTPUT = path.join(OUTPUT_DIR, 'sebooth_slidedeck_demo.webm');

async function record() {
  console.log('--- Starting Sebooth Slide Deck Video Recording ---');
  console.log('FFmpeg:', ffmpegPath);
  console.log('Output MP4:', MP4_OUTPUT);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
      '--disable-dev-shm-usage',
      '--hide-scrollbars'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

  // Hide Next.js dev overlay
  await page.evaluateOnNewDocument(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      nextjs-portal, #nextjs-dev-overlay, [data-nextjs-toast] {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  });

  console.log('Navigating to http://localhost:3000/ ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Set up FFmpeg spawn process for MP4 (H.264 / AAC / YUV420P)
  const ffmpegProcess = spawn(ffmpegPath, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', '24',
    '-i', '-',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '20',
    '-movflags', '+faststart',
    MP4_OUTPUT
  ]);

  ffmpegProcess.stderr.on('data', data => {
    const msg = data.toString();
    if (msg.includes('fps=') || msg.includes('time=')) {
      process.stdout.write(`\r[FFmpeg] ${msg.trim().split('\n').pop()}`);
    }
  });

  ffmpegProcess.on('error', err => {
    console.error('FFmpeg process error:', err);
  });

  const client = await page.target().createCDPSession();
  let frameCount = 0;

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    frameCount++;
    try {
      if (ffmpegProcess.stdin.writable) {
        ffmpegProcess.stdin.write(Buffer.from(data, 'base64'));
      }
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch (e) {
      // Ignored if stopping
    }
  });

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 90,
    everyNthFrame: 1
  });

  console.log('\nScreencast started at 24fps. Capturing slides...');

  // ── SLIDE 01: HERO (Hold for 4.5 seconds to show panning & overlay)
  console.log('[1/6] Slide 01: Hero Section & Animated Overlay');
  await new Promise(r => setTimeout(r, 4500));

  // ── TRANSITION TO SLIDE 02: SERVICES
  console.log('[2/6] Transitioning to Slide 02: Our Services 3D Coverflow');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 1 })));
  await new Promise(r => setTimeout(r, 4500)); // Show 3D cards & partner logo marquee

  // ── TRANSITION TO SLIDE 03: FRAMES
  console.log('[3/6] Transitioning to Slide 03: Frames Marquee');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 2 })));
  await new Promise(r => setTimeout(r, 4500)); // Show 2-tier continuous marquee

  // ── TRANSITION TO SLIDE 04: PINTEREST GALLERY
  console.log('[4/6] Transitioning to Slide 04: Pinterest Masonry Wall');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 3 })));
  await new Promise(r => setTimeout(r, 2000));
  // Smoothly scroll down inside gallery container to show variety of pins
  await page.evaluate(() => {
    const galleryScroll = document.querySelector('.overflow-y-auto');
    if (galleryScroll) {
      galleryScroll.scrollBy({ top: 350, behavior: 'smooth' });
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  // ── TRANSITION TO SLIDE 05: PRICING
  console.log('[5/6] Transitioning to Slide 05: Pricing & Packages');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 4 })));
  await new Promise(r => setTimeout(r, 4500)); // Show pricing decks

  // ── TRANSITION TO SLIDE 06: FAQ
  console.log('[6/6] Transitioning to Slide 06: 3D FAQ Folders');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 5 })));
  await new Promise(r => setTimeout(r, 2000));

  // Interactive interaction on FAQ: switch folder tab and expand an item
  await page.evaluate(() => {
    // Click second folder tab if present
    const tabs = document.querySelectorAll('button');
    for (const btn of tabs) {
      if (btn.textContent && (btn.textContent.includes('TEKNIS') || btn.textContent.includes('FRAME'))) {
        btn.click();
        break;
      }
    }
  });
  await new Promise(r => setTimeout(r, 1200));

  // Click first FAQ item to expand
  await page.evaluate(() => {
    const accordionBtn = document.querySelector('button[aria-expanded], .cursor-pointer');
    if (accordionBtn) accordionBtn.click();
  });
  await new Promise(r => setTimeout(r, 3000));

  // ── LOOP BACK TO HERO
  console.log('[Return] Returning smoothly to Slide 01: Hero');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('sebooth:go-to-slide', { detail: 0 })));
  await new Promise(r => setTimeout(r, 3000));

  // Stop screencast
  await client.send('Page.stopScreencast');
  console.log(`\nScreencast stopped. Total frames piped: ${frameCount}`);

  ffmpegProcess.stdin.end();

  await new Promise((resolve) => {
    ffmpegProcess.on('close', (code) => {
      console.log(`\nFFmpeg finished with code ${code}.`);
      resolve();
    });
  });

  await browser.close();

  // Create WebM version for browser native video tag fallback
  console.log('Creating WebM version...');
  await new Promise((resolve, reject) => {
    const webmProcess = spawn(ffmpegPath, [
      '-y',
      '-i', MP4_OUTPUT,
      '-c:v', 'libvpx-vp9',
      '-crf', '28',
      '-b:v', '0',
      WEBM_OUTPUT
    ]);
    webmProcess.on('close', (code) => {
      console.log(`WebM conversion finished with code ${code}.`);
      resolve();
    });
    webmProcess.on('error', reject);
  });

  const mp4Stat = fs.statSync(MP4_OUTPUT);
  const webmStat = fs.statSync(WEBM_OUTPUT);
  console.log(`\nSUCCESS! Video generated:`);
  console.log(`- MP4: ${MP4_OUTPUT} (${(mp4Stat.size / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`- WebM: ${WEBM_OUTPUT} (${(webmStat.size / 1024 / 1024).toFixed(2)} MB)`);
}

record().catch(console.error);
