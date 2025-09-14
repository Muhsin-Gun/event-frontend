import React, { useEffect, useRef, useState } from 'react';
import '../styles/home.css';

// Images list includes Audi R8, BMW M5 Competition (black), and "aura farming" style images (URLs)
const FEATURED_CARS = [
  { id: 'audi-r8', model: 'Audi R8', priceUSD: 170000, power: '562 hp', zeroTo100: '3.4s', img: 'https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?q=80&w=1600', credit: 'Unsplash' },
  { id: 'bmw-m5', model: 'BMW M5 Competition (Black)', priceUSD: 120000, power: '617 hp', zeroTo100: '3.3s', img: 'https://images.unsplash.com/photo-1549921296-3c0b091d25d3?q=80&w=1600', credit: 'Unsplash' },
  // Aura farming / stylized farming vehicles - two artistic images
  { id: 'aura-1', model: 'Aura Farming — Concept', priceUSD: 0, power: '-', zeroTo100: '-', img: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600', credit: 'Unsplash' },
];

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function Showcase({ onOpenTicket }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line
  }, [index, paused]);

  const startAuto = () => {
    if (timer.current) return;
    if (paused) return;
    timer.current = setInterval(() => setIndex(i => (i + 1) % FEATURED_CARS.length), 4000);
  };
  const stopAuto = () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + FEATURED_CARS.length) % FEATURED_CARS.length); if (e.key === 'ArrowRight') setIndex(i => (i + 1) % FEATURED_CARS.length); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="showcase" className="section container">
      <div className="featured-top">
        <div
          className="featured-carousel"
          onMouseEnter={() => { setPaused(true); stopAuto(); }}
          onMouseLeave={() => { setPaused(false); startAuto(); }}
        >
          <div className="slides" style={{ transform: `translateX(-${index * 100}%)` }}>
            {FEATURED_CARS.map((c) => (
              <figure key={c.id} className="slide" role="group" aria-label={`${c.model} slide`}>
                <img src={c.img} alt={c.model} loading="lazy" />
                <figcaption>
                  <div className="slide-meta">
                    <div className="slide-title">{c.model}</div>
                    <div className="slide-price">{c.priceUSD ? formatUSD(c.priceUSD) : 'Showcase'}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <button className="carousel-control prev" onClick={() => setIndex(i => (i - 1 + FEATURED_CARS.length) % FEATURED_CARS.length)} aria-label="Previous slide">‹</button>
          <button className="carousel-control next" onClick={() => setIndex(i => (i + 1) % FEATURED_CARS.length)} aria-label="Next slide">›</button>

          <div className="carousel-indicators" role="tablist" aria-label="Slide indicators">
            {FEATURED_CARS.map((_, i) => (
              <button key={i} className={`dot ${i === index ? 'active' : ''}`} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`} />
            ))}
          </div>
        </div>

        <div className="featured-intro">
          <h2>Featured Supercars</h2>
          <p className="sub">Curated lineup for upcoming meets. Prices shown are indicative MSRPs — see cars at the next RevMeet.</p>
          <div className="featured-actions">
            <button className="btn" onClick={() => document.querySelector('#events')?.scrollIntoView({ behavior: 'smooth' })}>Browse All Events</button>
            <button className="btn secondary" onClick={() => onOpenTicket(null)}>Quick Tickets</button>
          </div>
        </div>
      </div>

      <div className="grid cards-grid" id="cards-grid" aria-live="polite">
        {FEATURED_CARS.map(car => (
          <article key={car.id} className="card" tabIndex="0" aria-label={`${car.model} card`}>
            <img className="card-img" src={car.img} alt={car.model} loading="lazy" />
            <div className="card-body">
              <div className="card-row">
                <div className="model">{car.model}</div>
                <div className="price">{car.priceUSD ? formatUSD(car.priceUSD) : <small>Showcase</small>}</div>
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
