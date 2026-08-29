"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Search, X, ZoomIn, Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface FrameItem {
    id: string;
    title: string;
    category: string;
    image_url: string;
    desc?: string;
    subtitle?: string;
    features?: string[];
}

export const DEFAULT_FRAMES: FrameItem[] = [
    {
        id: 'frame-1-1',
        title: 'BLACK & GOLD BEM UNDIP FAREWELL',
        category: 'ELEGANT PARTY',
        subtitle: 'Pola Heksagon Hitam Emas & Glitter Luxury',
        desc: 'Bingkai perpisahan bertema malam penghargaan dengan kombinasi pola heksagon hitam emas berglitter, logo BEM UNDIP 2025, dan pembatas emas bernuansa mewah.',
        image_url: '/images/frames/1.1.png',
        features: ['Pola Heksagon Hitam-Emas Glitter', 'Logo & Branding BEM UNDIP 2025', 'Bingkai Border Emas Luxury', 'Format 3 Pose Landscape']
    },
    {
        id: 'frame-1-2',
        title: 'BURGUNDY VELVET BEM UNDIP',
        category: 'ELEGANT PARTY',
        subtitle: 'Pola Heksagon Merah Burgundy & Glitter Emas',
        desc: 'Nuansa malam perpisahan yang mewah dengan kombinasi warna merah burgundy velvet, aksen heksagon keemasan berglitter, dan header resmi Farewell BEM UNDIP.',
        image_url: '/images/frames/1.2.png',
        features: ['Latar Belakang Burgundy Velvet', 'Glitter Emas & Pola Heksagon', 'Typography Farewell BEM UNDIP', 'Format 3 Pose Landscape']
    },
    {
        id: 'frame-2-1',
        title: 'VIOLET BATIK FIRST GATHERING HMTI',
        category: 'ACADEMIC EVENT',
        subtitle: 'Motif Batik Ungu & Sketsa Arsitektur Teknik Industri',
        desc: 'Bingkai acara keakraban mahasiswa bertema tradisional-modern dengan motif batik bunga berwarna ungu violet, teks 3D First Gathering HMTI, dan sketsa arsitektur gedung perkuliahan Teknik Industri.',
        image_url: '/images/frames/2.1.png',
        features: ['Motif Batik Floral Ungu Violet', 'Teks 3D First Gathering HMTI', 'Sketsa Gedung Teknik Industri', 'Format 3 Pose Landscape']
    },
    {
        id: 'frame-2-2',
        title: 'SKY BLUE BATIK HMTI GATHERING',
        category: 'ACADEMIC EVENT',
        subtitle: 'Motif Batik Biru Muda & Sketsa Kampus Teknik Industri',
        desc: 'Varian warna biru langit yang segar dengan motif batik tradisional, huruf 3D oranye-kuning First Gathering HMTI, serta gambar lukisan garis gedung Teknik Industri.',
        image_url: '/images/frames/2.2.png',
        features: ['Motif Batik Tradisional Biru Langit', 'Typography 3D Yellow-Orange', 'Sketsa Kampus Teknik Industri', 'Vibes Fresh Academic Gathering']
    },
    {
        id: 'frame-3-1',
        title: 'PIRATE ADVENTURE WELCOMING PARTY',
        category: 'THEMATIC PARTY',
        subtitle: 'Maskot Beruang Bajak Laut & Peta Harta Karun BEM UNDIP',
        desc: 'Tema petualangan laut yang seru dengan maskot beruang berpakaian bajak laut, latar tekstur pasir pantai, peta harta karun, dan tulisan Welcoming Party Dipanegara BEM UNDIP 2026.',
        image_url: '/images/frames/3.1.png',
        features: ['Maskot 3D Beruang Bajak Laut', 'Tekstur Kertas Peta Harta Karun', 'Header Welcoming Party Dipanegara', 'Latar Pasir Pantai & Tali Tambang']
    },
    {
        id: 'frame-3-2',
        title: 'OCEAN SAILBOAT WELCOMING PARTY',
        category: 'WATERCOLOR ART',
        subtitle: 'Gelombang Laut Soft Pastel & Ilustrasi Kapal Layar',
        desc: 'Estetika lukisan cat air laut bernuansa ungu-biru pastel yang tenang, dilengkapi ilustrasi kapal layar yang mengarungi ombak dan tipografi Welcoming Party BEM UNDIP 2026.',
        image_url: '/images/frames/3.2.png',
        features: ['Lukisan Cat Air Ocean Waves', 'Ilustrasi Kapal Layar Watercolor', 'Gradasi Soft Purple & Blue', 'Header Official BEM UNDIP 2026']
    },
    {
        id: 'frame-4-1',
        title: 'JAPANESE WAVE & DEKANAT FT BEM',
        category: 'ACADEMIC EVENT',
        subtitle: 'Ombak Jepang Blue-Gold & Sketsa Gedung Dekanat FT',
        desc: 'Perpaduan estetika seni ombak Jepang bertema biru tua-emas dengan sketsa arsitektur gedung Dekanat Fakultas Teknik UNDIP untuk perayaan Welcoming Party BEM FT 2026.',
        image_url: '/images/frames/4.1.png',
        features: ['Seni Ombak & Matahari Jepang', 'Sketsa Line-Art Gedung Dekanat FT', 'Skema Warna Royal Blue & Gold', 'Header Official BEM FT 2026']
    },
    {
        id: 'frame-4-2',
        title: 'TEAL PAPERCUT SUN & WAVES',
        category: 'MODERN ART',
        subtitle: 'Layer Papercraft Toska & Matahari Terbit Emas',
        desc: 'Bingkai seni potong kertas (papercut 3D) bertingkat dengan nuansa warna hijau toska, latar belakang laut, matahari emas melengkung, dan tipografi Welcoming Party BEM FT 2026.',
        image_url: '/images/frames/4.2.png',
        features: ['Efek Layer Papercraft 3D Toska', 'Matahari Terbit Emas Premium', 'Header Welcoming Party BEM FT', 'Desain Modern Layered Aesthetic']
    },
    {
        id: 'frame-5-1',
        title: 'MAHOGANY MAP & RED WAX SEAL BEM SV',
        category: 'CLASSIC VINTAGE',
        subtitle: 'Kayu Mahogany, Segel Lilin Merah & Peta Alkemia',
        desc: 'Desain vintage petualangan ilmiah dengan latar belakang tekstur kayu mahogany tua, segel lilin merah 3D, papan kompas, peta alkemia antik, dan tulisan First Gathering BEM SV 2026.',
        image_url: '/images/frames/5.1.png',
        features: ['Stempel Segel Lilin Merah 3D', 'Tekstur Kayu Mahogany Vintage', 'Peta Alkemia & Kompas Antik', 'Header First Gathering BEM SV 2026']
    },
    {
        id: 'frame-5-2',
        title: 'ROYAL NAVY & BLUE ROSE BEM SV',
        category: 'ROYAL VINTAGE',
        subtitle: 'Mawar Biru Elegan, Kompas Emas & Koran Vintage Navy',
        desc: 'Estetika vintage mewah berwarna biru navy royal dengan hiasan kuntum mawar biru, kompas keemasan, naskah koran tua, dan kaligrafi Gothic First Gathering BEM SV 2026.',
        image_url: '/images/frames/5.2.png',
        features: ['Ilustrasi Mawar Biru Watercolor', 'Ornamen Kompas Emas Antik', 'Font Kaligrafi Gothic Royal', 'Tekstur Vintage Paper Navy Blue']
    },
    {
        id: 'frame-5-3',
        title: 'SEPIA WOODEN SIGNBOARD & NEWSPAPER BEM SV',
        category: 'VINTAGE NEWSPAPER',
        subtitle: 'Kertas Perkamen Sepia, Papan Kayu Gantung & Naskah Koran',
        desc: 'Konsep dokumen surat kabar klasik berlatar kayu sepia hangat, papan nama kayu gantung, naskah koran antik, dan header Welcome to BEM SV 2026 Official First Gathering.',
        image_url: '/images/frames/5.3.png',
        features: ['Papan Kayu Signboard Gantung', 'Tekstur Kertas Perkamen Sepia', 'Naskah Koran Klasik Vintage', 'Header Welcome to BEM SV 2026']
    },
    {
        id: 'frame-6-1',
        title: 'GRUNGE STREET POSTER FERTILIZED',
        category: 'STREETWEAR Y2K',
        subtitle: 'Poster Jalanan Hitam Metalik & LAZONE.ID FERTILIZED',
        desc: 'Gaya grunge street art hitam metalik ala poster konser rock underground dengan tekstur kertas terkelupas, efek noise, dan header LAZONE.ID FERTILIZED 6.0.',
        image_url: '/images/frames/6.1.png',
        features: ['Tekstur Street Wall Poster', 'Noise & Metalic Dark Grunge', 'Typography Rock Concert', 'Header LAZONE.ID FERTILIZED 6.0']
    },
    {
        id: 'frame-6-2',
        title: 'DARK UNDERGROUND CHROME STAR',
        category: 'CYBERPUNK Y2K',
        subtitle: 'Elegan Dark Metal & Chrome Star FERTILIZED',
        desc: 'Estetika cyberpunk underground serba gelap dengan bintang chrome cair 3D metalik di bagian bawah dan branding FERTILIZED LAZONE.ID yang futuristik.',
        image_url: '/images/frames/6.2.png',
        features: ['Logo Bintang Chrome Liquid 3D', 'Background Dark Metal Textured', 'Visual Minimalis Industrial', 'Branding LAZONE.ID Official']
    },
    {
        id: 'frame-6-3',
        title: 'CHROME GOTHIC CYBERPUNK FERTILIZED',
        category: 'CYBERPUNK Y2K',
        subtitle: 'Liquid Metal Header & Gothic Typography',
        desc: 'Tampilan Y2K cyberpunk tingkat lanjut dengan header cairan raksa metalik (liquid chrome goth), efek distorsi analog, dan layout photo strip bergaris tegas.',
        image_url: '/images/frames/6.3.png',
        features: ['Liquid Chrome Gothic Header', 'Distorsi Analog Cyberpunk', 'Layout Frame Dark Industrial', 'Branding FERTILIZED LAZONE.ID']
    },
    {
        id: 'frame-6-4',
        title: 'BOXING MATCH FIERY STRIVENGE',
        category: 'SPORT CONCERT',
        subtitle: 'Poster Ring Tinju Merah-Oranye & Mahasiswa Si Paling Kuat',
        desc: 'Desain ala poster pertandingan tinju retro berwarna oranye menyala dan hitam, menampilkan jargon "MAHASISWA SI PALING KUAT" dan header STRIVENGE BOXING LAZONE.ID.',
        image_url: '/images/frames/6.4.png',
        features: ['Warna Oranye Api & Hitam Kontras', 'Slogan Mahasiswa Si Paling Kuat', 'Typography Marquee Boxing Sign', 'Branding STRIVENGE LAZONE.ID']
    },
    {
        id: 'frame-6-5',
        title: 'HIGH CONTRAST BLUE & YELLOW STRIVENGE',
        category: 'MODERN POP',
        subtitle: 'Duo-Tone Yellow-Blue & Orange Ribbon Headline',
        desc: 'Estetika pop modern duo-tone dengan perpaduan warna biru elektrik, aksen strip kuning menyala, dan ribbon header "THE STRIVENGE LAZONE.ID" yang sangat energik.',
        image_url: '/images/frames/6.5.png',
        features: ['Skema Duo-Tone Biru & Kuning', 'Header Ribbon Orange Strivenge', 'Layout Clean Photo Grid', 'High Energy Street Vibe']
    },
    {
        id: 'frame-6-6',
        title: 'VINTAGE BOXING HALFTONE COLLAGE',
        category: 'RETRO SPORT',
        subtitle: 'Kolase Koran Halftone & Tribut Boxing Legend',
        desc: 'Desain tribut tinju klasik bergaya cetakan koran halftone retro berwarna cyan biru, menampilkan potongan artikel koran bertema Muhammad Ali dan slogan STRIVENGE.',
        image_url: '/images/frames/6.6.png',
        features: ['Kolase Cetakan Koran Halftone', 'Ilustrasi Boxing Legend Vintage', 'Palet Warna Cyan Blue & Concrete', 'Header Retro Strivenge Edition']
    },
    {
        id: 'frame-7-1',
        title: 'GREEN & BLUE SCHOOL LOCKER',
        category: 'SCRAPBOOK SCHOOL',
        subtitle: 'Loker Sekolah Hijau-Biru & Memo Post-It Ruang Temu',
        desc: 'Konsep loker sekolah dua warna (hijau mint & biru langit) yang dihiasi tempelan memo post-it, stiker smileys, dan teks K-PSDM BEM-U Ruang Temu 2026.',
        image_url: '/images/frames/7.1.png',
        features: ['Tekstur Loker Sekolah Dua Warna', 'Kertas Memo Post-It Yellow', 'Stiker Smiley & Buku Catatan', 'Header K-PSDM BEM-U Ruang Temu']
    },
    {
        id: 'frame-8-1',
        title: 'RETRO 70S GROOVY FSM GOT TALENT',
        category: 'RETRO GROOVY',
        subtitle: 'Bunga Daisy Kuning 70s, Koran Vintage & BEM SENIORA',
        desc: 'Gaya groovy 1970-an yang meriah dengan hiasan bunga daisy kuning, koran vintage, tipografi lengkung oranye-merah "BEM FSM SENIORA", dan logo Selamat Datang di FSM Got Talent.',
        image_url: '/images/frames/8.1.png',
        features: ['Tipografi Retro Groovy 70s', 'Bunga Daisy Yellow Sunshine', 'Koran Vintage Festival', 'Header FSM Got Talent & BEM SENIORA']
    },
    {
        id: 'frame-9-1',
        title: 'ROYAL MAROON & GOLD HIMAFORMAS',
        category: 'ELEGANT PARTY',
        subtitle: 'Frame Lis Emas Metalik & Farewell AT Himaformas',
        desc: 'Desain perpisahan yang mewah berlatarkan gradasi tirai merah maroon dengan lis bingkai foto ukiran emas berkilau bertuliskan Farewell AT Himaformas.',
        image_url: '/images/frames/9.1.png',
        features: ['Border Lis Emas Metalik Glowing', 'Background Red Maroon Velvet', 'Header Farewell AT Himaformas', 'Kesan Formal & Prestigius']
    },
    {
        id: 'frame-9-2',
        title: 'WAX SEAL & RED ROSES HIMAFORMAS',
        category: 'CLASSIC VINTAGE',
        subtitle: 'Segel Lilin Kompas 3D, Mawar Merah & Ukiran Emas Relief',
        desc: 'Nuansa surat klasik romantis dengan segel lilin merah stamped kompas 3D, mawar merah vintage, naskah koran antik, dan spanduk ukiran emas Farewell AT Himaformas.',
        image_url: '/images/frames/9.2.png',
        features: ['Stempel Wax Seal Red Compass 3D', 'Aksen Mawar Merah Vintage', 'Kertas Koran Latin Antik', 'Spanduk Ukiran Emas Relief']
    },
    {
        id: 'frame-9-4',
        title: 'MAGENTA NEON GLOW HIMAFORMAS',
        category: 'NEON PARTY',
        subtitle: 'Gelombang Neon Magenta & Font Emas 3D Cursive',
        desc: 'Efek pencahayaan pesta neon berwarna magenta dan crimson yang memukau dengan tipografi emas 3D cursive bertuliskan FAREWELL HIMAFORMAS serta pendaran sparkle cahaya.',
        image_url: '/images/frames/9.4.png',
        features: ['Pencahayaan Neon Magenta-Pink Glow', 'Font Cursive Emas 3D Metallic', 'Partikel Sparkle Light Trails', 'Header Official Farewell HIMAFORMAS']
    },
    {
        id: 'frame-10-1',
        title: 'BATIK MEGAMENDUNG & GOLD CAMPUS',
        category: 'TRADITIONAL GRADUATION',
        subtitle: 'Batik Megamendung Biru, Candi Emas & Gedung Kampus',
        desc: 'Kombinasi kebudayaan batik Megamendung biru tua dengan motif candi emas, serta latar keemasan dengan lukisan cat air gedung kampus dan karakter wisudawan manis.',
        image_url: '/images/frames/10.1.png',
        features: ['Motif Batik Megamendung Royal Blue', 'Ukiran Candi & Gedung Kampus Emas', 'Karakter Anime Wisudawan Cute', 'Header Official Wisuda Angkatan VI']
    },
    {
        id: 'frame-10-2',
        title: 'MANGA HALFTONE WISUDA SQUAD',
        category: 'MANGA GRADUATION',
        subtitle: 'Komik Halftone Hitam-Putih & Anime Squad Wisuda',
        desc: 'Gaya komik manga Jepang dengan latar halftone majalah, judul pop-art 3D kuning "WISUDA ANGKATAN VI", serta karakter squad wisudawan bertoga biru yang ceria.',
        image_url: '/images/frames/10.2.png',
        features: ['Pattern Halftone Komik Shonen B&W', 'Teks Pop-Art 3D Yellow Glow', 'Ilustrasi Anime Wisudawan Blue Toga', 'Desain Modern Energetik']
    },
    {
        id: 'frame-10-3',
        title: 'CLASS OF 2026 CONFETTI CELEBRATION',
        category: 'PARTY GRADUATION',
        subtitle: 'Taburan Konfeti Warna-Warni & Kelompok Wisudawan',
        desc: 'Perayaan kesuksesan bertema ceria dengan kombinasi warna kuning-biru, taburan konfeti warna-warni, gulungan ijazah terbang, dan ilustrasi kelompok wisudawan Class of 2026.',
        image_url: '/images/frames/10.3.png',
        features: ['Taburan Konfeti & Gulungan Ijazah', 'Banner Class of 2026 Bold', 'Ilustrasi Kelompok Wisudawan', 'Kombinasi Warna Kuning & Biru Ceria']
    },
    {
        id: 'frame-11-1',
        title: 'FISIPMARS PARTY ELECTRIC NEON',
        category: 'NEON PARTY',
        subtitle: 'Typography Merah-Oranye Neon & Midnight Blue Background',
        desc: 'Desain konser malam yang futuristik dengan latar biru midnight, kilau lampu neon cyan, serta tipografi raksasa "FISIPMARS PARTY" berwarna merah-oranye yang tegas.',
        image_url: '/images/frames/11.1.png',
        features: ['Typography Fisipmars Party Bold', 'Gradasi Lampu Concert Blue-Cyan', 'Header Space Logo Institutional Partner', 'High Impact Visual Contrast']
    },
    {
        id: 'frame-11-2',
        title: 'LIME NEON & PARTY TODAY SLEEP WELL',
        category: 'NEON PARTY',
        subtitle: 'Semprotan Neon Purple-Lime & Slogan Party Today',
        desc: 'Efek semprotan pilox neon ungu-lime yang edgy dipadu dengan latar biru metalik berglitter dan slogan pesta ikonik "party today, sleep well tomorrow".',
        image_url: '/images/frames/11.2.png',
        features: ['Grafiti Semprotan Neon Purple-Lime', 'Tekstur Blue Metalik Glitter', 'Slogan Party Today Sleep Well Tomorrow', 'Vibes Festival Musik Underground']
    },
    {
        id: 'frame-11-3',
        title: 'STEAMPUNK GEARS & WAX SEAL NIGHT',
        category: 'STEAMPUNK VINTAGE',
        subtitle: 'Roda Gigi Jam Antik & Amplop Segel Lilin Merah',
        desc: 'Tema mekanis vintage Steampunk dengan hiasan roda gigi kuningan, jam antik, amplop surat berselimut segel lilin merah, dan teks FISIPMARS NIGHT kuning menyala.',
        image_url: '/images/frames/11.3.png',
        features: ['Ornamen Roda Gigi Steampunk 3D', 'Stempel Wax Seal Merah pada Amplop', 'Typography Fisipmars Night Yellow', 'Tekstur Kertas Sepia & Kayu Tua']
    },
    {
        id: 'frame-11-4',
        title: 'COSMIC MARS DISCO & VOX CREATIVA',
        category: 'GALAXY DISCO',
        subtitle: 'Planet Mars 3D, Bola Disko Silver & Slogan Vox Creativa',
        desc: 'Kemegahan malam galaksi bertema planet Mars 3D, bulan bersinar, kilau bola disko perak, dan papan motto "VOX CREATIVA NOCTIS: THE VOICE OF A CREATIVE GENERATION".',
        image_url: '/images/frames/11.4.png',
        features: ['Ilustrasi 3D Planet Mars & Bulan', 'Silver Disco Balls Glowing Effect', 'Spanduk Tagline Vox Creativa Noctis', 'Latar Langit Malam Papercut Layer']
    },
    {
        id: 'frame-12-1',
        title: 'OSAKA BOARDING PASS TICKET',
        category: 'TRAVEL TICKET',
        subtitle: 'Barcode Tiket Penerbangan & Scallop Cokelat Kayu',
        desc: 'Desain unik seperti tiket boarding pass penerbangan ke Osaka dengan potongan barcode di bagian atas, lis foto cokelat kayu bergerigi, dan maskot rusa petualang.',
        image_url: '/images/frames/12.1.png',
        features: ['Header Barcode Flight Boarding Pass', 'Bingkai Scallop Perangko Cokelat', 'Custom Date Badge 19 Juni 2026', 'Soft Blue Sky Background']
    },
    {
        id: 'frame-12-2',
        title: 'OSAKA FOREST SAFARI ADVENTURE',
        category: 'SAFARI NATURE',
        subtitle: 'Pemandangan Hutan Hijau, Sungai & Maskot Rusa',
        desc: 'Keindahan panorama alam terbuka dengan tebing hijau, aliran sungai jernih, kupu-kupu hinggap, dan lis foto perangko kayu bertema First Gathering Osaka 2026.',
        image_url: '/images/frames/12.2.png',
        features: ['Ilustrasi Hutan & Sungai Jernih', 'Bingkai Scallop Perangko Kayu', 'Maskot Rusa Petualang Cute', 'Palet Warna Hijau Alam Refreshing']
    },
    {
        id: 'frame-13-1',
        title: 'FAREWELL GIRL UP COQUETTE LOTUS',
        category: 'COQUETTE PASTEL',
        subtitle: 'Pita Satin Pink 3D, Lotus Watercolor & Logo UN Foundation',
        desc: 'Sentuhan feminin yang anggun dengan ikatan pita satin pink 3D, ukiran bunga lotus cat air, motif cutout bintang pastel, serta header resmi Farewell Girl Up Semarang.',
        image_url: '/images/frames/13.1.png',
        features: ['Aksen Pita Satin Pink 3D', 'Ilustrasi Bunga Lotus Watercolor', 'Header UN Foundation & BirvaKavia', 'Format Cutout Star Pattern']
    },
    {
        id: 'frame-13-2',
        title: 'GIRL UP COQUETTE PINK BOWS',
        category: 'COQUETTE SPECIAL',
        subtitle: 'Multi-Pita Satin 3D Pink & Header Farewell GirlUp',
        desc: 'Tema Coquette serba pink dengan beberapa hiasan pita satin 3D yang terpasang manis di tepi bingkai foto, berlatar ukiran bintang pastel yang lembut dan memesona.',
        image_url: '/images/frames/13.2.png',
        features: ['Tiga Aksen Pita Satin Pink 3D', 'Header Kaligrafi Farewell GirlUp', 'Latar Ukiran Bintang Pink Soft', 'Branding Handwritten Sebooth']
    },
    {
        id: 'frame-14-1',
        title: 'RETRO CASSETTE & DJ HEADPHONES',
        category: 'NEON MUSIC',
        subtitle: 'Stiker Kaset Fleetwood Mac, Headphone DJ & Pass Don Bosko',
        desc: 'Atmosfer studio musik vintage dengan stiker kaset pita Fleetwood Mac, headphone DJ studio hitam, marquee neon sign Music Corner 2026, dan tiket pass event Don Bosko.',
        image_url: '/images/frames/14.1.png',
        features: ['Stiker Kaset Audio Fleetwood Mac 3D', 'Headphone Studio DJ Black Realistis', 'Papan Lampu Marquee Neon 3D', 'Ticket Pass Don Bosko Event']
    },
    {
        id: 'frame-14-2',
        title: 'BLUE LOCKER MUSIC CORNER 2026',
        category: 'SCRAPBOOK SCHOOL',
        subtitle: 'Loker Sekolah Biru, Stiker Pensil Sketsa & Post-It',
        desc: 'Penggabungan konsep loker sekolah biru nostalgia dengan festival musik, dilengkapi memo post-it kuning, stiker pensil tangan, smiley face, dan logo Music Corner 2026.',
        image_url: '/images/frames/14.2.png',
        features: ['Tekstur Loker Sekolah Biru Vibrant', 'Stiker Pensil Sketsa & Smiley Face', 'Kertas Sticky Notes Post-It', 'Header Music Corner 2026 3D']
    }
];

interface FramesGalleryClientProps {
    initialFrames: FrameItem[];
}

export function FramesGalleryClient({ initialFrames }: FramesGalleryClientProps) {
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeLightboxFrame, setActiveLightboxFrame] = useState<FrameItem | null>(null);
    const [imageRatios, setImageRatios] = useState<Record<string, number>>({});

    const framesToDisplay = initialFrames && initialFrames.length > 0 ? initialFrames : DEFAULT_FRAMES;

    const handleImageLoad = useCallback((frameId: string, e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        if (img.naturalWidth && img.naturalHeight) {
            setImageRatios(prev => ({ ...prev, [frameId]: img.naturalWidth / img.naturalHeight }));
        }
    }, []);

    // Categories derived from frames
    const categories = ["All", ...Array.from(new Set(framesToDisplay.map(f => f.category || "General").filter(Boolean)))];

    // Filter frames
    const filteredFrames = framesToDisplay.filter((frame) => {
        const matchesSearch = frame.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (frame.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (frame.desc || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || (frame.category || "General") === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Check if query param ?id= exists to auto-open lightbox
    useEffect(() => {
        const id = searchParams.get("id");
        if (id) {
            const frame = framesToDisplay.find((f) => f.id === id);
            if (frame) {
                setActiveLightboxFrame(frame);
            }
        }
    }, [searchParams, framesToDisplay]);

    return (
        <div className="min-h-screen bg-transparent pt-20 pb-24">
            {/* Ambient Background Glows */}
            <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-40 right-1/4 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 max-w-6xl">
                {/* Back navigation */}
                <div className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 font-bold uppercase tracking-tight text-primary hover:text-text-dark transition-colors px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl"
                    >
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-16 text-center max-w-2xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-black font-sebooth uppercase tracking-tighter text-text-dark mb-4 leading-none">
                        Our Design Frames
                    </h1>
                    <p className="text-lg font-bold uppercase text-primary/70">
                        Koleksi template frame premium untuk melengkapi momen spesial Anda.
                    </p>
                </div>

                {/* Search & Category Filter Controls */}
                <div className="mb-12 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-sm">
                    {/* Categories Tabs */}
                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap",
                                    selectedCategory === cat
                                        ? "bg-primary text-white shadow-sm"
                                        : "bg-white/20 hover:bg-white/40 text-text-dark border border-white/30"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <div className="relative w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Cari desain frame..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 pl-10 rounded-xl bg-white/30 backdrop-blur-md border border-white/40 focus:border-primary/50 text-sm font-bold uppercase tracking-tight text-text-dark placeholder-text-dark/40 outline-none transition-all duration-200"
                        />
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-dark/40" />
                    </div>
                </div>

                {/* 3-Column Centered Grid */}
                {filteredFrames.length === 0 ? (
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-16 text-center max-w-md mx-auto">
                        <p className="text-lg font-bold uppercase text-text-dark/50">Tidak ada frame yang cocok.</p>
                        <button
                            onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                            className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-primary/95 transition-all"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center">
                        {filteredFrames.map((frame, idx) => (
                            <motion.div
                                key={frame.id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: Math.min(idx * 0.05, 0.3) }}
                                className="bg-white/12 backdrop-blur-lg border border-white/20 rounded-3xl p-5 shadow-[0_8px_32px_0_rgba(31,38,135,0.06)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:border-white/40 hover:bg-white/20 transition-all duration-300 group flex flex-col items-center"
                            >
                                {/* Shiny Overlay effect */}
                                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-3xl">
                                    <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 group-hover:animate-shimmer" />
                                </div>

                                {/* Frame Image Frame — dynamic aspect ratio */}
                                <div 
                                    className="w-full bg-neutral-900/5 rounded-2xl overflow-hidden flex items-center justify-center p-3 relative cursor-pointer group-hover:scale-[1.02] transition-transform duration-300"
                                    style={{ aspectRatio: imageRatios[frame.id] ? `${imageRatios[frame.id]}` : '3/4' }}
                                    onClick={() => setActiveLightboxFrame(frame)}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                                    {frame.image_url ? (
                                        <img
                                            src={frame.image_url}
                                            alt={frame.title}
                                            onLoad={(e) => handleImageLoad(frame.id, e)}
                                            className="h-full w-auto object-contain z-10 max-h-full drop-shadow-md select-none pointer-events-none"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-white/20 text-[#1A1A1A]/30 font-bold uppercase text-xs">
                                            No Image
                                        </div>
                                    )}
                                    
                                    {/* Glass Overlay Zoom Button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                                        <span className="p-3 bg-white/90 backdrop-blur-md rounded-full text-primary shadow-md hover:scale-105 transition-all">
                                            <ZoomIn className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Frame Info */}
                                <div className="w-full mt-4 text-center">
                                    <h3 className="text-xl font-black uppercase text-text-dark tracking-tight mb-1 truncate">
                                        {frame.title}
                                    </h3>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary px-3 py-1 bg-primary/10 rounded-full">
                                        {frame.category || "General"}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Interactive Lightbox Overlay */}
            <AnimatePresence>
                {activeLightboxFrame && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Close gesture click area */}
                        <div className="absolute inset-0" onClick={() => setActiveLightboxFrame(null)} />
                        
                        {/* Close button top right */}
                        <button
                            onClick={() => setActiveLightboxFrame(null)}
                            className="absolute top-6 right-6 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all active:scale-95 cursor-pointer"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Lightbox Content Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="relative z-10 bg-neutral-950 border border-white/15 p-6 md:p-8 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col items-center justify-between shadow-2xl overflow-y-auto"
                        >
                            {/* Shiny gloss backdrop inside */}
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                            {/* Title & Description details */}
                            <div className="w-full text-center mb-5">
                                <h2 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tight leading-tight mb-2 font-sebooth">
                                    {activeLightboxFrame.title}
                                </h2>
                                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                                    <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] px-3.5 py-1 bg-[#D4AF37]/15 rounded-full border border-[#D4AF37]/30 inline-block">
                                        {activeLightboxFrame.category || "General"}
                                    </span>
                                </div>
                                {activeLightboxFrame.subtitle && (
                                    <p className="text-xs md:text-sm font-semibold text-primary/90 tracking-wide mb-2">
                                        ✨ {activeLightboxFrame.subtitle}
                                    </p>
                                )}
                                {activeLightboxFrame.desc && (
                                    <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed max-w-lg mx-auto">
                                        {activeLightboxFrame.desc}
                                    </p>
                                )}
                            </div>

                            {/* Image Container with checked pattern background — dynamic aspect ratio */}
                            <div 
                                className="w-full flex-1 bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex items-center justify-center p-4 relative max-h-[45vh] my-2"
                                style={{ aspectRatio: imageRatios[activeLightboxFrame.id] ? `${imageRatios[activeLightboxFrame.id]}` : '3/4' }}
                            >
                                <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                                <img
                                    src={activeLightboxFrame.image_url}
                                    alt={activeLightboxFrame.title}
                                    className="h-full w-auto object-contain max-h-full drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] select-none"
                                />
                            </div>

                            {/* Features list if available */}
                            {activeLightboxFrame.features && activeLightboxFrame.features.length > 0 && (
                                <div className="w-full mt-4 flex flex-wrap gap-2 justify-center">
                                    {activeLightboxFrame.features.map((feat, fIdx) => (
                                        <span key={fIdx} className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
                                            ✓ {feat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="w-full mt-6 flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setActiveLightboxFrame(null)}
                                    className="flex-1 py-3 border border-white/20 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
                                >
                                    Tutup Preview
                                </button>
                                <a
                                    href={`https://wa.me/6285713899441?text=${encodeURIComponent(`Halo Sebooth, saya berminat dengan template frame "${activeLightboxFrame.title}" untuk acara saya!`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-3 bg-gradient-to-r from-[#FF5E00] to-[#FF3900] text-white font-extrabold uppercase tracking-wider text-xs rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg"
                                >
                                    Pesan Frame Ini Via WA
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

