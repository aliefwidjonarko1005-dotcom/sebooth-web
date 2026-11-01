export type PackageType = "all-you-can" | "batch-booking";

export interface DetailedPackage {
  id: string;
  name: string;
  category: PackageType;
  durationOrQuota: string;
  price: string;
  badge?: string;
  features: string[];
  waText: string;
}

export const DETAILED_PACKAGES: Record<PackageType, DetailedPackage[]> = {
  "all-you-can": [
    {
      id: "ayc-1",
      name: "Unlimited 2 Jam",
      category: "all-you-can",
      durationOrQuota: "2 Jam Non-stop",
      price: "",
      badge: "POPULER",
      features: [
        "Cetak Instan Sepuasnya Selama 2 Jam",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design & Branding",
        "2 Crew Staff Professional On-Site",
        "Fun Funky Props Box & Accessories",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 2 Jam nih!",
    },
    {
      id: "ayc-2",
      name: "Unlimited 3 Jam",
      category: "all-you-can",
      durationOrQuota: "3 Jam Non-stop",
      price: "",
      badge: "PALING LAKU",
      features: [
        "Cetak Sepuasnya 3 Jam Penuh",
        "Softfile HD, GIF & Live QR Download",
        "Custom Frame Branding + Free Backdrop",
        "2 Crew Staff On-Site Full Support",
        "Fun Props Box & Premium Lighting",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 3 Jam nih!",
    },
    {
      id: "ayc-3",
      name: "Unlimited 5 Jam",
      category: "all-you-can",
      durationOrQuota: "5 Jam Penuh Event",
      price: "",
      badge: "VIP ULTIMATE",
      features: [
        "Cetak Sepuasnya Full 5 Jam Acara",
        "Full HD Softfile, GIF & Boomerang",
        "Exclusive Custom Frame & Custom Backdrop",
        "VIP Dedicated Crew & Priority Queue",
        "Complete Props Collection",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket All You Can Photo - Unlimited 5 Jam nih!",
    },
    {
      id: "ayc-4",
      name: "Custom Durasi",
      category: "all-you-can",
      durationOrQuota: "Custom / Full Day",
      price: "",
      badge: "VIP CUSTOM",
      features: [
        "Cetak Sepuasnya Full Day / Multi-Day",
        "Full HD Softfile, GIF & Boomerang",
        "Exclusive Custom Frame & Custom Backdrop",
        "VIP Dedicated Staff & Priority Queue",
        "Complete Props Collection",
      ],
      waText: "Halo Sebooth, saya mau konsultasi paket All You Can Photo durasi custom / full day untuk acara saya nih!",
    },
  ],
  "batch-booking": [
    {
      id: "batch-1",
      name: "100 Prints",
      category: "batch-booking",
      durationOrQuota: "100 Lembar",
      price: "",
      badge: "PALING HEMAT",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 100 Prints nih!",
    },
    {
      id: "batch-2",
      name: "200 Prints",
      category: "batch-booking",
      durationOrQuota: "200 Lembar",
      price: "",
      badge: "REKOMENDASI",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 200 Prints nih!",
    },
    {
      id: "batch-3",
      name: "300 Prints",
      category: "batch-booking",
      durationOrQuota: "300 Lembar",
      price: "",
      badge: "POPULER",
      features: [
        "Cetak Instan Photostrip",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau tanya & pesan Paket Batch Booking - 300 Prints nih!",
    },
    {
      id: "batch-4",
      name: "> 300 Prints",
      category: "batch-booking",
      durationOrQuota: "Custom >300 Lembar",
      price: "",
      badge: "EVENT AKBAR",
      features: [
        "Cetak Instan Photostrip Custom Sesuai Kebutuhan",
        "Softfile Unlimited via Instant Live QR",
        "Free Custom Frame Design Event",
        "Crew On-Site & Fun Props Box",
      ],
      waText: "Halo Sebooth, saya mau konsultasi kuota lebih dari 300 prints untuk event saya nih!",
    },

  ],
};

export const waBase = "https://wa.me/6285713899441?text=";
