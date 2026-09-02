import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const SESSIONS_SRC = path.join(ROOT_DIR, 'picture_stocks', 'gallery-sebooth', 'gallery');
const PUBLIC_SESSIONS_DIR = path.join(ROOT_DIR, 'public', 'images', 'sessions');

if (!fs.existsSync(PUBLIC_SESSIONS_DIR)) {
  fs.mkdirSync(PUBLIC_SESSIONS_DIR, { recursive: true });
}

const sessionDirs = [
  {
    folder: 'Session_004a6bbb-121c-404b-a4bf-a52a66995175',
    id: 'session-004a6bbb',
    title: 'Måneskin in Paris',
    author: 'tom.dilan12',
    location: 'guide, Paris',
    dateStr: '2 June • 10:30 • 5 photos in this session',
    price: '$120',
    likes: '1.1k',
    category: 'CONCERT'
  },
  {
    folder: 'Session_008d08da-ebb3-4603-b676-e0e9353acc74',
    id: 'session-008d08da',
    title: 'Sarah & Kevin Wedding Party',
    author: 'sarah.kevin',
    location: 'creator, Bali',
    dateStr: '15 July • 16:00 • 5 photos in this session',
    price: '$150',
    likes: '2.4k',
    category: 'WEDDING'
  },
  {
    folder: 'Session_031d39e4-644b-48ac-83a9-3fad9d482983',
    id: 'session-031d39e4',
    title: 'Tokyo Vibes Shibuya Street',
    author: 'kenji.tokyo',
    location: 'photographer, Shibuya',
    dateStr: '28 Aug • 19:30 • 5 photos in this session',
    price: '$95',
    likes: '980',
    category: 'STREET'
  }
];

const generatedSessions = [];

for (let i = 0; i < sessionDirs.length; i++) {
  const sess = sessionDirs[i];
  const destDir = path.join(PUBLIC_SESSIONS_DIR, sess.id);
  const mediaList = [];

  // 1. Strip
  if (fs.existsSync(path.join(destDir, 'strip.webp'))) {
    mediaList.push({
      id: `${sess.id}-strip`,
      url: `/images/sessions/${sess.id}/strip.webp`,
      hdUrl: `/images/sessions/${sess.id}/strip.jpg`,
      type: 'strip',
      label: 'Photostrip 2x6'
    });
  }

  // 2. Photos 1 to 4
  for (let p = 1; p <= 4; p++) {
    if (fs.existsSync(path.join(destDir, `photo_${p}.webp`))) {
      mediaList.push({
        id: `${sess.id}-photo-${p}`,
        url: `/images/sessions/${sess.id}/photo_${p}.webp`,
        hdUrl: `/images/sessions/${sess.id}/photo_${p}.jpg`,
        type: 'photo',
        label: `Candid Pose #${p}`
      });
    }
  }

  // 3. GIF
  if (fs.existsSync(path.join(destDir, 'gif.gif'))) {
    mediaList.push({
      id: `${sess.id}-gif`,
      url: `/images/sessions/${sess.id}/gif.gif`,
      hdUrl: `/images/sessions/${sess.id}/gif.gif`,
      type: 'gif',
      label: 'Live Boomerang GIF'
    });
  }

  generatedSessions.push({
    id: sess.id,
    title: sess.title,
    author: sess.author,
    location: sess.location,
    dateStr: sess.dateStr,
    avatarUrl: `/images/sessions/${sess.id}/photo_1.webp`,
    badgeCount: mediaList.length,
    category: sess.category,
    likes: sess.likes,
    price: sess.price,
    media: mediaList,
    attendees: [
      `/images/sessions/${sess.id}/photo_1.webp`,
      `/images/sessions/${sess.id}/photo_2.webp`
    ]
  });
}

const outputFile = path.join(ROOT_DIR, 'src', 'data', 'demoSessions.ts');
const fileContent = `// Auto-generated optimized real demo sessions from Sebooth Picture Stocks
export interface DemoSessionItem {
  id: string;
  title: string;
  author: string;
  location: string;
  dateStr: string;
  avatarUrl: string;
  badgeCount: number;
  category: string;
  likes: string;
  price: string;
  media: {
    id: string;
    url: string;
    hdUrl?: string;
    type: 'strip' | 'photo' | 'gif' | 'video';
    label: string;
  }[];
  attendees: string[];
}

export const DEMO_SESSIONS: DemoSessionItem[] = ${JSON.stringify(generatedSessions, null, 2)};
`;

fs.writeFileSync(outputFile, fileContent, 'utf-8');
console.log('✅ Successfully updated src/data/demoSessions.ts with optimized WebP assets');
