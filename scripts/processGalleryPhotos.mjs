import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_DIR = path.resolve(__dirname, "../picture_stocks/gallery-sebooth/gallery");
const DEST_DIR = path.resolve(__dirname, "../public/images/gallery");

// Helper to get image dimensions from JPEG buffer
function getDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    // PNG
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    // JPEG
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        // SOF marker
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  // Fallback default
  return { width: 800, height: 1200 };
}

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Read all session folders
const sessionFolders = fs.readdirSync(SOURCE_DIR).filter((name) => {
  return fs.statSync(path.join(SOURCE_DIR, name)).isDirectory() && name.startsWith("Session_");
});

console.log(`Found ${sessionFolders.length} session folders.`);

const galleryItems = [];
const titlesPool = [
  "Golden Moments", "Radiant Spark", "Vintage Glamour", "Retro Vibe", "Sweet Memories",
  "Celebration Night", "Vibrant Joy", "Timeless Smiles", "Campus Reunion", "Urban Candid",
  "Funky Pose", "Elegant Charm", "Romantic Sunset", "Laughter & Joy", "BFF Squad",
  "High School Glow", "Golden Hour Pose", "Studio Highlights", "Party Fever", "Velvet Night",
  "Festive Mood", "Chic Vibes", "Pure Euphoria", "Neon Dream", "Sparkle & Shine",
  "Weekend Party", "Forever Friends", "Classic Monochrome", "Endless Joy", "Midnight Flash",
  "Sweetheart Memories", "Glam Squad", "Dazzling Smiles", "Pop & Pose", "Retro Glow",
  "Unforgettable Day", "Lively Vibe", "Aesthetic Moments", "Best Friends Forever", "Bright Lights"
];

const categoryPool = [
  "PHOTOSTRIP 2x6", "EVENT MOMENT", "CANDID POSE", "PARTY VIBES", "WEDDING & ROMANCE",
  "CAMPUS EVENT", "FRIENDS & SQUAD", "BIRTHDAY CELEBRATION"
];

let itemIndex = 1;

for (let i = 0; i < sessionFolders.length; i++) {
  const folderName = sessionFolders[i];
  const folderPath = path.join(SOURCE_DIR, folderName);
  const files = fs.readdirSync(folderPath);

  // 1. Find Strip file
  const stripFile = files.find((f) => f.toLowerCase().startsWith("strip") && (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")));
  
  // 2. Find regular photo files (photo_1.jpg, photo_2.jpg, etc.)
  const photoFiles = files.filter((f) => f.toLowerCase().startsWith("photo_") && (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")));

  const sessionShortId = folderName.replace("Session_", "").substring(0, 8);

  // Process Strip
  if (stripFile) {
    const srcStripPath = path.join(folderPath, stripFile);
    const destStripName = `strip_${sessionShortId}.jpg`;
    const destStripPath = path.join(DEST_DIR, destStripName);
    fs.copyFileSync(srcStripPath, destStripPath);

    const dims = getDimensions(srcStripPath);
    const title = titlesPool[(itemIndex * 3) % titlesPool.length];
    const likes = Math.floor(Math.random() * 400) + 150;

    galleryItems.push({
      id: `pin-${itemIndex++}`,
      title: `${title} Strip`,
      category: "PHOTOSTRIP 2x6",
      frameType: "Photostrip 2x6 Custom Frame",
      imageUrl: `/images/gallery/${destStripName}`,
      width: dims.width,
      height: dims.height,
      tags: ["Photostrip", "Sebooth", "Print", "Memories"],
      likes,
      type: "strip"
    });
  }

  // Process 1 Random Photo
  if (photoFiles.length > 0) {
    // Random select 1 photo
    const randomIndex = Math.floor(Math.random() * photoFiles.length);
    const chosenPhoto = photoFiles[randomIndex];
    const photoNum = chosenPhoto.replace(/[^0-9]/g, "") || "1";

    const srcPhotoPath = path.join(folderPath, chosenPhoto);
    const destPhotoName = `photo_${sessionShortId}_${photoNum}.jpg`;
    const destPhotoPath = path.join(DEST_DIR, destPhotoName);
    fs.copyFileSync(srcPhotoPath, destPhotoPath);

    const dims = getDimensions(srcPhotoPath);
    const title = titlesPool[(itemIndex * 7) % titlesPool.length];
    const category = categoryPool[(itemIndex * 5) % categoryPool.length];
    const likes = Math.floor(Math.random() * 500) + 180;

    galleryItems.push({
      id: `pin-${itemIndex++}`,
      title: title,
      category: category,
      frameType: "High-Res Pose Studio Capture",
      imageUrl: `/images/gallery/${destPhotoName}`,
      width: dims.width,
      height: dims.height,
      tags: ["Candid", "Sebooth", "Pose", "Event"],
      likes,
      type: "photo"
    });
  }
}

// Interleave items so strips and regular photos alternate nicely for Pinterest aesthetic
const strips = galleryItems.filter(item => item.type === "strip");
const photos = galleryItems.filter(item => item.type === "photo");

const interleaved = [];
const maxLength = Math.max(strips.length, photos.length);
for (let i = 0; i < maxLength; i++) {
  // Let's create an organic shuffle (1 strip, 1 photo, or 2 photos, 1 strip)
  if (i % 2 === 0) {
    if (strips[i]) interleaved.push(strips[i]);
    if (photos[i]) interleaved.push(photos[i]);
  } else {
    if (photos[i]) interleaved.push(photos[i]);
    if (strips[i]) interleaved.push(strips[i]);
  }
}

// Re-assign sequential IDs
interleaved.forEach((pin, idx) => {
  pin.id = `pin-${idx + 1}`;
});

console.log(`Generated ${interleaved.length} gallery items (${strips.length} strips, ${photos.length} photos).`);

// Write to TypeScript file
const tsContent = `// Automatically generated Pinterest Gallery Data from Sebooth Picture Stocks
export interface PortfolioPin {
  id: string;
  title: string;
  category: string;
  frameType: string;
  imageUrl: string;
  width: number;
  height: number;
  tags: string[];
  likes: number;
}

export const GALLERY_PINS: PortfolioPin[] = ${JSON.stringify(interleaved, null, 2)};
`;

const DATA_FILE = path.resolve(__dirname, "../src/data/galleryPins.ts");
const DATA_DIR = path.resolve(__dirname, "../src/data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
fs.writeFileSync(DATA_FILE, tsContent, "utf-8");

console.log(`Saved gallery data to ${DATA_FILE}`);
