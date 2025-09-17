import React, { useEffect, useRef, useState } from 'react';
import '../styles/home.css';

const FEATURED_CARS = [
  { id: 'audi-r8', model: 'Audi R8', priceUSD: 170000, power: '562 hp', zeroTo100: '3.4s', img: encodeURI('WhatsApp Image 2025-09-15 at 23.14.44_8e7cca7b.jpg'), credit: 'Local' },
  { id: 'bmw-m5', model: 'BMW M5 Competition (Black)', priceUSD: 120000, power: '617 hp', zeroTo100: '3.3s', img: encodeURI('/WhatsApp Image 2025-09-15 at 20.50.48_eb3a097a.jpg'), credit: 'Local' },
  { id: 'merc-amg', model: 'Mercedes AMG (Aura)', priceUSD: 160000, power: '630 hp', zeroTo100: '3.2s', img: encodeURI('/WhatsApp Image 2025-09-15 at 20.44.30_f4434a17.jpg'), credit: 'Local' },
  { id: 'ferrari', model: 'Ferrari (Showcase)', priceUSD: 290000, power: '661 hp', zeroTo100: '3.0s', img: encodeURI('/WhatsApp Image 2025-09-15 at 20.54.22_6ea3691a.jpg'), credit: 'Local' },
  { id: 'pagani', model: 'Pagani (Showcase)', priceUSD: 1500000, power: '740 hp', zeroTo100: '2.8s', img: encodeURI('/WhatsApp Image 2025-09-15 at 20.55.57_8e916857.jpg'), credit: 'Local' },
  { id: 'lambo', model: 'Lamborghini (Showcase)', priceUSD: 517000, power: '770 hp', zeroTo100: '2.8s', img: encodeURI('/WhatsApp Image 2025-09-15 at 20.56.43_0d976f1f.jpg'), credit: 'Local' },
];

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(n);
}

export default function Showcase({ onOpenTicket }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!paused) {
      timer.current = setInterval(() => {
        setIndex(i => (i + 1) % FEATURED_CARS.length);
      }, 4200);
    }
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + FEATURED_CARS.length) % FEATURED_CARS.length);
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % FEATURED_CARS.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (index >= FEATURED_CARS.length) setIndex(0);
  }, [index]);

  return (
    <section id="showcase" className="section container">
      <div className="featured-top">
        <div
          className="featured-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="slides" style={{ transform: `translateX(-${index * 100}%)` }}>
            {FEATURED_CARS.map((c) => (
              <figure key={c.id} className="slide" role="group" aria-label={`${c.model} slide`}>
                <img
                  src={c.img}
                  alt={c.model}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
                />
                <figcaption>
                  <div className="slide-meta">
                    <div className="slide-title">{c.model}</div>
                    <div className="slide-price">{formatUSD(c.priceUSD)}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <button className="carousel-control prev"
            onClick={() => setIndex(i => (i - 1 + FEATURED_CARS.length) % FEATURED_CARS.length)}
            aria-label="Previous slide">‹</button>
          <button className="carousel-control next"
            onClick={() => setIndex(i => (i + 1) % FEATURED_CARS.length)}
            aria-label="Next slide">›</button>

          <div className="carousel-indicators" role="tablist">
            {FEATURED_CARS.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="featured-intro">
          <h2>Featured Supercars</h2>
          <p className="sub">Curated lineup for upcoming meets. Prices shown are indicative MSRPs — see cars at the next RevMeet.</p>
          <div className="featured-actions">
            <button className="btn" onClick={() => window.location.href = '/events'}>Browse All Events</button>
            <button className="btn secondary" onClick={() => onOpenTicket(null)}>Quick Tickets</button>
          </div>
        </div>
      </div>

      <div className="grid cards-grid" aria-live="polite">
        {FEATURED_CARS.map(car => (
          <article key={car.id} className="card">
            <img className="card-img" src={car.img} alt={car.model} loading="lazy" />
            <div className="card-body">
              <div className="card-row">
                <div className="model">{car.model}</div>
                <div className="price">{formatUSD(car.priceUSD)} <small>MSRP</small></div>
              </div>

              <div className="card-row" style={{ gap: '.4rem', flexWrap: 'wrap' }}>
                <span className="pill">Power: {car.power}</span>
                <span className="pill">0–100: {car.zeroTo100}</span>
              </div>

              <div className="actions">
                <button className="btn" onClick={() => onOpenTicket(car)}>Get Tickets</button>
                <button className="ghost" onClick={() => alert(`${car.model} — more details (stub).`)}>Details</button>
              </div>

              <div className="credit">{car.credit}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}



