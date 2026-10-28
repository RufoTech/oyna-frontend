import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Reveal } from "./Reveal";

const slides = [
  {
    id: "canli-status",
    label: "Canlı status",
    blurb: "Klubun hazırkı doluluğunu və növbəni bir baxışda gör.",
    jpg: "/gallery/01_canli_status.jpg",
    webp: "/gallery/01_canli_status@2x.webp",
  },
  {
    id: "yaxin-klublar",
    label: "Yaxın klublar",
    blurb: "Ətrafındakı yerləri məsafə və reytinqə görə araşdır.",
    jpg: "/gallery/02_yaxin_klublar.jpg",
    webp: "/gallery/02_yaxin_klublar@2x.webp",
  },
  {
    id: "rezervasiya",
    label: "Rezervasiya",
    blurb: "Tarix, saat və tier seç — sorğunu bir toxunuşla göndər.",
    jpg: "/gallery/03_rezervasiya.jpg",
    webp: "/gallery/03_rezervasiya@2x.webp",
  },
  {
    id: "tesdiq-kod",
    label: "Təsdiq kodu",
    blurb: "Qəbul edilən rezerv üçün unikal kodu kluba göstər.",
    jpg: "/gallery/04_tesdiq_kod.jpg",
    webp: "/gallery/04_tesdiq_kod@2x.webp",
  },
  {
    id: "rezervler",
    label: "Rezervlər",
    blurb: "Gələcək və keçmiş rezervlərini bir yerdə izlə.",
    jpg: "/gallery/05_rezervler.jpg",
    webp: "/gallery/05_rezervler@2x.webp",
  },
  {
    id: "gozleme-sec-oyna",
    label: "Gözləmə / Seç / Oyna",
    blurb: "Növbədə ol, yerini seç və oyuna keç.",
    jpg: "/gallery/06_gozleme_sec_oyna.jpg",
    webp: "/gallery/06_gozleme_sec_oyna@2x.webp",
  },
] as const;

const IMG_W = 900;
const IMG_H = 1600;

function GalleryPhone({
  jpg,
  webp,
  label,
  priority,
}: {
  jpg: string;
  webp: string;
  label: string;
  priority?: boolean;
}) {
  return (
    <div className="gallery-phone" aria-hidden="false">
      <span className="gallery-phone-btn action" aria-hidden="true" />
      <span className="gallery-phone-btn vol-up" aria-hidden="true" />
      <span className="gallery-phone-btn vol-down" aria-hidden="true" />
      <span className="gallery-phone-btn power" aria-hidden="true" />
      <div className="gallery-phone-bezel">
        <div className="gallery-phone-island" aria-hidden="true">
          <span className="gallery-phone-cam" />
        </div>
        <div className="gallery-phone-screen">
          <picture>
            <source type="image/webp" srcSet={`${webp} 2x`} />
            <img
              src={jpg}
              alt={label}
              width={IMG_W}
              height={IMG_H}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
            />
          </picture>
        </div>
      </div>
    </div>
  );
}

export function AppGallery() {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const baseId = useId();

  const scrollToIndex = useCallback((index: number) => {
    const el = cardRefs.current[index];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setActive(index);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      const next = (active + dir + slides.length) % slides.length;
      scrollToIndex(next);
    },
    [active, scrollToIndex],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateActive = () => {
      const mid = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const center = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    };

    track.addEventListener("scroll", updateActive, { passive: true });
    return () => track.removeEventListener("scroll", updateActive);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "Home") {
      e.preventDefault();
      scrollToIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      scrollToIndex(slides.length - 1);
    }
  };

  return (
    <section
      className="section gallery dark-zone"
      id="qalereya"
      aria-labelledby={`${baseId}-title`}
    >
      <div className="wrap">
        <Reveal>
          <div className="gallery-intro">
            <p className="eyebrow">Qalereya</p>
            <h2 className="display gallery-title" id={`${baseId}-title`}>
              Tətbiqdən görüntülər
            </h2>
            <p className="lead gallery-lead">
              Play Store ekranlarından — canlı statusdan rezervə qədər əsl Oyna axını.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div
            className="gallery-stage"
            role="region"
            aria-roledescription="carousel"
            aria-label="Tətbiq ekranları qalereyası"
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            <div className="gallery-track" ref={trackRef}>
              {slides.map((slide, i) => (
                <figure
                  key={slide.id}
                  ref={(node) => {
                    cardRefs.current[i] = node;
                  }}
                  className={`gallery-card ${active === i ? "is-active" : ""}`}
                  aria-current={active === i ? "true" : undefined}
                >
                  <GalleryPhone
                    jpg={slide.jpg}
                    webp={slide.webp}
                    label={slide.label}
                    priority={i === 0}
                  />
                  <figcaption className="gallery-caption">
                    <span className="gallery-caption-no" aria-hidden="true">
                      0{i + 1}
                    </span>
                    <strong>{slide.label}</strong>
                    <span className="gallery-caption-blurb">{slide.blurb}</span>
                  </figcaption>
                </figure>
              ))}
            </div>

            <div className="gallery-controls">
              <button type="button" onClick={() => go(-1)} aria-label="Əvvəlki ekran">
                ←
              </button>
              <div className="gallery-dots" role="tablist" aria-label="Qalereya slaydları">
                {slides.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={active === i}
                    aria-label={`${slide.label} — slayd ${i + 1}`}
                    className={active === i ? "on" : ""}
                    onClick={() => scrollToIndex(i)}
                  />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Növbəti ekran">
                →
              </button>
            </div>

            <p className="gallery-live" aria-live="polite">
              {slides[active].label}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
