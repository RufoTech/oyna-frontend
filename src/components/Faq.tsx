import { useState } from "react";
import { Reveal } from "./Reveal";

const faqs = [
  {
    q: "Oyna nə üçündür?",
    a: "Oyna internet və PlayStation oyun klublarını kəşf etmək üçündür: yaxınlıqdakı məkanlara baxırsan, qiymət və təchizatı müqayisə edirsən, bəyəndiyin yerə rezervasiya sorğusu göndərirsən.",
  },
  {
    q: "Məkanları necə tapa bilərəm?",
    a: "Xəritə bölməsində ətrafındakı klubları görürsən. Axtarışla ad və ya ərazi üzrə tapa, nəticələri məsafəyə, reytinqə və əlifbaya görə sıralaya bilərsən.",
  },
  {
    q: "Qiymət və təchizat məlumatlarına necə baxıram?",
    a: "Hər məkanın səhifəsində qiymət cədvəli və tier-lər var: hardware, aksesuarlar və saatlıq AZN qiyməti. Tier-ləri yan-yana qoyub müqayisə etmək olur.",
  },
  {
    q: "Rezervasiya sorğusunun statusunu haradan izləyirəm?",
    a: "Profil bölməsindəki “Rezervasiyalarım” hissəsindən. Sorğun “Gözləyir”, “Qəbul edildi”, “Rədd edildi” və ya “Ləğv edildi” statuslarından birində görünür.",
  },
  {
    q: "Rezervasiya dərhal təsdiqlənirmi?",
    a: "Xeyr — sorğu göndəriləndən sonra klub təsdiqləyənə qədər status “Gözləyir” olur. Klub sorğunu qəbul və ya rədd edə bilər, ona görə cavabı tətbiqdən izləmək lazımdır.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section faq" id="faq" aria-labelledby="faq-title">
      <div className="wrap faq-grid">
        <Reveal>
          <p className="eyebrow">Tez-tez soruşulanlar</p>
          <h2 className="display" id="faq-title">
            Suallar, qısa cavablar
          </h2>
          <p className="lead">
            Cavab tapa bilmədinsə, bizə yaz — kömək etməyə hazırıq.
          </p>
        </Reveal>
        <div className="faq-list">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className={`faq-item ${isOpen ? "is-open" : ""}`}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-button-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                    >
                      <span>{f.q}</span>
                      <span className="faq-plus" aria-hidden="true">
                        +
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="faq-panel"
                    hidden={!isOpen}
                  >
                    <p>{f.a}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
