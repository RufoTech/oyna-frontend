const items = ["Məkanlar", "Qiymətlər", "Təchizat", "Reytinqlər", "Rezervasiya"];

export function CapabilityStrip() {
  return (
    <section className="strip" aria-label="Oyna nələri bir araya gətirir">
      <div className="strip-track">
        {[0, 1].map((copy) => (
          <div key={copy} className="strip-row" aria-hidden={copy === 1}>
            {items.map((item) => (
              <span key={`${copy}-${item}`} className="strip-item">
                {item}
                <i aria-hidden="true">✦</i>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
