import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ROOT_DIR = process.cwd();
const SESSIONS_DIR = path.join(ROOT_DIR, 'public', 'images', 'sessions');

async function optimizeImages() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    console.error('Sessions directory not found');
    return;
  }

  const sessionFolders = fs.readdirSync(SESSIONS_DIR).filter(f => 
    fs.statSync(path.join(SESSIONS_DIR, f)).isDirectory()
  );

  for (const sessionFolder of sessionFolders) {
    const folderPath = path.join(SESSIONS_DIR, sessionFolder);
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        const inputPath = path.join(folderPath, file);
        const webpName = file.replace(/\.(jpg|png)$/i, '.webp');
        const outputPath = path.join(folderPath, webpName);

        try {
          const image = sharp(inputPath);
          const metadata = await image.metadata();

          let transform = image;
          if (metadata.width && metadata.width > 1200) {
            transform = transform.resize({ width: 1200, withoutEnlargement: true });
          }

          await transform
            .webp({ quality: 82, effort: 4 })
            .toFile(outputPath);

          const origSize = (fs.statSync(inputPath).size / 1024).toFixed(1);
          const newSize = (fs.statSync(outputPath).size / 1024).toFixed(1);
          console.log(`Optimized ${sessionFolder}/${file}: ${origSize} KB -> ${newSize} KB (${webpName})`);
        } catch (err) {
          console.error(`Error optimizing ${file}:`, err);
        }
      }
    }
  }

  console.log('✅ Image optimization complete!');
}

optimizeImages();
