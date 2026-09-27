import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function run() {
  console.log('--- 1. Optimizing Hero Assets ---');
  const heroDir = path.join(process.cwd(), 'public', 'images', 'slides', 'hero');
  const bgPng = path.join(heroDir, 'bg_slide_1.png');
  const bgWebp = path.join(heroDir, 'bg_slide_1.webp');
  const overlayPng = path.join(heroDir, 'overlay_slide_1.png');
  const overlayWebp = path.join(heroDir, 'overlay_slide_1.webp');

  if (fs.existsSync(bgPng)) {
    const rawSize = fs.statSync(bgPng).size;
    await sharp(bgPng)
      .resize(1920, 1080, { fit: 'cover' })
      .webp({ quality: 80, effort: 6 })
      .toFile(bgWebp);
    const newSize = fs.statSync(bgWebp).size;
    console.log(`bg_slide_1: ${(rawSize / 1024 / 1024).toFixed(2)} MB -> ${(newSize / 1024).toFixed(1)} KB (-${((1 - newSize / rawSize) * 100).toFixed(1)}%)`);
  }

  if (fs.existsSync(overlayPng)) {
    const rawSize = fs.statSync(overlayPng).size;
    await sharp(overlayPng)
      .webp({ quality: 85, effort: 6 })
      .toFile(overlayWebp);
    const newSize = fs.statSync(overlayWebp).size;
    console.log(`overlay_slide_1: ${(rawSize / 1024).toFixed(1)} KB -> ${(newSize / 1024).toFixed(1)} KB (-${((1 - newSize / rawSize) * 100).toFixed(1)}%)`);
  }

  console.log('\n--- 2. Optimizing 35 Photostrip Frames for Slider ---');
  const framesDir = path.join(process.cwd(), 'public', 'images', 'frames');
  const thumbDir = path.join(framesDir, 'thumb');
  const modalDir = path.join(framesDir, 'modal');
  if (!fs.existsSync(thumbDir)) fs.mkdirSync(thumbDir, { recursive: true });
  if (!fs.existsSync(modalDir)) fs.mkdirSync(modalDir, { recursive: true });

  const files = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
  let totalRaw = 0;
  let totalThumb = 0;
  let totalModal = 0;

  for (const file of files) {
    const srcPath = path.join(framesDir, file);
    const baseName = path.parse(file).name;
    const thumbPath = path.join(thumbDir, `${baseName}.webp`);
    const modalPath = path.join(modalDir, `${baseName}.webp`);
    const rawSize = fs.statSync(srcPath).size;
    totalRaw += rawSize;

    // Thumbnail for continuous marquee (width 600px for high-density mobile/retina screens)
    await sharp(srcPath)
      .resize(600, null, { withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(thumbPath);

    // Modal preview (width 1200px for high-definition modal lightbox)
    await sharp(srcPath)
      .resize(1200, null, { withoutEnlargement: true })
      .webp({ quality: 84, effort: 5 })
      .toFile(modalPath);

    totalThumb += fs.statSync(thumbPath).size;
    totalModal += fs.statSync(modalPath).size;
  }

  console.log(`Frames (${files.length} items):`);
  console.log(`Raw PNG Total: ${(totalRaw / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Thumb WebP Total: ${(totalThumb / 1024 / 1024).toFixed(2)} MB (-${((1 - totalThumb / totalRaw) * 100).toFixed(1)}%)`);
  console.log(`Modal WebP Total: ${(totalModal / 1024 / 1024).toFixed(2)} MB (-${((1 - totalModal / totalRaw) * 100).toFixed(1)}%)`);
  console.log('\nOptimization complete!');
}

run().catch(console.error);
