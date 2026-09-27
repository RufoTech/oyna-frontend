import { useCallback, useRef, useState } from "react";
import { Reveal } from "./Reveal";
import {
  ScreenMap,
  ScreenReservation,
  ScreenTier,
  ScreenVenue,
  type FlowState,
} from "./PhoneScreens";

const tabs = ["Xəritə", "Məkan", "Tier", "Rezervasiya"] as const;

const blurbs = [
  "Xəritədə yaxınlıqdakı klubları gör, axtar və sırala.",
  "Məkanın fotolarına, saatlarına, xidmətlərinə və rəylərinə bax.",
  "Tier-lərin təchizatını və saatlıq qiymətini müqayisə et.",
  "Tarix, vaxt, müddət və tier seç — sorğunun statusunu izlə.",
];

/** Modern iPhone frame: titanium edge, side buttons, Dynamic Island. */
function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="iphone" aria-hidden="false">
      <span className="ip-btn action" aria-hidden="true" />
      <span className="ip-btn vol-up" aria-hidden="true" />
      <span className="ip-btn vol-down" aria-hidden="true" />
      <span className="ip-btn power" aria-hidden="true" />
      <div className="ip-bezel">
        <div className="ip-island" aria-hidden="true">
          <span className="ip-cam" />
        </div>
        <div className="ip-screen">{children}</div>
        <div className="ip-glare" aria-hidden="true" />
      </div>
    </div>
  );
}

export function Showcase() {
  const [active, setActive] = useState(0);
  const [flow, setFlow] = useState<FlowState>({ tier: 1, date: 1, time: 1, duration: 3 });
  const touchX = useRef<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + tabs.length) % tabs.length),
    [],
  );

  const handleTabKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;

    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const screens = [
    <ScreenMap key="m" />,
    <ScreenVenue key="v" />,
    <ScreenTier key="t" flow={flow} setFlow={setFlow} />,
    <ScreenReservation key="r" flow={flow} setFlow={setFlow} />,
  ];

  return (
    <section className="section showcase dark-zone" id="nasil-calisir" aria-labelledby="showcase-title">
      <div className="wrap showcase-grid">
        <Reveal>
          <p className="eyebrow">Tətbiq necə işləyir</p>
          <h2 className="display" id="showcase-title">
            Əsl Oyna axını, addım-addım
          </h2>
          <p className="lead showcase-lead">
            Aşağıdakı addımları seç — hər ekran tətbiqin əsl quruluşunu əks etdirir.
            Məlumatlar nümayiş üçündür.
          </p>
          <div
            className="showcase-steps"
            role="tablist"
            aria-label="Tətbiq ekranları"
            aria-orientation="horizontal"
          >
            {tabs.map((t, i) => (
              <button
                key={t}
                ref={(node) => {
                  tabRefs.current[i] = node;
                }}
                type="button"
                role="tab"
                aria-selected={active === i}
                aria-controls="showcase-panel"
                id={`showcase-tab-${i}`}
                className={`step-btn ${active === i ? "is-active" : ""}`}
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => handleTabKeyDown(e, i)}
              >
                <span className="step-no" aria-hidden="true">
                  0{i + 1}
                </span>
                <span className="step-text">
                  <strong>{t}</strong>
                  <small>{blurbs[i]}</small>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120} className="reveal-scale">
          <div className="phone-stage">
            <span className="demo-tag dark">Demo interfeys · tətbiqin əsl dizaynı</span>
            <div
              id="showcase-panel"
              role="tabpanel"
              aria-labelledby={`showcase-tab-${active}`}
              onTouchStart={(e) => {
                touchX.current = e.touches[0].clientX;
              }}
              onTouchEnd={(e) => {
                if (touchX.current === null) return;
                const dx = e.changedTouches[0].clientX - touchX.current;
                if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
                touchX.current = null;
              }}
            >
              <IPhoneFrame>
                <div className="oscreen-swap" key={active}>
                  {screens[active]}
                </div>
              </IPhoneFrame>
            </div>
            <div className="phone-nav">
              <button type="button" onClick={() => go(-1)} aria-label="Əvvəlki ekran">
                ←
              </button>
              <div className="ip-dots" aria-hidden="true">
                {tabs.map((t, i) => (
                  <span key={t} className={active === i ? "on" : ""} />
                ))}
              </div>
              <button type="button" onClick={() => go(1)} aria-label="Növbəti ekran">
                →
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
