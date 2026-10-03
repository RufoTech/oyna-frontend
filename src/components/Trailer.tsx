import { useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { Reveal } from "./Reveal";

export function Trailer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const playTrailer = () => {
    void videoRef.current?.play();
  };

  return (
    <section
      className="section trailer dark-zone"
      id="treyler"
      aria-labelledby="trailer-title"
    >
      <div className="wrap">
        <Reveal className="trailer-head">
          <p className="eyebrow">Oyna tətbiqi · Treyler</p>
          <h2 className="display trailer-title" id="trailer-title">
            Tətbiqi 20 saniyədə izlə
          </h2>
          <p className="lead trailer-lead">
            Xəritədən rezervasiyaya qədər — Oyna tətbiqinin necə işlədiyini bir
            treylerdə gör.
          </p>
        </Reveal>

        <Reveal delay={120}>
          <div className="trailer-frame">
            <span className="tf-corner tl" aria-hidden="true" />
            <span className="tf-corner tr" aria-hidden="true" />
            <span className="tf-corner bl" aria-hidden="true" />
            <span className="tf-corner br" aria-hidden="true" />

            <div className="trailer-topbar" aria-hidden="true">
              <span className="tf-mark">
                <i className="tf-dot" />
                OYNA
              </span>
              <span className="tf-tag">APP TRAILER</span>
              <span className="tf-time">00:20</span>
            </div>

            <div className="trailer-screen">
              <video
                ref={videoRef}
                src="/trailer.mp4"
                poster="/trailer-poster.jpg"
                playsInline
                preload="metadata"
                controls={playing}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              {!playing && (
                <button
                  type="button"
                  className="trailer-play"
                  onClick={playTrailer}
                  aria-label="Treyleri izlə"
                >
                  <span className="tp-cluster">
                    <span className="tp-ring" aria-hidden="true" />
                    <span className="tp-btn">
                      <FaPlay aria-hidden="true" />
                    </span>
                  </span>
                  <span className="tp-label">Treyleri izlə</span>
                </button>
              )}
            </div>

            <div className="trailer-chin" aria-hidden="true">
              <span className="chin-speaker" />
              <span className="chin-word">oyna.site</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
