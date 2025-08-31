import React, { useEffect, useMemo, useRef, useState } from 'react';
import '../styles/home.css';
import Navbar from './Navbar';

const NAV_LINKS = [
  { href: '#events', label: 'Events' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

const FEATURED_CARS = [
  { id: 'f488p', model: 'Ferrari 488 Pista', priceUSD: 330000, power: '710 hp', zeroTo100: '2.9s', img: 'https://source.unsplash.com/PHvx-TEKbRU/1600x1000', credit: 'Unsplash: Sai Kalyan Achanta' },
  { id: 'lambo-avj', model: 'Lamborghini Aventador SVJ', priceUSD: 517000, power: '770 hp', zeroTo100: '2.8s', img: 'https://source.unsplash.com/31fqICh0Q1I/1600x1000', credit: 'Unsplash: Wes Tindel' },
  { id: 'p911gt3rs', model: 'Porsche 911 GT3 RS', priceUSD: 241000, power: '518 hp', zeroTo100: '3.0s', img: 'https://source.unsplash.com/eUDs6kqCxig/1600x1000', credit: 'Unsplash' },
  { id: 'mcl-720s', model: 'McLaren 720S', priceUSD: 315000, power: '710 hp', zeroTo100: '2.8s', img: 'https://source.unsplash.com/3zevxXFlL_s/1600x1000', credit: 'Unsplash: Micael Sáez' },
  { id: 'mcl-720s-white', model: 'McLaren 720S (Track Pack)', priceUSD: 335000, power: '710 hp', zeroTo100: '2.8s', img: 'https://source.unsplash.com/gNi9bw6f9iA/1600x1000', credit: 'Unsplash' },
  { id: 'f488p-red', model: 'Ferrari 488 (Display Spec)', priceUSD: 290000, power: '661 hp', zeroTo100: '3.0s', img: 'https://source.unsplash.com/FBZke4rUUeo/1600x1000', credit: 'Unsplash: Sai Kalyan Achanta' },
];

const PRICING = [
  { id: 'gen', name: 'General Pass', price: 45, perks: ['Access to showcase', 'Pit-lane view', 'Food trucks access', 'Merch booths'] },
  { id: 'vip', name: 'VIP Pass', price: 150, highlight: true, perks: ['All General perks', 'VIP lounge', 'Priority pit access', 'Hot lap raffle entry'] },
  { id: 'team', name: 'Team/Exhibitor', price: 350, perks: ['2 VIP entries', 'Display slot', 'Brand mentions', 'Paddock parking'] },
];

const FAQS = [
  { q: 'Can I pay with M-Pesa?', a: 'Yes — on ticket checkout we initiate an M-Pesa STK push to your phone to complete payment securely.' },
  { q: 'Are kids allowed?', a: 'Yes, minors must be accompanied by an adult. Ear protection recommended for track days.' },
  { q: 'What time should I arrive?', a: 'Gates open at 9:00am. Track sessions start at 10:00am. VIP lounge opens at 9:30am.' },
  { q: 'Are test drives available?', a: 'On some dealer showcase days and by appointment. Ask at the info desk on-site.' },
];

const SPONSORS = [
  { id: 'sp1', name: 'Shell Performance', img: 'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600' },
  { id: 'sp2', name: 'Pirelli', img: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=600' },
  { id: 'sp3', name: 'Brembo', img: 'https://images.unsplash.com/photo-1544829728-e5cb9eeded63?q=80&w=600' },
  { id: 'sp4', name: 'MagnaFlow', img: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=600' },
];

const GALLERY = [
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400',
  'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1400',
  'https://images.unsplash.com/photo-1549924231-f129b911e442?q=80&w=1400',
  'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=1400',
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=1400',
  'https://images.unsplash.com/photo-1542044801-7f4f4a6b5417?q=80&w=1400',
];

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

/* ========================= TICKET MODAL ========================= */
function TicketModal({ open, onClose, item }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('general'); // general | vip
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!open) {
      // reset when closed
      setName('');
      setEmail('');
      setPhone('');
      setType('general');
      setQty(1);
      setMessage(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const price = type === 'vip' ? 150 : 45; // example pricing (USD)

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    // minimal validation
    if (!phone || phone.length < 7) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return;
    }
    setLoading(true);

    const payload = {
      eventId: item?.id || 'revmeet-weekend',
      phone: phone.replace(/\D/g, ''),
      amount: price * qty,
      meta: { name, email, type, qty },
    };

    try {
      // try calling backend STK push
      const token = localStorage.getItem('authToken'); // expected token if logged in
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Payment initiation failed');
      }

      await resp.json();
      setMessage({ type: 'success', text: 'STK Push initiated. Check your phone to complete payment.' });
    } catch (err) {
      console.error('STK error:', err);
      setMessage({ type: 'warn', text: 'Could not reach payment endpoint — simulated success (dev).' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
      <div className="modal">
        <header className="modal-header">
          <h3 id="ticket-modal-title">Get Tickets {item ? `— ${item.model || item.title}` : ''}</h3>
          <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required /></label>
            <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          </div>

          <div className="form-row">
            <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+2547..." required /></label>
            <label>Type
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="general">General — $45</option>
                <option value="vip">VIP — $150</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>Quantity
              <input type="number" min="1" max="10" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
            </label>
            <div className="summary">
              <div>Subtotal</div>
              <div className="summary-amount">{formatUSD(price * qty)}</div>
            </div>
          </div>

          {message && (
            <div className={`alert ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose} disabled={loading}>Close</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Processing...' : `Pay ${formatUSD(price * qty)}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================= HERO ========================= */
function Hero({ onGetTickets }) {
  // next event date (static example)
  const nextEventDate = useMemo(() => new Date('2025-10-26T10:00:00'), []);
  const [countdown, setCountdown] = useState(getCountdown(nextEventDate));

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(nextEventDate)), 1000);
    return () => clearInterval(id);
  }, [nextEventDate]);

  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="kicker">Luxury & Supercar Meetup • Nairobi</p>
          <h1 className="h1">Where horsepower meets <span className="accent-2">hype</span>.</h1>

          <p className="lede">
            High-octane meetups, dealership showcases, and exclusive test-drive experiences.
            Discover upcoming events, reserve tickets, and explore our curated supercar lineup.
          </p>

          <div className="hero-cta">
            <a className="btn" href="#events">Browse Events</a>
            <button className="btn secondary" onClick={() => document.querySelector('#showcase')?.scrollIntoView({ behavior: 'smooth' })}>Explore Showcase</button>
            <button className="btn ghost" onClick={onGetTickets}>Quick Tickets</button>
          </div>

          <div className="stats">
            <div className="stat"><div className="n">25+</div><div className="t">Dealers</div></div>
            <div className="stat"><div className="n">1200+</div><div className="t">Attendees</div></div>
            <div className="stat"><div className="n">18</div><div className="t">Supercars</div></div>
            <div className="stat"><div className="n">4</div><div className="t">Track Days</div></div>
          </div>
        </div>

        <aside className="hero-card" aria-label="Next event">
          <span className="badge">Next Up</span>
          <h3>RevMeet • Weekend Track Day</h3>

          <div className="meta">
            <span>
              {nextEventDate.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {nextEventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>Whistling Morans, Athi River</span>
          </div>

          <div className="meta" style={{ marginTop: '.2rem' }}>
            <span>VIP from {formatUSD(150)}</span>
            <span>General {formatUSD(45)}</span>
          </div>

          <div className="countdown" aria-hidden>
            <div className="cd-col"><div className="cd-n">{countdown.days}</div><div className="cd-t">Days</div></div>
            <div className="cd-col"><div className="cd-n">{pad(countdown.hours)}</div><div className="cd-t">Hours</div></div>
            <div className="cd-col"><div className="cd-n">{pad(countdown.minutes)}</div><div className="cd-t">Min</div></div>
            <div className="cd-col"><div className="cd-n">{pad(countdown.seconds)}</div><div className="cd-t">Sec</div></div>
          </div>

          <div className="hero-cta" style={{ marginTop: '.6rem' }}>
            <a className="btn" href="#get-tickets">Get Tickets</a>
            <button className="ghost" onClick={() => alert('Added to calendar (stub)')}>Add to Calendar</button>
          </div>

          <p className="muted-note">Static hero for high-impact presentation — immediate clarity for users.</p>
        </aside>
      </div>
    </section>
  );
}

/* ========================= CAROUSEL + FEATURED GRID ========================= */
function FeaturedSection({ onOpenTicket }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, paused]);

  const startAuto = () => {
    if (timer.current) return;
    if (paused) return;
    timer.current = setInterval(() => {
      setIndex(i => (i + 1) % FEATURED_CARS.length);
    }, 4000);
  };

  const stopAuto = () => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  };

  function prev() {
    stopAuto();
    setIndex(i => (i - 1 + FEATURED_CARS.length) % FEATURED_CARS.length);
  }
  function next() {
    stopAuto();
    setIndex(i => (i + 1) % FEATURED_CARS.length);
  }

  // keyboard left/right
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
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
                    <div className="slide-price">{formatUSD(c.priceUSD)}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <button className="carousel-control prev" onClick={prev} aria-label="Previous slide">‹</button>
          <button className="carousel-control next" onClick={next} aria-label="Next slide">›</button>

          <div className="carousel-indicators" role="tablist" aria-label="Slide indicators">
            {FEATURED_CARS.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === index ? 'active' : ''}`}
                onClick={() => { setIndex(i); stopAuto(); }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="featured-intro">
          <h2>Featured Supercars</h2>
          <p className="sub">
            Curated lineup for upcoming meets. Prices shown are indicative MSRPs — see cars at the next RevMeet.
          </p>
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

/* ========================= UPCOMING EVENTS ========================= */
function Events({ onOpenTicket }) {
  return (
    <section id="events" className="section container">
      <h2>Upcoming Events</h2>
      <p className="sub">Live events, track days and dealer showcases. Click a ticket to reserve.</p>

      <div className="events-grid">
        <article className="event-card">
          <div className="event-head">
            <h3>RevMeet • Weekend Track Day</h3>
            <div className="event-meta">Sat, 26 Oct • Whistling Morans</div>
          </div>
          <div className="event-body">
            <p>Open pit-lane, demo laps, dealer displays and VIP lounge. Limited VIP passes — get them early.</p>
            <div className="event-actions">
              <button className="btn" onClick={() => onOpenTicket(null)}>Book Tickets</button>
              <button className="btn secondary" onClick={() => alert('Event details (stub)')}>Details</button>
            </div>
          </div>
        </article>

        <article className="event-card">
          <div className="event-head">
            <h3>Dealer Showcase — City Center</h3>
            <div className="event-meta">Sun, 12 Nov • Nairobi City</div>
          </div>
          <div className="event-body">
            <p>Dealers bring special demo models for a 1-day showcase and test drives.</p>
            <div className="event-actions">
              <button className="btn" onClick={() => onOpenTicket(null)}>Get Tickets</button>
              <button className="btn secondary" onClick={() => alert('Event details (stub)')}>Details</button>
            </div>
          </div>
        </article>

        <article className="event-card">
          <div className="event-head">
            <h3>Afterdark Cars & Coffee</h3>
            <div className="event-meta">Fri, 22 Nov • Parklands</div>
          </div>
          <div className="event-body">
            <p>Night meet with live DJ set, coffee roasters, merch pop-ups and rolling shots bay.</p>
            <div className="event-actions">
              <button className="btn" onClick={() => onOpenTicket(null)}>RSVP</button>
              <button className="btn secondary" onClick={() => alert('Event details (stub)')}>Details</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

/* ========================= PRICING ========================= */
function Pricing({ onOpenTicket }) {
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

/* ========================= SPONSORS (reuse grid styles) ========================= */
function Sponsors() {
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

/* ========================= GALLERY STRIP ========================= */
function GalleryStrip() {
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let anim;
    let pos = 0;
    const step = () => {
      pos += 0.5; // slow pan
      el.scrollLeft = pos;
      if (pos >= el.scrollWidth - el.clientWidth) pos = 0;
      anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    return () => cancelAnimationFrame(anim);
  }, []);

  return (
    <section className="section" aria-label="Gallery">
      <div className="container">
        <h2>Scenes from past meets</h2>
        <p className="sub">Rolling shots, paddock vibes & fans’ moments.</p>
      </div>

      <div
        ref={scrollerRef}
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: '10px',
          padding: '10px 4vw 0',
          scrollBehavior: 'smooth',
          maskImage: 'linear-gradient(90deg, transparent 0, black 6%, black 94%, transparent 100%)',
        }}
      >
        {GALLERY.concat(GALLERY).map((src, i) => (
          <img
            key={i}
            src={src}
            alt="RevMeet gallery"
            loading="lazy"
            style={{
              height: '220px',
              width: 'auto',
              borderRadius: '14px',
              objectFit: 'cover',
              flex: '0 0 auto',
              border: '1px solid rgba(255,255,255,.08)',
              filter: 'saturate(1.05) contrast(1.05)',
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ========================= FAQ (accordion, no extra CSS needed) ========================= */
function FAQ() {
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

/* ========================= CONTACT ========================= */
function Contact() {
  const [status, setStatus] = useState(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const msgRef = useRef(null);

  function submit(e) {
    e.preventDefault();
    setStatus('sending');
    // demo timeout
    setTimeout(() => setStatus('sent'), 800);
  }

  return (
    <section id="contact" className="section container">
      <h2>Contact</h2>
      <p className="sub">Questions, partnerships or media — reach out.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        <article className="card" style={{ gridColumn: 'span 7' }}>
          <form className="card-body" onSubmit={submit}>
            <div className="form-row">
              <label>Name<input ref={nameRef} placeholder="Jane Gearhead" required /></label>
              <label>Email<input ref={emailRef} type="email" placeholder="you@example.com" required /></label>
            </div>
            <div className="form-row">
              <label style={{ width: '100%' }}>Message
                <textarea ref={msgRef} rows="5" placeholder="How can we help?" style={{ width: '100%', resize: 'vertical' }} />
              </label>
            </div>
            <div className="actions">
              <button className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send'}</button>
              {status === 'sent' && <span className="pill">Thanks — we’ll reply soon.</span>}
            </div>
          </form>
        </article>

        <article className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-body">
            <div className="card-row" style={{ justifyContent: 'space-between' }}>
              <div className="model">HQ</div>
              <div className="pill">Nairobi</div>
            </div>
            <p className="muted-note">Whistling Morans Circuit, Athi River</p>

            <div className="card-row" style={{ marginTop: '.6rem', flexWrap: 'wrap', gap: '.6rem' }}>
              <span className="pill">hello@revmeet.example</span>
              <span className="pill">+254 700 000 000</span>
              <span className="pill">Mon–Fri</span>
            </div>

            <div className="actions" style={{ marginTop: '.6rem' }}>
              <button className="ghost" onClick={() => window.open('https://maps.google.com', '_blank')}>Open Maps</button>
              <a className="btn secondary" href="#pricing">Tickets & Pricing</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

/* ========================= FOOTER ========================= */
function SiteFooter() {
  return (
    <footer className="site-footer container">
      <div className="footer-grid">
        <div>
          <a className="brand footer-brand" href="#home">RevMeet</a>
          <p className="muted-note">Designed for car lovers — secure payments via M-Pesa, responsive UI and event reporting.</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p className="muted-note">hello@revmeet.example • Nairobi</p>
        </div>

        <div>
          <h4>Follow</h4>
          <p className="muted-note">Instagram • Twitter • Facebook</p>
        </div>
      </div>

      <div className="footer-bottom">© {new Date().getFullYear()} RevMeet — All rights reserved.</div>
    </footer>
  );
}

/* ========================= SCROLL TO TOP BTN (uses existing button styles) ========================= */
function ScrollTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 480);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <button
      className="btn"
      style={{
        position: 'fixed',
        right: '18px',
        bottom: '18px',
        zIndex: 60,
        paddingInline: '.9rem',
      }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}

/* ========================= MAIN HOME PAGE (export default) ========================= */
/** NOTE:
 * Navbar is **separate** (Navbar.jsx). Do not inline it here.
 * This page reuses your existing CSS utility classes to stay responsive.
 */
export default function Home() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketItem, setTicketItem] = useState(null);

  // Intersection Observer for subtle fade/slide reveal (no new CSS required)
  const ioRef = useRef(null);
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.transform = 'none';
          e.target.style.opacity = '1';
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    els.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      io.observe(el);
    });

    ioRef.current = io;
    return () => io.disconnect();
  }, []);

  function openTicket(item) {
    setTicketItem(item || { id: 'revmeet-weekend', model: 'RevMeet Weekend Track Day' });
    setTicketOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      {/* Navbar lives in its own file: <Navbar /> is mounted in App.jsx or your layout */}
      <main>
        <div data-reveal><Hero onGetTickets={() => openTicket(null)} /></div>
        <div data-reveal><FeaturedSection onOpenTicket={openTicket} /></div>
        <div data-reveal><Events onOpenTicket={openTicket} /></div>
        <div data-reveal><Pricing onOpenTicket={openTicket} /></div>
        <div data-reveal><Sponsors /></div>
        <div data-reveal><GalleryStrip /></div>
        <div data-reveal><FAQ /></div>
        <div data-reveal><Contact /></div>
        <SiteFooter />
      </main>

      <ScrollTop />
      <TicketModal open={ticketOpen} onClose={() => setTicketOpen(false)} item={ticketItem} />
    </>
  );
}

/* -------------------------
   Helpers
   ------------------------- */
function getCountdown(targetDate) {
  const t = targetDate.getTime() - Date.now();
  if (t <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((t / (1000 * 60)) % 60);
  const seconds = Math.floor((t / 1000) % 60);
  return { days, hours, minutes, seconds };
}
function pad(n) { return String(n).padStart(2, '0'); }
