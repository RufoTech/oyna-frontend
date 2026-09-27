import { useEffect, useRef, useState } from "react";

/**
 * Monoxrom custom cursor — saytın ağ/qara dizaynına uyğun.
 *
 * - Nöqtə + gecikmə ilə gələn halqa (lerp ilə hamar izləmə)
 * - `mix-blend-mode: difference` sayəsində həm açıq, həm qaranlıq
 *   (dark-zone) bölmələrdə avtomatik kontrast saxlayır
 * - Yalnız dəqiq göstərici (siçan/trackpad) olduqda və
 *   `prefers-reduced-motion` söndürüldükdə aktivləşir
 * - `data-cursor-label` atributu olan elementlərin üzərində
 *   halqa mətnli nişana çevrilir (məs. hero 3D səhnəsi)
 */

const HOVER_SELECTOR = [
  "a",
  "button",
  "[role='button']",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[data-cursor='hover']",
].join(",");

const LERP = 0.18;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    if (!enabled) return;

    document.body.classList.add("has-custom-cursor");

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let raf = 0;
    let visible = false;
    // Hədəf (siçan) və halqanın cari mövqeyi
    let mx = -100;
    let my = -100;
    let rx = -100;
    let ry = -100;

    const setState = (next: string | null) => {
      ring.dataset.state = next ?? "";
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        rx = mx;
        ry = my;
        dot.dataset.visible = "true";
        ring.dataset.visible = "true";
      }
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

      const target = e.target as HTMLElement | null;
      const labelEl = target?.closest?.("[data-cursor-label]");
      const labelText = labelEl?.getAttribute("data-cursor-label");
      const hoverEl = target?.closest?.(HOVER_SELECTOR);
      // Etiketli sahənin içindəki düymə/link üzərində hover vəziyyəti qalır
      const innerInteractive =
        hoverEl && labelEl && hoverEl !== labelEl && labelEl.contains(hoverEl);
      // Boş string label-i söndürür (məs. hero 3D hələ hazır deyil)
      const showLabel = labelText && !innerInteractive;
      setLabel(showLabel ? labelText : null);
      if (showLabel) {
        setState("label");
      } else if (hoverEl) {
        setState("hover");
      } else {
        setState(null);
      }
    };

    const onDown = () => {
      dot.dataset.pressed = "true";
      ring.dataset.pressed = "true";
    };
    const onUp = () => {
      dot.dataset.pressed = "";
      ring.dataset.pressed = "";
    };

    const onLeave = (e: MouseEvent) => {
      // Pəncərədən çıxanda gizlət
      if (!e.relatedTarget) {
        visible = false;
        dot.dataset.visible = "";
        ring.dataset.visible = "";
      }
    };

    const tick = () => {
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        <span className="cursor-ring-circle" />
        {label && <span className="cursor-label">{label}</span>}
      </div>
    </div>
  );
}
