import { FaApple } from "react-icons/fa";
import { SiGoogleplay } from "react-icons/si";
import { Reveal } from "./Reveal";
import { siteConfig } from "../config";

function AppleIcon() {
  return <FaApple aria-hidden="true" size={24} />;
}

function PlayIcon() {
  return (
    <span className="play-badge" aria-hidden="true">
      <SiGoogleplay size={20} />
    </span>
  );
}

export function Download() {
  const { appStoreUrl, googlePlayUrl } = siteConfig;
  const soon = !appStoreUrl || !googlePlayUrl;

  const stores = [
    {
      name: "App Store",
      detail: "iOS üçün yüklə",
      icon: <AppleIcon />,
      url: appStoreUrl,
    },
    {
      name: "Google Play",
      detail: "Android üçün yüklə",
      icon: <PlayIcon />,
      url: googlePlayUrl,
    },
  ];

  return (
    <section className="section download dark-zone" id="yukle" aria-labelledby="download-title">
      <div className="wrap download-grid">
        <Reveal>
          <img src="/logo-white.png" alt="Oyna loqosu" width={88} height={88} className="download-logo" />
          <h2 className="display download-title" id="download-title">
            Oyuna hazırsan?
          </h2>
          <p className="lead">
            Oyna ilə yaxınlıqdakı klubları kəşf et, təchizatı müqayisə et,
            yerini indi sorğu ilə tut.
          </p>
          <div className="store-row">
            {stores.map((s) =>
              s.url ? (
                <a key={s.name} href={s.url} className="store-btn" rel="noopener">
                  {s.icon}
                  <span>
                    <small>{s.detail}</small>
                    <strong>{s.name}</strong>
                  </span>
                </a>
              ) : (
                <span key={s.name} className="store-btn is-soon">
                  {s.icon}
                  <span>
                    <small>{s.detail}</small>
                    <strong>
                      {s.name} <em>Tezliklə</em>
                    </strong>
                  </span>
                </span>
              ),
            )}
          </div>
          {soon && (
            <p className="store-note">
              Rəsmi mağaza linkləri təsdiqlənən kimi burada aktivləşəcək.
            </p>
          )}
        </Reveal>
        <Reveal delay={140} className="reveal-scale">
          <aside className="download-card" aria-label="Başlamazdan əvvəl bil">
            <h3>Başlamazdan əvvəl</h3>
            <ul>
              <li>
                <strong>1.</strong> Tətbiqi yüklə və hesab yarat.
              </li>
              <li>
                <strong>2.</strong> Xəritədə sənə yaxın klubu seç.
              </li>
              <li>
                <strong>3.</strong> Tier və saatı seçib sorğu göndər.
              </li>
              <li>
                <strong>4.</strong> Statusu “Rezervasiyalarım”da izlə.
              </li>
            </ul>
            <p className="download-hint">
              Sorğu təsdiqi klubdan asılıdır — tətbiq hər sorğuya ani zəmanət vermir.
            </p>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
