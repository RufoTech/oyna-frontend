import { siteConfig } from "../config";

const pageLinks = [
  { href: "#kesfet", label: "Kəşf et" },
  { href: "#nasil-calisir", label: "Tətbiq necə işləyir" },
  { href: "#imkanlar", label: "İmkanlar" },
  { href: "#rezervasiya", label: "Rezervasiya" },
  { href: "#faq", label: "FAQ" },
  { href: "#yukle", label: "Tətbiqi yüklə" },
];

export function Footer() {
  const { appStoreUrl, googlePlayUrl, supportEmail } = siteConfig;

  return (
    <footer className="footer dark-zone">
      <div className="wrap">
        <div className="footer-top">
          <a href="#top" className="brand" aria-label="Oyna — yuxarı qayıt">
            <img src="/logo-white.png" alt="Oyna loqosu" width={36} height={36} />
            <span className="brand-word">Oyna</span>
          </a>
          <p className="footer-tag">
            Bakıdakı oyun klublarını kəşf et, müqayisə et, rezervasiya sorğusu göndər.
          </p>
        </div>

        <div className="footer-cols">
          <nav aria-label="Səhifə keçidləri">
            <h3>Səhifə</h3>
            <ul>
              {pageLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3>Tətbiq</h3>
            <ul>
              <li>
                {appStoreUrl ? (
                  <a href={appStoreUrl} rel="noopener">
                    App Store
                  </a>
                ) : (
                  <span className="soon-link">
                    App Store <em>tezliklə</em>
                  </span>
                )}
              </li>
              <li>
                {googlePlayUrl ? (
                  <a href={googlePlayUrl} rel="noopener">
                    Google Play
                  </a>
                ) : (
                  <span className="soon-link">
                    Google Play <em>tezliklə</em>
                  </span>
                )}
              </li>
            </ul>
          </div>
          <div>
            <h3>Əlaqə</h3>
            <ul>
              <li>
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
              </li>
            </ul>
          </div>
        </div>

        <p className="footer-demo">
          Saytdakı məkan adları, qiymətlər, reytinqlər və ekranlar nümayiş
          məqsədli demo məlumatlardır.
        </p>
        <div className="footer-bottom">
          <small>© 2026 Oyna. Bütün hüquqlar qorunur.</small>
          <a href="#top" className="to-top">
            Yuxarı ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
