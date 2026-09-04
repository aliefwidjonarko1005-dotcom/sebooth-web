import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const GALLERY_DIR = path.join(ROOT_DIR, 'public', 'images', 'gallery');
const THUMBS_DIR = path.join(GALLERY_DIR, 'thumbs');
const HD_DIR = path.join(GALLERY_DIR, 'hd');
const PINS_FILE = path.join(ROOT_DIR, 'src', 'data', 'galleryPins.ts');

async function run() {
  if (!fs.existsSync(GALLERY_DIR)) {
    console.error('Gallery directory does not exist:', GALLERY_DIR);
    return;
  }

  fs.mkdirSync(THUMBS_DIR, { recursive: true });
  fs.mkdirSync(HD_DIR, { recursive: true });

  const files = fs.readdirSync(GALLERY_DIR).filter(f => {
    return f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png');
  });

  console.log(`Found ${files.length} gallery images to optimize...`);

  let totalOrigBytes = 0;
  let totalThumbBytes = 0;
  let totalHdBytes = 0;

  const metadataMap = {};

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const baseName = file.replace(/\.(jpg|jpeg|png)$/i, '');
    const webpName = `${baseName}.webp`;

    const inputPath = path.join(GALLERY_DIR, file);
    const thumbPath = path.join(THUMBS_DIR, webpName);
    const hdPath = path.join(HD_DIR, webpName);

    const origStat = fs.statSync(inputPath);
    totalOrigBytes += origStat.size;

    try {
      const img = sharp(inputPath);
      const meta = await img.metadata();
      const origW = meta.width || 800;
      const origH = meta.height || 1200;

      // 1. Generate Thumbnail (max width 600px, quality 80)
      const thumbBuffer = await sharp(inputPath)
        .resize({ width: 600, withoutEnlargement: true })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
      fs.writeFileSync(thumbPath, thumbBuffer);
      totalThumbBytes += thumbBuffer.length;

      // 2. Generate HD (max width 1400px, quality 85)
      const hdBuffer = await sharp(inputPath)
        .resize({ width: 1400, withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();
      fs.writeFileSync(hdPath, hdBuffer);
      totalHdBytes += hdBuffer.length;

      metadataMap[file] = {
        baseName,
        webpName,
        width: origW,
        height: origH,
        thumbUrl: `/images/gallery/thumbs/${webpName}`,
        hdUrl: `/images/gallery/hd/${webpName}`
      };

      if ((i + 1) % 10 === 0 || i === files.length - 1) {
        console.log(`Progress: ${i + 1}/${files.length} images processed`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }

  console.log('\n--- Optimization Results ---');
  console.log(`Original total size: ${(totalOrigBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Thumbnails total size: ${(totalThumbBytes / (1024 * 1024)).toFixed(2)} MB (${((1 - totalThumbBytes / totalOrigBytes) * 100).toFixed(1)}% reduction)`);
  console.log(`HD total size: ${(totalHdBytes / (1024 * 1024)).toFixed(2)} MB (${((1 - totalHdBytes / totalOrigBytes) * 100).toFixed(1)}% reduction)`);

  // Update src/data/galleryPins.ts
  if (fs.existsSync(PINS_FILE)) {
    console.log('\nUpdating src/data/galleryPins.ts to point to optimized WebP assets...');
    let pinsContent = fs.readFileSync(PINS_FILE, 'utf8');

    // Update each pin entry
    for (const [origFile, info] of Object.entries(metadataMap)) {
      const oldUrlRegex = new RegExp(`"imageUrl":\\s*"/images/gallery/${origFile}"`, 'g');
      const newUrlSnippet = `"imageUrl": "${info.thumbUrl}",\n    "hdUrl": "${info.hdUrl}"`;
      pinsContent = pinsContent.replace(oldUrlRegex, newUrlSnippet);
    }

    fs.writeFileSync(PINS_FILE, pinsContent, 'utf8');
    console.log('✅ src/data/galleryPins.ts updated successfully!');
  }
}

run().catch(console.error);
