import { useEffect, useRef, useState } from "react";
import { demoVenues } from "../data/demo";
import { useReducedMotion, useMobileViewport } from "../hooks";
import { markLoaded, setLoadProgress } from "../loading";
import type { StationHandle } from "../three/station";

/** Intentionally-designed static poster shown if WebGL is unavailable. */
function HeroFallback() {
  const [primary, second, third] = demoVenues;
  const price = (v: (typeof demoVenues)[number]) =>
    v.tiers[0]?.pricePerHour ?? 2;
  return (
    <div className="hero-fallback" aria-hidden="true">
      <div className="hero-fallback-glow" />
      <div className="hero-fallback-app">
        <div className="hf-bar">
          <span className="hf-dot" />
          <span className="hf-search">Məkanları axtar…</span>
          <span className="hf-chip">Bakı</span>
        </div>
        <div className="hf-body">
          <div className="hf-map">
            <span className="hf-pin p1" />
            <span className="hf-pin p2" />
            <span className="hf-pin p3 hot" />
            <span className="hf-pin p4" />
            <div className="hf-card">
              <strong>{primary.name}</strong>
              <small>
                ★ {primary.rating} · {primary.distance}
              </small>
              <em>Rezerv et</em>
            </div>
          </div>
          <div className="hf-list">
            <div className="hf-row hot">
              <strong>{primary.name}</strong>
              <small>{price(primary)} AZN/saat</small>
            </div>
            <div className="hf-row">
              <strong>{second.name}</strong>
              <small>{price(second)} AZN/saat</small>
            </div>
            <div className="hf-row">
              <strong>{third.name}</strong>
              <small>{price(third)} AZN/saat</small>
            </div>
          </div>
        </div>
        <div className="hf-tabs">
          <span className="on">Xəritə</span>
          <span>Axtarış</span>
          <span>Seçilmişlər</span>
          <span>Profil</span>
        </div>
      </div>
    </div>
  );
}

function HeroScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const stationRef = useRef<StationHandle | null>(null);
  const reduced = useReducedMotion();
  const isMobile = useMobileViewport();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    // On mobile the 3D scene is never loaded — a static image renders instead.
    if (isMobile) {
      markLoaded();
      return;
    }

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let station: StationHandle | null = null;
    let disposed = false;
    let started = false;
    let wantVisible = true;

    const start = async () => {
      if (started) return;
      started = true;
      try {
        const mod = await import("../three/station");
        if (disposed) return;
        station = mod.createStation(canvas, {
          reducedMotion: reduced,
          onProgress: setLoadProgress,
          onReady: () => {
            setReady(true);
            markLoaded();
          },
        });
        stationRef.current = station;
        station?.setVisible(wantVisible);
        if (!station) {
          markLoaded();
          if (!disposed) setFailed(true);
        }
      } catch {
        markLoaded();
        if (!disposed) setFailed(true);
      }
    };

    // Lazy: load the 3D scene only when the hero is near the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          wantVisible = e.isIntersecting;
          if (e.isIntersecting) {
            void start();
          }
          station?.setVisible(e.isIntersecting);
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(wrap);

    const onScroll = () => {
      if (!station) return;
      const r = wrap.getBoundingClientRect();
      const total = r.height + window.innerHeight;
      const passed = Math.min(Math.max(-r.top + window.innerHeight * 0.4, 0), total);
      station.setScrollProgress(passed / total);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      disposed = true;
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      station?.dispose();
      stationRef.current = null;
    };
  }, [reduced, isMobile]);

  if (isMobile) {
    return (
      <div className="hero-scene">
        <img
          className="hero-mobile-img"
          src="/hero-gaming.jpg"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
        />
      </div>
    );
  }

  if (failed) return <HeroFallback />;

  const toggleSpin = () => {
    const s = stationRef.current;
    if (!s) return;
    const next = !s.isAutoRotating();
    s.setAutoRotate(next);
    setSpinning(next);
  };

  return (
    <div
      ref={wrapRef}
      className="hero-scene"
      data-cursor-label={ready ? (spinning ? "Sürüşdür" : "360°") : ""}
    >
      {!ready && <HeroFallback />}
      <canvas
        ref={canvasRef}
        className={`hero-canvas ${ready ? "is-ready" : ""} ${spinning ? "is-spinning" : ""}`}
        role="img"
        aria-label="Oyna tətbiqini göstərən ekrana malik oyun stansiyasının 3D konsept səhnəsi"
      />
      {ready && (
        <div className="hero-spin">
          <button
            type="button"
            className={`spin-btn ${spinning ? "is-active" : ""}`}
            onClick={toggleSpin}
            aria-pressed={spinning}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 4V1L7 6l5 5V7c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 13c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 11c0 4.42 3.58 8 8 8v3l5-5-5-5v4z"
              />
            </svg>
            {spinning ? "360° aktivdir" : "360° baxış"}
          </button>
          {spinning && <p className="spin-hint">Sürüşdürərək PC-yə hər tərəfdən bax</p>}
        </div>
      )}
    </div>
  );
}

export function Hero() {
  return (
    <section className="hero dark-zone" id="top" aria-labelledby="hero-title">
      <HeroScene />
      <div className="hero-scrim" aria-hidden="true" />
      <div className="wrap hero-content">
        <p className="eyebrow hero-eyebrow">Bakı · Oyun məkanları</p>
        <h1 className="display hero-title" id="hero-title">
          Növbəti oyun yerin bir toxunuş uzağında.
        </h1>
        <p className="lead hero-lead">
          Bakıdakı internet və PlayStation klublarını kəşf et, məkanı və qiyməti
          müqayisə et, yerin üçün rezervasiya sorğusu göndər.
        </p>
        <div className="hero-ctas">
          <a href="#yukle" className="btn btn-solid">
            Tətbiqi yüklə
          </a>
          <a href="#kesfet" className="btn btn-ghost">
            Təcrübəyə bax
          </a>
        </div>
        <p className="hero-note">Tətbiq görüntüləri demodur</p>
      </div>
      <a href="#kesfet" className="scroll-cue" aria-label="Aşağı diyirlə — Kəşf et bölməsi">
        <span aria-hidden="true" />
      </a>
    </section>
  );
}
