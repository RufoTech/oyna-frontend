/**
 * Marketing-site venue previews: real Baku club names, addresses, ratings and
 * photos (see /public/venues and scripts/fetch-all-venue-photos.mjs). Tier
 * prices and review text remain illustrative until live app data is wired in.
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
  photo: string;
  galleryPhotos: string[];
  tiers: DemoTier[];
}

export const demoVenues: DemoVenue[] = [
  {
    id: "bizon-esports",
    name: "Bizon E-Sports",
    area: "28 May",
    address: "28 May, Vağzal meydanı",
    rating: 4.7,
    reviewsCount: 124,
    distance: "350 m",
    openNow: true,
    hours: "Hər gün · 10:00 – 02:00",
    amenities: ["Wi-Fi", "Turnir zonası", "E-sport PC", "VIP zal", "Pult icarəsi"],
    photo: "/venues/bizon-esports.jpg",
    galleryPhotos: [
      "/venues/bizon-esports.jpg",
      "/venues/cybernet.jpg",
      "/venues/dark-game.jpg",
    ],
    tiers: [
      {
        id: "bizon-std",
        title: "Standard",
        pricePerHour: 2,
        specs: ["RTX 4060", "144 Hz monitor", "16 GB RAM", "NVMe SSD"],
        accessories: ["Mexaniki klaviatura", "6400 DPI siçan", "Stereo qulaqlıq"],
      },
      {
        id: "bizon-pro",
        title: "Pro",
        pricePerHour: 3.5,
        specs: ["RTX 4070", "240 Hz monitor", "32 GB RAM", "NVMe SSD"],
        accessories: ["Premium klaviatura", "Yüngül e-idman siçanı", "7.1 qulaqlıq"],
        tag: "Populyar",
      },
      {
        id: "bizon-ps",
        title: "PlayStation 5",
        pricePerHour: 4,
        specs: ["PS5 konsolu", "55″ 4K ekran", "DualSense pult", "Rahat divan"],
        accessories: ["2-ci pult (əlavə)", "Şarj stansiyası"],
      },
    ],
  },
  {
    id: "extra-club",
    name: "Extra Club Baku",
    area: "Dərnəgül",
    address: "Əhməd Rəcəbli küç., Dərnəgül",
    rating: 4.3,
    reviewsCount: 98,
    distance: "1.2 km",
    openNow: true,
    hours: "24/7 — Həmişə açıqdır",
    amenities: ["Wi-Fi", "Turnir zalı", "Yayım otağı", "Kafe"],
    photo: "/venues/extra-club.jpg",
    galleryPhotos: [
      "/venues/extra-club.jpg",
      "/venues/gamezone-baku.jpg",
      "/venues/mundial.jpg",
    ],
    tiers: [
      {
        id: "extra-std",
        title: "Standard",
        pricePerHour: 2,
        specs: ["RTX 4060", "165 Hz monitor", "16 GB RAM", "NVMe SSD"],
        accessories: ["Mexaniki klaviatura", "Oyun siçanı", "Qulaqlıq"],
      },
      {
        id: "extra-bootcamp",
        title: "Bootcamp (5 PC)",
        pricePerHour: 12,
        specs: ["5 × RTX 4070", "240 Hz", "Komanda otağı", "Məşqçi dəstəyi"],
        accessories: ["Komanda qulaqlıqları", "Tədbir yayımı"],
        tag: "Komanda",
      },
    ],
  },
  {
    id: "fairplay",
    name: "Fairplay",
    area: "Səbail",
    address: "Yusif Məmmədəliyev küç., Səbail",
    rating: 4.4,
    reviewsCount: 210,
    distance: "2.4 km",
    openNow: false,
    hours: "Hər gün · 12:00 – 00:00",
    amenities: ["Wi-Fi", "Lounge", "Kafe", "Mətbəx"],
    photo: "/venues/fairplay.jpg",
    galleryPhotos: [
      "/venues/fairplay.jpg",
      "/venues/for-gamer.jpg",
      "/venues/qarabag-ps.jpg",
    ],
    tiers: [
      {
        id: "fairplay-ps",
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
    author: "Rəşad M.",
    text: "Məkan təmiz, PC-lər sürətli idi. Rezervasiya sorğuma tez cavab gəldi.",
    rating: 5,
  },
  {
    author: "Ləman K.",
    text: "Qiymətlər aydındır, gecə saatlarında sakit olur. Yenidən gedəcəyəm.",
    rating: 4,
  },
];
