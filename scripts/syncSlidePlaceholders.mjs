import fs from 'fs';
import path from 'path';

const slides = [
  { num: '01', id: 'hero', file: 'slide-01-hero' },
  { num: '02', id: 'services', file: 'slide-02-services' },
  { num: '03', id: 'frames', file: 'slide-03-frames' },
  { num: '04', id: 'pricing', file: 'slide-04-pricing' },
  { num: '05', id: 'partnership', file: 'slide-05-partnership' },
  { num: '06', id: 'contact', file: 'slide-06-contact' },
];

const publicDir = path.resolve(process.cwd(), 'public/images/slides');
const desktopDir = path.join(publicDir, 'desktop');
const mobileDir = path.join(publicDir, 'mobile');
const placeholdersDir = path.join(publicDir, 'placeholders');

[desktopDir, mobileDir, placeholdersDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// A valid minimal 1x1 base64 transparent PNG buffer for fallback if needed
const emptyPngBuffer = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
);

slides.forEach((s) => {
  const desktopSvgPath = path.join(placeholdersDir, `desktop-slide-${s.num}.svg`);
  const mobileSvgPath = path.join(placeholdersDir, `mobile-slide-${s.num}.svg`);

  // Ensure placeholder SVGs exist
  if (fs.existsSync(desktopSvgPath)) {
    // Copy as desktop svg
    fs.writeFileSync(path.join(desktopDir, `${s.file}.svg`), fs.readFileSync(desktopSvgPath));
  }
  if (fs.existsSync(mobileSvgPath)) {
    // Copy as mobile svg
    fs.writeFileSync(path.join(mobileDir, `${s.file}.svg`), fs.readFileSync(mobileSvgPath));
  }
});

console.log('Slide placeholders successfully synchronized to desktop and mobile folders!');
