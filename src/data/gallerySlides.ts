export type GallerySlide = {
  id: string
  label: string
  blurb: string
  jpg: string
  webp: string
}

/** App screenshots shown on /gallery. Append new entries to grow the grid. */
export const gallerySlides: GallerySlide[] = [
  {
    id: 'canli-status',
    label: 'Canlı status',
    blurb: 'Klubun hazırkı doluluğunu və növbəni bir baxışda gör.',
    jpg: '/gallery/01_canli_status.jpg',
    webp: '/gallery/01_canli_status@2x.webp',
  },
  {
    id: 'yaxin-klublar',
    label: 'Yaxın klublar',
    blurb: 'Ətrafındakı yerləri məsafə və reytinqə görə araşdır.',
    jpg: '/gallery/02_yaxin_klublar.jpg',
    webp: '/gallery/02_yaxin_klublar@2x.webp',
  },
  {
    id: 'rezervasiya',
    label: 'Rezervasiya',
    blurb: 'Tarix, saat və tier seç — sorğunu bir toxunuşla göndər.',
    jpg: '/gallery/03_rezervasiya.jpg',
    webp: '/gallery/03_rezervasiya@2x.webp',
  },
  {
    id: 'tesdiq-kod',
    label: 'Təsdiq kodu',
    blurb: 'Qəbul edilən rezerv üçün unikal kodu kluba göstər.',
    jpg: '/gallery/04_tesdiq_kod.jpg',
    webp: '/gallery/04_tesdiq_kod@2x.webp',
  },
  {
    id: 'rezervler',
    label: 'Rezervlər',
    blurb: 'Gələcək və keçmiş rezervlərini bir yerdə izlə.',
    jpg: '/gallery/05_rezervler.jpg',
    webp: '/gallery/05_rezervler@2x.webp',
  },
  {
    id: 'gozleme-sec-oyna',
    label: 'Gözləmə / Seç / Oyna',
    blurb: 'Növbədə ol, yerini seç və oyuna keç.',
    jpg: '/gallery/06_gozleme_sec_oyna.jpg',
    webp: '/gallery/06_gozleme_sec_oyna@2x.webp',
  },
]
