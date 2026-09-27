import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { bakuMapVenues, type BakuMapVenue } from "../data/bakuMapVenues";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet’s default _getIconUrl breaks marker images under Vite.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mapPinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const BAKU_CENTER: L.LatLngExpression = [40.397, 49.86];

export function BakuMap() {
  const mapRoot = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [selected, setSelected] = useState<BakuMapVenue | null>(null);

  useEffect(() => {
    if (!mapRoot.current || mapRef.current) return;

    const map = L.map(mapRoot.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView(BAKU_CENTER, 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers = bakuMapVenues.map((venue) => {
      const marker = L.marker([venue.lat, venue.lng], { icon: mapPinIcon, title: venue.name });
      marker.on("click", () => {
        setSelected(venue);
        map.panTo([venue.lat, venue.lng], { animate: true });
      });
      marker.addTo(map);
      return marker;
    });

    // #region agent log
    const firstMarker = markers[0];
    if (firstMarker) {
      const iconEl = firstMarker.getElement();
      const img =
        iconEl?.tagName === "IMG"
          ? (iconEl as HTMLImageElement)
          : iconEl?.querySelector("img");
      const imgStyle = img ? window.getComputedStyle(img) : null;
      fetch("http://127.0.0.1:7719/ingest/21d0a035-15ca-4f4e-8a96-66c224f95a67", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e76c0d" },
        body: JSON.stringify({
          sessionId: "e76c0d",
          hypothesisId: "C-E",
          runId: "post-fix",
          location: "BakuMap.tsx:useEffect",
          message: "First marker icon DOM after addTo",
          data: {
            imgSrc: img?.getAttribute("src") ?? (img as HTMLImageElement | null)?.src ?? null,
            imgComplete: img?.complete ?? null,
            imgNaturalWidth: img?.naturalWidth ?? null,
            imgNaturalHeight: img?.naturalHeight ?? null,
            imgMaxWidth: imgStyle?.maxWidth ?? null,
            imgWidth: imgStyle?.width ?? null,
            iconElClass: iconEl?.className ?? null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      if (markerIcon) {
        fetch(markerIcon, { method: "HEAD" })
          .then((r) => {
            fetch("http://127.0.0.1:7719/ingest/21d0a035-15ca-4f4e-8a96-66c224f95a67", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e76c0d" },
              body: JSON.stringify({
                sessionId: "e76c0d",
                hypothesisId: "E",
                location: "BakuMap.tsx:useEffect",
                message: "HEAD fetch bundled marker icon URL",
                data: { status: r.status, ok: r.ok, url: markerIcon },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
          })
          .catch((err: Error) => {
            fetch("http://127.0.0.1:7719/ingest/21d0a035-15ca-4f4e-8a96-66c224f95a67", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e76c0d" },
              body: JSON.stringify({
                sessionId: "e76c0d",
                hypothesisId: "E",
                location: "BakuMap.tsx:useEffect",
                message: "HEAD fetch marker icon failed",
                data: { error: String(err), url: markerIcon },
                timestamp: Date.now(),
              }),
            }).catch(() => {});
          });
      }
    }
    // #endregion

    mapRef.current = map;
    markersRef.current = markers;

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(mapRoot.current);

    return () => {
      ro.disconnect();
      markers.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  const mapsLink = selected
    ? `https://www.google.com/maps/search/?api=1&query=${selected.lat},${selected.lng}`
    : "https://www.google.com/maps/search/internet+club+Baku";

  return (
    <div className="story-visual map-visual gm-visual">
      <div ref={mapRoot} className="gm-leaflet" role="application" aria-label="Bakı internet klubları xəritəsi" />
      <div className="gm-overlay" aria-hidden="true">
        <div className="gm-search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"
            />
          </svg>
          <span>Məkanları axtar…</span>
          <em>Bakı</em>
        </div>
        <div className="gm-chips">
          <span className="on">Hamısı</span>
          <span>Ən yaxın</span>
          <span>İndi açıq</span>
          <span>PlayStation</span>
        </div>
      </div>

      {selected ? (
        <div className="gm-card gm-card--active">
          <div className="gm-card-media">
            <img
              src={selected.photo}
              alt=""
              className="gm-card-img"
              loading="eager"
              decoding="async"
            />
          </div>
          <div className="gm-card-inner">
            <span className="demo-tag dark">Canlı məkan</span>
            <div className="gm-card-body">
              <div>
                <strong>{selected.name}</strong>
                <small>
                  ★ {selected.rating} · {selected.address}
                </small>
              </div>
            </div>
            <div className="gm-card-foot">
              <span className="ps-btn">Rezerv et</span>
              <a className="gm-open" href={mapsLink} target="_blank" rel="noreferrer">
                Google Maps-də aç ↗
              </a>
            </div>
          </div>
          <button
            type="button"
            className="gm-card-close"
            aria-label="Bağla"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
        </div>
      ) : (
        <p className="gm-hint">Xəritədə pin seç — klubun adı və şəkli burada görünəcək.</p>
      )}
    </div>
  );
}
