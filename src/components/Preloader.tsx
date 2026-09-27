import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks";
import { useLoadState } from "../loading";

const MIN_VISIBLE_MS = 1200;

function statusFor(pct: number): string {
  if (pct < 25) return "Otaq hazırlanır…";
  if (pct < 50) return "Masa qurulur…";
  if (pct < 75) return "Kreslo gətirilir…";
  if (pct < 100) return "RGB işıqlar yandırılır…";
  return "Oyun başlayır!";
}

export function Preloader() {
  const { progress, done } = useLoadState();
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const shownRef = useRef(0);
  const targetRef = useRef(0);
  const mountedAt = useRef(0);

  useEffect(() => {
    targetRef.current = progress;
  }, [progress]);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (exiting) return;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [exiting]);

  // Smooth the displayed number toward real progress; rush to 100 when done.
  useEffect(() => {
    if (gone) return;
    let raf = 0;
    const tick = () => {
      const target = done ? 1 : targetRef.current;
      shownRef.current += (target - shownRef.current) * (done ? 0.18 : 0.08);
      if (done && shownRef.current > 0.995) shownRef.current = 1;
      setShown(shownRef.current * 100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, gone]);

  useEffect(() => {
    if (exiting || !done || shown < 99.5) return;
    const wait = Math.max(0, MIN_VISIBLE_MS - (Date.now() - mountedAt.current));
    const t = window.setTimeout(() => setExiting(true), wait);
    return () => window.clearTimeout(t);
  }, [done, shown, exiting]);

  useEffect(() => {
    if (!exiting) return;
    const t = window.setTimeout(() => setGone(true), reduced ? 300 : 900);
    return () => window.clearTimeout(t);
  }, [exiting, reduced]);

  if (gone) return null;

  const pct = Math.min(100, Math.floor(shown));
  return (
    <div
      className={`preloader ${exiting ? "is-exiting" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Yüklənir"
    >
      <div className="preloader-half preloader-top" aria-hidden="true">
        <div className="preloader-scene">
          <div className="preloader-grid" />
        </div>
      </div>
      <div className="preloader-half preloader-bottom" aria-hidden="true">
        <div className="preloader-scene">
          <div className="preloader-grid" />
        </div>
      </div>
      <div className="preloader-glow" aria-hidden="true" />
      <div className="preloader-overlay" aria-hidden="true" />
      <span className="preloader-corner c-tl" aria-hidden="true" />
      <span className="preloader-corner c-tr" aria-hidden="true" />
      <span className="preloader-corner c-bl" aria-hidden="true" />
      <span className="preloader-corner c-br" aria-hidden="true" />
      <div className="preloader-center">
        <div className="preloader-logo">
          <img src="/logo-white.png" alt="Oyna" />
          <span className="preloader-glitch g-cyan" aria-hidden="true" />
          <span className="preloader-glitch g-magenta" aria-hidden="true" />
        </div>
        <div className="preloader-count">
          {String(pct).padStart(3, "0")}
          <span className="preloader-pct">%</span>
        </div>
        <div className="preloader-bar">
          <div className="preloader-fill" style={{ width: `${shown}%` }} />
        </div>
        <p className="preloader-status">
          {statusFor(pct)}
          <span className="preloader-caret" aria-hidden="true" />
        </p>
      </div>
    </div>
  );
}
