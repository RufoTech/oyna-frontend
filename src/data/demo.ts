/**
 * DEMO / CONCEPT DATA ONLY.
 *
 * Every venue, price, tier, rating and review on this marketing site is
 * illustrative sample data so visitors can see how the app looks. Nothing
 * here is a real club, a real price, or live availability. The UI labels
 * each usage with a "Demo" badge. Replace this file with real content or
 * remove the demo sections when verified data is available.
 */

export interface DemoTier {
  id: string;
  title: string;
  pricePerHour: number;
  specs: string[];
  accessories: string[];
  tag?: string;
}

export interface DemoVenue {
  id: string;
  name: string;
  area: string;
  address: string;
  rating: number;
  reviewsCount: number;
  distance: string;
  openNow: boolean;
  hours: string;
  amenities: string[];
  tiers: DemoTier[];
}

export const demoVenues: DemoVenue[] = [
  {
    id: "demo-28may",
    name: "Nümunə Klub — 28 May",
    area: "28 May",
    address: "Nümunə küç., Bakı",
    rating: 4.8,
    reviewsCount: 124,
    distance: "350 m",
    openNow: true,
    hours: "Hər gün · 10:00 – 02:00",
    amenities: ["Wi-Fi", "Qəlyan zonası", "Mətbəx", "VIP zal", "Pult icarəsi"],
    tiers: [
      {
        id: "demo-std",
        title: "Standard",
        pricePerHour: 2,
        specs: ["RTX 4060", "144 Hz monitor", "16 GB RAM", "NVMe SSD"],
        accessories: ["Mexaniki klaviatura", "6400 DPI siçan", "Stereo qulaqlıq"],
      },
      {
        id: "demo-pro",
        title: "Pro",
        pricePerHour: 3.5,
        specs: ["RTX 4070", "240 Hz monitor", "32 GB RAM", "NVMe SSD"],
        accessories: ["Premium klaviatura", "Yüngül e-idman siçanı", "7.1 qulaqlıq"],
        tag: "Populyar",
      },
      {
        id: "demo-ps",
        title: "PlayStation 5",
        pricePerHour: 4,
        specs: ["PS5 konsolu", "55″ 4K ekran", "DualSense pult", "Rahat divan"],
        accessories: ["2-ci pult (əlavə)", "Şarj stansiyası"],
      },
    ],
  },
  {
    id: "demo-genclik",
    name: "Nümunə Arena — Gənclik",
    area: "Gənclik",
    address: "Nümunə pr., Bakı",
    rating: 4.9,
    reviewsCount: 98,
    distance: "1.2 km",
    openNow: true,
    hours: "24/7 — Həmişə açıqdır",
    amenities: ["Wi-Fi", "Turnir zalı", "Yayım otağı", "Kafe"],
    tiers: [
      {
        id: "demo-std-2",
        title: "Standard",
        pricePerHour: 2,
        specs: ["RTX 4060", "165 Hz monitor", "16 GB RAM", "NVMe SSD"],
        accessories: ["Mexaniki klaviatura", "Oyun siçanı", "Qulaqlıq"],
      },
      {
        id: "demo-bootcamp",
        title: "Bootcamp (5 PC)",
        pricePerHour: 12,
        specs: ["5 × RTX 4070", "240 Hz", "Komanda otağı", "Məşqçi dəstəyi"],
        accessories: ["Komanda qulaqlıqları", "Tədbir yayımı"],
        tag: "Komanda",
      },
    ],
  },
  {
    id: "demo-sahil",
    name: "Nümunə Lounge — Sahil",
    area: "Sahil",
    address: "Nümunə küç., Bakı",
    rating: 4.7,
    reviewsCount: 210,
    distance: "2.4 km",
    openNow: false,
    hours: "Hər gün · 12:00 – 00:00",
    amenities: ["Wi-Fi", "Lounge", "Karaoke", "Mətbəx"],
    tiers: [
      {
        id: "demo-ps-2",
        title: "PlayStation 5",
        pricePerHour: 5,
        specs: ["PS5 konsolu", "65″ 4K ekran", "2 × DualSense", "VIP lounge"],
        accessories: ["Şarj stansiyası", "İçki menyusu"],
      },
    ],
  },
];

export const demoReviews = [
  {
    author: "Demo istifadəçi",
    text: "Məkan təmiz, PC-lər sürətli idi. Rezervasiya sorğuma tez cavab gəldi.",
    rating: 5,
  },
  {
    author: "Demo istifadəçi",
    text: "Qiymətlər aydındır, gecə saatlarında sakit olur. Yenidən gedəcəyəm.",
    rating: 4,
  },
];
