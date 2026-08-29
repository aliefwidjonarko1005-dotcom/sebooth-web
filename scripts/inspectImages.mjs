import fs from 'fs';
import path from 'path';

// Check file sizes
const overlayPath = path.resolve('public/images/slides/hero/overlay_slide_1.png');
const bgPath = path.resolve('public/images/slides/hero/bg_slide_1.png');

console.log({
  overlayExists: fs.existsSync(overlayPath),
  overlaySize: fs.statSync(overlayPath).size,
  bgExists: fs.existsSync(bgPath),
  bgSize: fs.statSync(bgPath).size,
});
