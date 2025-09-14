import React, { useState } from 'react';
import '../styles/home.css';

const FAQS = [
  { q: 'Can I pay with M-Pesa?', a: 'Yes — on ticket checkout we initiate an M-Pesa STK push to your phone to complete payment securely.' },
  { q: 'Are kids allowed?', a: 'Yes, minors must be accompanied by an adult. Ear protection recommended for track days.' },
  { q: 'What time should I arrive?', a: 'Gates open at 9:00am. Track sessions start at 10:00am. VIP lounge opens at 9:30am.' },
  { q: 'Are test drives available?', a: 'On some dealer showcase days and by appointment. Ask at the info desk on-site.' },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section container" aria-label="FAQ">
      <h2>FAQ</h2>
      <p className="sub">Logistics, tickets, and what to expect at RevMeet.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        {FAQS.map((f, i) => (
          <article key={i} className="card" style={{ gridColumn: 'span 6' }}>
            <button
              className="card-body"
              style={{ textAlign: 'left', background: 'transparent', border: 0, cursor: 'pointer' }}
              onClick={() => setOpen(o => (o === i ? null : i))}
              aria-expanded={open === i}
            >
              <div className="card-row" style={{ justifyContent: 'space-between' }}>
                <div className="model">{f.q}</div>
                <div className="pill">{open === i ? '−' : '+'}</div>
              </div>

              {open === i && (
                <div className="card-row" style={{ marginTop: '.6rem' }}>
                  <p className="muted-note" style={{ margin: 0 }}>{f.a}</p>
                </div>
              )}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
