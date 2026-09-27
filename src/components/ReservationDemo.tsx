import { useMemo, useState } from "react";
import { Reveal } from "./Reveal";
import { demoVenues } from "../data/demo";

const times = ["14:00", "16:30", "18:00", "20:30", "22:00"];
const azDays = ["Ber", "Çax", "Çər", "Cax", "Cüm", "Şən", "Baz"];
const azMonths = [
  "yan", "fev", "mar", "apr", "may", "iyn",
  "iyl", "avq", "sen", "okt", "noy", "dek",
];

function nextDays(count: number) {
  const days: Array<{ key: string; dow: string; label: string }> = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      dow: i === 0 ? "Bugün" : azDays[d.getDay() === 0 ? 6 : d.getDay() - 1],
      label: `${d.getDate()} ${azMonths[d.getMonth()]}`,
    });
  }
  return days;
}

export function ReservationDemo() {
  const days = useMemo(() => nextDays(7), []);
  const [venueId, setVenueId] = useState(demoVenues[0].id);
  const [day, setDay] = useState(days[1].key);
  const [time, setTime] = useState(times[3]);
  const [duration, setDuration] = useState(3);
  const [tierId, setTierId] = useState(demoVenues[0].tiers[1].id);
  const [sent, setSent] = useState(false);

  const venue = demoVenues.find((v) => v.id === venueId) ?? demoVenues[0];
  const tier = venue.tiers.find((t) => t.id === tierId) ?? venue.tiers[0];
  const total = (tier.pricePerHour * duration).toFixed(1).replace(".", ",");
  const dayLabel = days.find((d) => d.key === day);

  const pickVenue = (id: string) => {
    setVenueId(id);
    const v = demoVenues.find((x) => x.id === id) ?? demoVenues[0];
    setTierId(v.tiers[0].id);
    setSent(false);
  };

  return (
    <section className="section reservation" id="rezervasiya" aria-labelledby="reservation-title">
      <div className="wrap res-grid">
        <Reveal>
          <p className="eyebrow">Rezervasiya aydındır</p>
          <h2 className="display" id="reservation-title">
            Sorğu göndər, statusu izlə
          </h2>
          <div className="lead res-lead">
            <p>
              Məkan, tarix, vaxt, müddət və tier seçirsən — sorğun kluba gedir.
              Statusu tətbiqin “Rezervasiyalarım” bölməsindən izləyirsən.
            </p>
            <p className="res-honest">
              Dürüst qeyd: sorğu dərhal təsdiq demək deyil — klub “Qəbul edildi”
              və ya “Rədd edildi” cavabı verə bilər. Tətbiq onlayn ödəniş
              vəd etmir.
            </p>
          </div>
          <ol className="res-steps">
            <li>
              <strong>Seç</strong>
              <span>Tarix, vaxt, müddət, tier</span>
            </li>
            <li>
              <strong>Göndər</strong>
              <span>Sorğu kluba çatır</span>
            </li>
            <li>
              <strong>İzlə</strong>
              <span>Status profildə görünür</span>
            </li>
          </ol>
        </Reveal>

        <Reveal delay={120} className="reveal-scale">
          <div className="res-demo" aria-label="Rezervasiya ön baxışı (demo)">
            <div className="res-demo-head">
              <strong>Ön baxış</strong>
              <span className="demo-tag">Demo · lokal</span>
            </div>

            {!sent ? (
              <div className="res-form">
                <label className="res-field">
                  <span>Məkan</span>
                  <select value={venueId} onChange={(e) => pickVenue(e.target.value)}>
                    {demoVenues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </label>

                <fieldset className="res-field">
                  <legend>Tarix</legend>
                  <div className="res-pills" role="radiogroup" aria-label="Tarix">
                    {days.map((d) => (
                      <button
                        key={d.key}
                        type="button"
                        role="radio"
                        aria-checked={day === d.key}
                        className={day === d.key ? "on" : ""}
                        onClick={() => setDay(d.key)}
                      >
                        <small>{d.dow}</small>
                        <strong>{d.label}</strong>
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="res-field">
                  <legend>Vaxt</legend>
                  <div className="res-pills slots" role="radiogroup" aria-label="Vaxt">
                    {times.map((t) => (
                      <button
                        key={t}
                        type="button"
                        role="radio"
                        aria-checked={time === t}
                        className={time === t ? "on" : ""}
                        onClick={() => setTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="res-row">
                  <div className="res-field">
                    <span id="dur-label">Müddət</span>
                    <div className="res-stepper" role="group" aria-labelledby="dur-label">
                      <button
                        type="button"
                        aria-label="Müddəti azalt"
                        disabled={duration <= 1}
                        onClick={() => setDuration((d) => Math.max(1, d - 1))}
                      >
                        −
                      </button>
                      <strong>{duration} saat</strong>
                      <button
                        type="button"
                        aria-label="Müddəti artır"
                        disabled={duration >= 8}
                        onClick={() => setDuration((d) => Math.min(8, d + 1))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <label className="res-field">
                    <span>Tier</span>
                    <select value={tier.id} onChange={(e) => setTierId(e.target.value)}>
                      {venue.tiers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} — {t.pricePerHour} AZN/saat
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="res-total">
                  <span>
                    Cəmi (nümunə hesablama: {String(tier.pricePerHour).replace(".", ",")} × {duration} saat)
                  </span>
                  <strong>{total} AZN</strong>
                </div>

                <button type="button" className="btn btn-solid res-submit" onClick={() => setSent(true)}>
                  Sorğu göndər (Demo)
                </button>
                <p className="res-fineprint">
                  Bu, lokal ön baxışdır — heç yerə göndərilmir, məlumat toplanmır.
                  Tətbiqdə sorğu üçün mobil nömrə də lazımdır.
                </p>
              </div>
            ) : (
              <div className="res-done" role="status">
                <span className="res-check" aria-hidden="true">
                  ✓
                </span>
                <h3>Rezervasiya sorğusu göndərildi!</h3>
                <p>
                  {venue.name} · {dayLabel?.label} · {time} · {duration} saat · {tier.title}
                </p>
                <p className="res-code">Rezervasiya Kodu: #DEMO-2049</p>
                <div className="rv-status">
                  <span className="rv-pulse" aria-hidden="true" />
                  Status: Gözləyir
                </div>
                <p className="res-fineprint">
                  Nümunə status ekranıdır. Əsl tətbiqdə statusu “Rezervasiyalarım”
                  bölməsində izləyirsən.
                </p>
                <button type="button" className="btn btn-ghost" onClick={() => setSent(false)}>
                  Yenidən yoxla
                </button>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
