import React from 'react';
import '../styles/home.css';

const SPONSORS = [
  { id: 'sp1', name: 'Shell Performance', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600' },
  { id: 'sp2', name: 'Pirelli', img: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=600' },
  { id: 'sp3', name: 'Brembo', img: 'https://images.unsplash.com/photo-1544829728-e5cb9eeded63?q=80&w=600' },
  { id: 'sp4', name: 'MagnaFlow', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600' },
];

export default function Sponsors() {
  return (
    <section className="section container" aria-label="Sponsors">
      <h2>Partners & Sponsors</h2>
      <p className="sub">Powering the scene with premium performance brands.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        {SPONSORS.map((s) => (
          <article key={s.id} className="card" style={{ gridColumn: 'span 3', display: 'grid' }}>
            <img className="card-img" src={s.img} alt={s.name} loading="lazy" />
            <div className="card-body">
              <div className="card-row" style={{ justifyContent: 'space-between' }}>
                <div className="model">{s.name}</div>
                <div className="pill">Official</div>
              </div>
              <div className="actions">
                <button className="ghost" onClick={() => alert(`${s.name} — profile (stub)`)}>Learn more</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
