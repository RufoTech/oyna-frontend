import { Reveal } from "./Reveal";
import { demoVenues } from "../data/demo";
import { BakuMap } from "./BakuMap";

function VenueVisual() {
  const venue = demoVenues[0];
  return (
    <div className="story-visual venue-visual">
      <span className="demo-tag">Bakı klubu · demo qiymətlər</span>
      <div className="vv-gallery" aria-hidden="true">
        <div className="vv-photo main">
          <img src={venue.galleryPhotos[0]} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="vv-photo">
          <img src={venue.galleryPhotos[1]} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="vv-photo">
          <img src={venue.galleryPhotos[2]} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
      <div className="vv-body">
        <div className="vv-head">
          <div>
            <strong>{venue.name}</strong>
            <small>
              ★ {venue.rating} · {venue.reviewsCount} rəy · {venue.distance}
            </small>
          </div>
          <span className="vv-open">İndi açıqdır</span>
        </div>
        <p className="vv-meta">
          {venue.address} · {venue.hours}
        </p>
        <div className="vv-chips">
          {venue.amenities.map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TierVisual() {
  const tiers = demoVenues[0].tiers;
  return (
    <div className="story-visual tier-visual">
      <span className="demo-tag">Demo qiymətlər</span>
      <ul>
        {tiers.map((t) => (
          <li key={t.id} className={t.tag ? "hot" : ""}>
            <div className="tv-head">
              <strong>{t.title}</strong>
              {t.tag && <span className="tv-tag">{t.tag}</span>}
              <span className="tv-price">
                {t.pricePerHour} AZN<small>/saat</small>
              </span>
            </div>
            <p>{t.specs.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReservationVisual() {
  return (
    <div className="story-visual res-visual">
      <span className="demo-tag dark">Demo sorğu</span>
      <div className="rv-grid">
        <div className="rv-block">
          <small>Tarix</small>
          <div className="rv-pills">
            <span>26</span>
            <span className="on">27</span>
            <span>28</span>
            <span>29</span>
          </div>
        </div>
        <div className="rv-block">
          <small>Vaxt</small>
          <div className="rv-pills">
            <span>18:00</span>
            <span className="on">20:30</span>
            <span>22:00</span>
          </div>
        </div>
        <div className="rv-block">
          <small>Müddət</small>
          <div className="rv-duration">
            <span>−</span>
            <strong>3 saat</strong>
            <span>+</span>
          </div>
        </div>
        <div className="rv-block">
          <small>Tier</small>
          <div className="rv-tier">
            <strong>Pro</strong>
            <span>3.5 AZN/saat</span>
          </div>
        </div>
      </div>
      <div className="rv-status">
        <span className="rv-pulse" aria-hidden="true" />
        Status: Gözləyir
      </div>
    </div>
  );
}

const stages = [
  {
    no: "01",
    title: "Məkanı kəşf et",
    copy: "Bakı xəritəsində yaxınlıqdakı internet və PlayStation klublarına bax. Axtar, sırala, sənə uyğun məkanı saniyələr içində tap.",
    visual: <BakuMap />,
  },
  {
    no: "02",
    title: "Sənə uyğun məkanı seç",
    copy: "Ünvan, iş saatı, fotolar, xidmətlər, qiymət cədvəli, rəy və reytinqlər — qərar üçün lazım olan hər şey məkan səhifəsindədir.",
    visual: <VenueVisual />,
  },
  {
    no: "03",
    title: "Təchizatı müqayisə et",
    copy: "PC tier-lərinin hardware-ını, aksesuarlarını və saatlıq AZN qiymətlərini yan-yana qoy. Nəyə görə ödədiyini dəqiq bil.",
    visual: <TierVisual />,
  },
  {
    no: "04",
    title: "Rezervasiya sorğusu göndər",
    copy: "Tarix, vaxt, müddət və tier seç, sorğunu göndər. Statusu — o cümlədən “Gözləyir” mərhələsini — tətbiqdən izlə.",
    visual: <ReservationVisual />,
  },
];

export function Story() {
  return (
    <section className="section story" id="kesfet" aria-labelledby="story-title">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">Kəşfdən rezervasiyaya</p>
          <h2 className="display story-title" id="story-title">
            Dörd addımda oyun axşamın hazırdır
          </h2>
        </Reveal>
        <div className="story-stages">
          {stages.map((s, i) => (
            <Reveal key={s.no} delay={0} className="story-stage-wrap">
              <article className={`story-stage ${i % 2 ? "flip" : ""}`}>
                <div className="story-text">
                  <span className="story-no" aria-hidden="true">
                    {s.no}
                  </span>
                  <h3 className="display">{s.title}</h3>
                  <p className="lead">{s.copy}</p>
                </div>
                {s.visual}
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
