import { Fragment, useEffect, useState, type ReactNode } from "react";
import { siteConfig } from "../config";
import { privacyText, type Block, type Lang } from "./privacyContent";

const LANGS: Lang[] = ["az", "en", "ru"];

function readLang(): Lang {
  const q = new URLSearchParams(window.location.search).get("lang");
  return q === "en" || q === "ru" ? q : "az";
}

function langHref(lang: Lang) {
  return lang === "az" ? "/privacy" : `/privacy?lang=${lang}`;
}

/** Renders **bold**, {email} and [text](url) inline markup. */
function inline(text: string, email: string): ReactNode[] {
  const re = /\*\*(.+?)\*\*|\{email\}|\[([^\]]+)\]\(([^)]+)\)/g;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{inline(m[1], email)}</strong>);
    else if (m[2] !== undefined)
      out.push(
        <a key={k++} href={m[3]} rel="noopener noreferrer">
          {m[2]}
        </a>,
      );
    else
      out.push(
        <a key={k++} href={`mailto:${email}`}>
          <strong>{email}</strong>
        </a>,
      );
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderBlock(b: Block, i: number, email: string) {
  if ("h2" in b) return <h2 key={i}>{b.h2}</h2>;
  if ("h3" in b) return <h3 key={i}>{b.h3}</h3>;
  if ("p" in b) return <p key={i}>{inline(b.p, email)}</p>;
  if ("ul" in b)
    return (
      <ul key={i}>
        {b.ul.map((li, j) => (
          <li key={j}>{inline(li, email)}</li>
        ))}
      </ul>
    );
  return (
    <div className="legal-table-wrap" key={i}>
      <table className="legal-table">
        <thead>
          <tr>
            {b.table.head.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {b.table.rows.map((r, j) => (
            <tr key={j}>
              {r.map((c, n) => (
                <td key={n}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PrivacyPage() {
  const email = siteConfig.supportEmail;
  const [lang, setLang] = useState<Lang>(readLang);
  const t = privacyText[lang];

  useEffect(() => {
    document.documentElement.lang = t.htmlLang;
    document.title = t.pageTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.description);
  }, [t]);

  useEffect(() => {
    const onPop = () => setLang(readLang());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const switchTo = (l: Lang) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (l === lang) return;
    window.history.pushState(null, "", langHref(l));
    setLang(l);
    window.scrollTo(0, 0);
  };

  return (
    <div className="legal-page">
      <header className="legal-topbar">
        <div className="wrap legal-topbar-inner">
          <a href="/" className="legal-brand" aria-label={t.homeAria}>
            <img src="/logo.png" alt={t.logoAlt} />
            <span className="legal-brand-word">Oyna</span>
          </a>
          <div className="legal-topbar-actions">
            <nav className="legal-lang" aria-label="Language">
              {LANGS.map((l) => (
                <a
                  key={l}
                  href={langHref(l)}
                  hrefLang={l}
                  lang={l}
                  aria-current={l === lang ? "true" : undefined}
                  onClick={switchTo(l)}
                >
                  {l.toUpperCase()}
                </a>
              ))}
            </nav>
            <a href="/" className="legal-back">
              {t.back}
            </a>
          </div>
        </div>
      </header>

      <main className="wrap legal-wrap" lang={t.htmlLang}>
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="legal-title">{t.title}</h1>
        <p className="legal-meta">{t.meta}</p>

        <div className="legal-body">
          {t.blocks.slice(0, 1).map((b, i) => renderBlock(b, i, email))}
          <p className="legal-controller">
            <strong>{t.controllerLabel}</strong> {t.controllerValue}
            <br />
            <strong>{t.contactLabel}</strong>{" "}
            <a href={`mailto:${email}`}>{email}</a>
          </p>
          {t.blocks.slice(1).map((b, i) => (
            <Fragment key={i + 1}>{renderBlock(b, i + 1, email)}</Fragment>
          ))}
        </div>
      </main>

      <footer className="legal-footer">
        <div className="wrap legal-footer-inner">
          <small>{t.footer}</small>
          <a href="/">oyna.site</a>
        </div>
      </footer>
    </div>
  );
}
