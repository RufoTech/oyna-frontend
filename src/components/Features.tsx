import { Reveal } from "./Reveal";

function IconMap() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="26" r="13" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="32" cy="26" r="4.5" fill="currentColor" />
      <path d="M14 52c5-9 11-13 18-13s13 4 18 13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconCompare() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="14" width="20" height="36" rx="5" fill="none" stroke="currentColor" strokeWidth="3" />
      <rect x="36" y="8" width="20" height="42" rx="5" fill="currentColor" opacity="0.9" />
      <path d="M13 24h10M13 31h10M41 20h10M41 27h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 24h10M13 31h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M32 18v14l10 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconStars() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 8l6.5 13.5 14.5 2-10.5 10 2.5 14.5-13-7-13 7 2.5-14.5-10.5-10 14.5-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="30" r="5" fill="currentColor" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 52S12 39 12 24c0-7 5-12 11.5-12 4 0 7 2.5 8.5 6 1.5-3.5 4.5-6 8.5-6C47 12 52 17 52 24c0 15-20 28-20 28z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconBell() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 8c-9 0-15 7-15 16v9l-6 8h42l-6-8v-9c0-9-6-16-15-16z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="50" r="4" fill="currentColor" />
    </svg>
  );
}

const features = [
  {
    icon: <IconMap />,
    title: "Yaxınlıqdakıları kəşf et",
    copy: "Xəritədə ən yaxın klubları gör, məsafəyə və reytinqə görə sırala.",
    size: "large",
  },
  {
    icon: <IconCompare />,
    title: "Qiymət və təchizatı müqayisə et",
    copy: "Tier-lərin hardware-ı, aksesuarları və saatlıq qiyməti yan-yana.",
    size: "large",
  },
  {
    icon: <IconClock />,
    title: "İş saatı, ünvan, qalereya",
    copy: "Getməzdən əvvəl məkan haqqında hər detalı yoxla.",
    size: "small",
  },
  {
    icon: <IconStars />,
    title: "Rəy və reytinqlər",
    copy: "Həqiqi ziyarətçilərin təcrübəsini oxu, öz rəyini yaz.",
    size: "small",
  },
  {
    icon: <IconHeart />,
    title: "Seçilmişlər",
    copy: "Bəyəndiyin məkanları ürəklə saxla, bir toxunuşla qayıt.",
    size: "small",
  },
  {
    icon: <IconBell />,
    title: "Sorğu statusunu izlə",
    copy: "“Gözləyir”, “Qəbul edildi” və ya “Ləğv edildi” — hamısı profildə.",
    size: "small",
  },
];

export function Features() {
  return (
    <section className="section features" id="imkanlar" aria-labelledby="features-title">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">İmkanlar</p>
          <h2 className="display features-title" id="features-title">
            Oyun axşamı üçün lazım olan hər şey
          </h2>
        </Reveal>
        <div className="features-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 90} className={`feature-wrap ${f.size}`}>
              <article className="feature">
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
