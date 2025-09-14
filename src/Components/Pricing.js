import React from 'react';
import '../styles/home.css';

const PRICING = [
  { id: 'gen', name: 'General Pass', price: 45, perks: ['Access to showcase', 'Pit-lane view', 'Food trucks access', 'Merch booths'] },
  { id: 'vip', name: 'VIP Pass', price: 150, highlight: true, perks: ['All General perks', 'VIP lounge', 'Priority pit access', 'Hot lap raffle entry'] },
  { id: 'team', name: 'Team/Exhibitor', price: 350, perks: ['2 VIP entries', 'Display slot', 'Brand mentions', 'Paddock parking'] },
];

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function Pricing({ onOpenTicket }) {
  return (
    <section id="pricing" className="section container">
      <h2>Tickets & Pricing</h2>
      <p className="sub">Simple passes for every fan. All prices in USD for demo.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        {PRICING.map((p) => (
          <article key={p.id} className="card" style={{ gridColumn: 'span 4' }}>
            <div className="card-body">
              <div className="card-row" style={{ justifyContent: 'space-between' }}>
                <div className="model">{p.name}</div>
                <div className="price">{formatUSD(p.price)}</div>
              </div>

              <div className="card-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '.4rem' }}>
                {p.perks.map((perk, i) => (
                  <span key={i} className="pill">{perk}</span>
                ))}
              </div>

              <div className="actions">
                <button className={`btn ${p.highlight ? '' : 'secondary'}`} onClick={() => onOpenTicket({ id: p.id, model: p.name })}>
                  {p.highlight ? 'Get VIP' : 'Select'}
                </button>
                <button className="ghost" onClick={() => alert(`${p.name} — more details (stub).`)}>Details</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
