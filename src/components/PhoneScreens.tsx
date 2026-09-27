import { demoVenues } from "../data/demo";

/* ------------------------------------------------------------------ */
/* Material-style glyphs (mirrors the Flutter app's Icons.* set)       */
/* ------------------------------------------------------------------ */

function Mi({
  d,
  size = 20,
  children,
}: {
  d?: string;
  size?: number;
  children?: React.ReactNode;
}) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      {d ? <path fill="currentColor" d={d} /> : children}
    </svg>
  );
}

const P = {
  search: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  map: "M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z",
  heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
  heartLine:
    "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z",
  person: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  personLine:
    "M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z",
  pin: "M12 2C8.13 2 5 5.13 5 8.5c0 5.25 7 13 7 13s7-7.75 7-13C19 5.13 15.87 2 12 2zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  back: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  cal: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z",
  clock:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  phone: "M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z",
  pc: "M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z",
  call: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  tag: "M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z",
  food: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97L6.5 22h3l-.25-9.03C11.36 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8h3V2c-2.76 0-5.5 2.24-5.5 4z",
  photos:
    "M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z",
  locate:
    "M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z",
  check: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  chevDown: "M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z",
  star: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
};

function GamepadGlyph({ size = 34 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <rect x="2" y="7.5" width="20" height="11" rx="5.5" fill="currentColor" opacity="0.9" />
      <rect x="6.2" y="11" width="4.6" height="1.7" rx="0.85" fill="#fff" opacity="0.9" />
      <rect x="7.7" y="9.5" width="1.7" height="4.6" rx="0.85" fill="#fff" opacity="0.9" />
      <circle cx="15.4" cy="11.4" r="1.15" fill="#fff" opacity="0.9" />
      <circle cx="17.8" cy="13.6" r="1.15" fill="#fff" opacity="0.9" />
    </svg>
  );
}

/** iOS status bar: 9:41 + signal / wifi / battery. */
function StatusBar({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`ios-status ${dark ? "on-dark" : ""}`} aria-hidden="true">
      <span className="ios-time">9:41</span>
      <span className="ios-icons">
        <svg viewBox="0 0 18 12" width="17" height="11">
          <rect x="0" y="7.5" width="3" height="4.5" rx="0.8" fill="currentColor" />
          <rect x="5" y="5" width="3" height="7" rx="0.8" fill="currentColor" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="0.8" fill="currentColor" />
          <rect x="15" y="0" width="3" height="12" rx="0.8" fill="currentColor" opacity="0.35" />
        </svg>
        <svg viewBox="0 0 16 12" width="15" height="11">
          <path
            fill="currentColor"
            d="M8 9.6a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2zM8 5.4c1.8 0 3.4.7 4.6 1.9l-1.5 1.5A4.4 4.4 0 0 0 8 7.8c-1.2 0-2.3.5-3.1 1.2L3.4 7.3A6.4 6.4 0 0 1 8 5.4zM8 1c2.9 0 5.6 1.2 7.6 3.1L14 5.6A8.4 8.4 0 0 0 8 3.2c-2.3 0-4.4.9-6 2.4L.4 4.1A10.4 10.4 0 0 1 8 1z"
            transform="translate(0 -1)"
          />
        </svg>
        <svg viewBox="0 0 25 12" width="24" height="11">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3.2" fill="none" stroke="currentColor" opacity="0.5" />
          <rect x="2.4" y="2.4" width="14" height="7.2" rx="1.8" fill="currentColor" />
          <rect x="22" y="3.8" width="2.4" height="4.4" rx="1.2" fill="currentColor" opacity="0.5" />
        </svg>
      </span>
    </div>
  );
}

function HomeIndicator({ dark = false }: { dark?: boolean }) {
  return (
    <div className="ios-home" aria-hidden="true">
      <span className={dark ? "on-dark" : ""} />
    </div>
  );
}

/** Pill bottom nav with the sliding black indicator (HomeBottomNavBar). */
function OynaNav({ active = 0 }: { active?: number }) {
  const items = [
    { icon: P.map, label: "Xəritə" },
    { icon: P.search, label: "Axtarış" },
    { icon: P.heartLine, label: "Seçilmiş" },
    { icon: P.personLine, label: "Profil" },
  ];
  return (
    <div className="oyna-nav" aria-hidden="true">
      <div className="oyna-nav-row">
        {items.map((it, i) => (
          <span key={it.label} className={`oyna-nav-item ${i === active ? "is-active" : ""}`}>
            {i === active && <span className="oyna-nav-pill" />}
            <Mi d={it.icon} size={21} />
            <em>{it.label}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared demo flow state                                              */
/* ------------------------------------------------------------------ */

export interface FlowState {
  tier: number;
  date: number;
  time: number;
  duration: number;
}

const FLOW_DATES = ["Bu gün, 26 sentyabr", "Sabah, 27 sentyabr", "28 sentyabr, bazar"];
const FLOW_TIMES = ["18:00", "20:30", "22:00"];

/* ------------------------------------------------------------------ */
/* 01 — Xəritə (HomeScreen: map + glass search + venue card + nav)      */
/* ------------------------------------------------------------------ */

export function ScreenMap() {
  const venue = demoVenues[0];
  const minPrice = venue.tiers[0]?.pricePerHour ?? 2;
  return (
    <div className="oscreen omap">
      <iframe
        className="omap-frame"
        title="Bizon E-Sports — xəritə"
        src="https://www.google.com/maps?q=40.3798619,49.8486359&z=15&output=embed"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        tabIndex={-1}
      />
      <div className="omap-pins" aria-hidden="true">
        <span className="opin" style={{ left: "22%", top: "34%" }} />
        <span className="opin" style={{ left: "68%", top: "28%" }} />
        <span className="opin" style={{ left: "60%", top: "52%" }} />
        <span className="opin hot" style={{ left: "42%", top: "44%" }} />
      </div>
      <div className="omap-top">
        <StatusBar />
        <div className="osearch">
          <Mi d={P.search} size={20} />
          <span>Məkanları axtar…</span>
        </div>
      </div>
      <div className="omap-bottom">
        <span className="olocate" aria-hidden="true">
          <Mi d={P.locate} size={20} />
        </span>
        <div className="ovenue-card">
          <span className="odrag" aria-hidden="true" />
          <div className="ovenue-row">
            <span className="ovenue-img" aria-hidden="true">
              <img src={venue.photo} alt="" loading="lazy" decoding="async" />
            </span>
            <div className="ovenue-info">
              <span className="ostatus">İNDİ AÇIQDIR</span>
              <strong>{venue.name}</strong>
              <small>
                <Mi d={P.pin} size={12} /> {venue.area} · {venue.distance}
              </small>
            </div>
          </div>
          <div className="ovenue-foot">
            <span className="oprice">
              {minPrice} AZN<small>/saat-dan</small>
            </span>
            <span className="obook">Rezerv et</span>
          </div>
        </div>
        <OynaNav active={0} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 — Məkan (VenueDetailScreen: hero + info card + quick actions)     */
/* ------------------------------------------------------------------ */

export function ScreenVenue() {
  const venue = demoVenues[0];
  const actions = [
    { icon: P.call, label: "Zəng et" },
    { icon: P.pin, label: "Ünvan" },
    { icon: P.tag, label: "Qiymət" },
    { icon: P.food, label: "Menyu" },
  ];
  return (
    <div className="oscreen ovenue">
      <div className="ohero">
        <img
          className="ohero-photo"
          src={venue.photo}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="ohero-status">
          <StatusBar dark />
        </div>
        <div className="ohero-top">
          <span className="ocircle-btn" aria-hidden="true">
            <Mi d={P.back} size={18} />
          </span>
          <span className="ocircle-btn fav" aria-hidden="true">
            <Mi d={P.heart} size={17} />
          </span>
        </div>
        <span className="ophotos" aria-hidden="true">
          <Mi d={P.photos} size={13} /> 1/8
        </span>
      </div>
      <div className="oinfo">
        <strong className="oinfo-title">{venue.name}</strong>
        <p className="oinfo-addr">
          <Mi d={P.pin} size={15} /> {venue.address}
        </p>
        <hr />
        <p className="oinfo-status">
          <span className="odot" aria-hidden="true" /> İndi açıqdır <span>· {venue.hours}</span>
        </p>
        <div className="oactions">
          {actions.map((a) => (
            <span key={a.label} className="oaction">
              <Mi d={a.icon} size={19} />
              <em>{a.label}</em>
            </span>
          ))}
        </div>
      </div>
      <div className="oabout">
        <strong>Haqqında</strong>
        <p>Yüksək səviyyəli PC-lər, VIP zal və 24/7 dəstək ilə Bakının mərkəzində oyun məkanı.</p>
        <div className="ochips">
          {venue.amenities.slice(0, 3).map((a) => (
            <span key={a}>{a}</span>
          ))}
        </div>
      </div>
      <div className="osticky">
        <span className="obook big">Rezerv et</span>
        <HomeIndicator />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 — Tier (tier selection cards with specs + hourly price)           */
/* ------------------------------------------------------------------ */

export function ScreenTier({
  flow,
  setFlow,
}: {
  flow: FlowState;
  setFlow: (f: FlowState) => void;
}) {
  const tiers = demoVenues[0].tiers;
  return (
    <div className="oscreen otier">
      <StatusBar />
      <div className="oappbar">
        <span className="ocircle-btn" aria-hidden="true">
          <Mi d={P.back} size={18} />
        </span>
        <strong>Tier Seçimi</strong>
        <span className="oappbar-sp" />
      </div>
      <div className="otier-list">
        {tiers.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`otier-card ${flow.tier === i ? "is-selected" : ""}`}
            onClick={() => setFlow({ ...flow, tier: i })}
            aria-pressed={flow.tier === i}
          >
            <span className="otier-ico" aria-hidden="true">
              <Mi d={P.pc} size={22} />
            </span>
            <span className="otier-mid">
              <strong>
                {t.title}
                {t.tag && <em className="otag">{t.tag}</em>}
              </strong>
              <small>{t.specs.slice(0, 3).join(" · ")}</small>
            </span>
            <span className="otier-price">
              {t.pricePerHour} AZN<small>/saat</small>
            </span>
          </button>
        ))}
      </div>
      <div className="osticky">
        <div className="ototal">
          <small>Seçilən tier</small>
          <strong>
            {tiers[flow.tier].title} — {tiers[flow.tier].pricePerHour} AZN/saat
          </strong>
        </div>
        <span className="obook big">Davam et</span>
        <HomeIndicator />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 — Rezervasiya (ReservationScreen flow, 1:1 structure)              */
/* ------------------------------------------------------------------ */

export function ScreenReservation({
  flow,
  setFlow,
}: {
  flow: FlowState;
  setFlow: (f: FlowState) => void;
}) {
  const venue = demoVenues[0];
  const tier = venue.tiers[flow.tier] ?? venue.tiers[0];
  const total = (tier.pricePerHour * flow.duration).toFixed(1).replace(".", ",");
  const cycle = (key: "date" | "time", len: number) =>
    setFlow({ ...flow, [key]: (flow[key] + 1) % len });

  return (
    <div className="oscreen ores">
      <StatusBar />
      <div className="oappbar">
        <span className="ocircle-btn" aria-hidden="true">
          <Mi d={P.back} size={18} />
        </span>
        <strong>Yerini rezerv et</strong>
        <span className="oappbar-sp" />
      </div>
      <div className="ores-scroll">
        <div className="ores-venue">
          <span className="ores-logo" aria-hidden="true">
            <GamepadGlyph size={28} />
          </span>
          <div>
            <strong>{venue.name}</strong>
            <small>
              <Mi d={P.pin} size={12} /> Bakı · {venue.distance}
            </small>
          </div>
        </div>

        <p className="ores-label">Tarix</p>
        <button type="button" className="ores-card" onClick={() => cycle("date", FLOW_DATES.length)}>
          <Mi d={P.cal} size={19} />
          <span>{FLOW_DATES[flow.date]}</span>
          <Mi d={P.chevDown} size={18} />
        </button>

        <div className="ores-duo">
          <div>
            <p className="ores-label">Vaxt</p>
            <button type="button" className="ores-card" onClick={() => cycle("time", FLOW_TIMES.length)}>
              <Mi d={P.clock} size={18} />
              <span>{FLOW_TIMES[flow.time]}</span>
            </button>
          </div>
          <div>
            <p className="ores-label">Müddət</p>
            <div className="ores-card step">
              <button
                type="button"
                aria-label="Müddəti azalt"
                onClick={() => setFlow({ ...flow, duration: Math.max(1, flow.duration - 1) })}
              >
                −
              </button>
              <span>{flow.duration} st</span>
              <button
                type="button"
                aria-label="Müddəti artır"
                onClick={() => setFlow({ ...flow, duration: Math.min(8, flow.duration + 1) })}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <p className="ores-label">Tier</p>
        <div className="ores-card tier-mini">
          <span className="otier-ico sm" aria-hidden="true">
            <Mi d={P.pc} size={19} />
          </span>
          <span className="otier-mid">
            <strong>{tier.title}</strong>
            <small>{tier.pricePerHour} AZN/saat</small>
          </span>
          <span className="ores-total">{total} AZN</span>
        </div>

        <p className="ores-label">Mobil nömrə</p>
        <div className="ores-card phone">
          <Mi d={P.phone} size={19} />
          <span className="oprefix">+994</span>
          <span className="onumber">50 123 45 67</span>
        </div>
        <p className="ores-valid">
          <Mi d={P.check} size={13} /> Nömrə düzgündür
        </p>

        <span className="obook big">Sorğunu göndər</span>
        <p className="ores-status">
          <span className="odot pulse" aria-hidden="true" /> Status: Gözləyir — klub təsdiqi gözlənilir
        </p>
        <HomeIndicator />
      </div>
    </div>
  );
}
