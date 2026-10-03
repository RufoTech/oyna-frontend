import { useEffect, useState } from "react";
import { useScrolled } from "../hooks";

const links = [
  { href: "#kesfet", label: "Kəşf et" },
  { href: "#nasil-calisir", label: "Tətbiq necə işləyir" },
  { href: "#imkanlar", label: "İmkanlar" },
  { href: "#treyler", label: "Treyler" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const scrolled = useScrolled(32);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open ]);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "menu-open" : ""}`}>
      <div className="wrap header-inner">
        <a href="#top" className="brand" aria-label="Oyna — ana səhifə">
          <img
            src={scrolled || open ? "/logo.png" : "/logo-white.png"}
            alt="Oyna loqosu"
            width={34}
            height={34}
          />
          <span className="brand-word">Oyna</span>
        </a>

        <nav className="desktop-nav" aria-label="Əsas naviqasiya">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <a href="#yukle" className="btn btn-solid btn-sm header-cta">
            Tətbiqi yüklə
          </a>
          <button
            type="button"
            className="menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Menyunu bağla" : "Menyunu aç"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true" className="menu-icon">
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" className={`mobile-menu ${open ? "is-open" : ""}`} hidden={!open}>
        <nav aria-label="Mobil naviqasiya">
          {links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              className="mobile-link"
              style={{ transitionDelay: `${i * 40}ms` }}
              onClick={() => setOpen(false)}
            >
              <span>{l.label}</span>
              <span aria-hidden="true">→</span>
            </a>
          ))}
          <a href="#yukle" className="btn btn-solid mobile-cta" onClick={() => setOpen(false)}>
            Tətbiqi yüklə
          </a>
        </nav>
      </div>
    </header>
  );
}
