import { GalleryPhone } from '../components/GalleryPhone'
import { gallerySlides } from '../data/gallerySlides'

export function GalleryPage() {
  return (
    <div className="gallery-page dark-zone">
      <header className="legal-topbar gallery-page-topbar">
        <div className="wrap legal-topbar-inner">
          <a href="/" className="legal-brand" aria-label="Oyna — ana səhifə">
            <img src="/logo-white.png" alt="Oyna loqosu" width={32} height={32} />
            <span className="legal-brand-word">Oyna</span>
          </a>
          <a href="/" className="legal-back">
            Ana səhifə
          </a>
        </div>
      </header>

      <main className="wrap gallery-page-main">
        <header className="gallery-page-intro">
          <p className="eyebrow">Qalereya</p>
          <h1 className="display gallery-page-title">Tətbiqdən görüntülər</h1>
          <p className="lead gallery-page-lead">
            Play Store ekranlarından — canlı statusdan rezervə qədər əsl Oyna axını.
            Daha çox görüntü tezliklə əlavə olunacaq.
          </p>
        </header>

        <ul className="gallery-page-grid" aria-label="Tətbiq ekranları">
          {gallerySlides.map((slide, i) => (
            <li key={slide.id}>
              <figure className="gallery-page-card">
                <GalleryPhone
                  jpg={slide.jpg}
                  webp={slide.webp}
                  label={slide.label}
                  priority={i < 3}
                />
                <figcaption className="gallery-caption">
                  <span className="gallery-caption-no" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <strong>{slide.label}</strong>
                  <span className="gallery-caption-blurb">{slide.blurb}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </main>

      <footer className="gallery-page-footer">
        <div className="wrap gallery-page-footer-inner">
          <a href="/" className="legal-back">
            ← Ana səhifə
          </a>
          <a href="/#yukle" className="btn btn-solid btn-sm">
            Tətbiqi yüklə
          </a>
        </div>
      </footer>
    </div>
  )
}
