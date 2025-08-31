import React, { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { href: '#events', label: 'Events' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

const FEATURED_CARS = [
  {
    id: 'f488p',
    model: 'Ferrari 488 Pista',
    priceUSD: 330000,  // indicative MSRP
    power: '710 hp',
    zeroTo100: '2.9s',
    img: 'https://source.unsplash.com/PHvx-TEKbRU/1600x1000',
    credit: 'Unsplash: Sai Kalyan Achanta',
  },
  {
    id: 'lambo-avj',
    model: 'Lamborghini Aventador SVJ',
    priceUSD: 517000,
    power: '770 hp',
    zeroTo100: '2.8s',
    img: 'https://source.unsplash.com/31fqICh0Q1I/1600x1000',
    credit: 'Unsplash: Wes Tindel',
  },
  {
    id: 'p911gt3rs',
    model: 'Porsche 911 GT3 RS',
    priceUSD: 241000,
    power: '518 hp',
    zeroTo100: '3.0s',
    img: 'https://source.unsplash.com/eUDs6kqCxig/1600x1000',
    credit: 'Unsplash',
  },
  {
    id: 'mcl-720s',
    model: 'McLaren 720S',
    priceUSD: 315000,
    power: '710 hp',
    zeroTo100: '2.8s',
    img: 'https://source.unsplash.com/3zevxXFlL_s/1600x1000',
    credit: 'Unsplash: Micael Sáez',
  },
  {
    id: 'mcl-720s-white',
    model: 'McLaren 720S (Track Pack)',
    priceUSD: 335000,
    power: '710 hp',
    zeroTo100: '2.8s',
    img: 'https://source.unsplash.com/gNi9bw6f9iA/1600x1000',
    credit: 'Unsplash',
  },
  {
    id: 'f488p-red',
    model: 'Ferrari 488 (Display Spec)',
    priceUSD: 290000,
    power: '661 hp',
    zeroTo100: '3.0s',
    img: 'https://source.unsplash.com/FBZke4rUUeo/1600x1000',
    credit: 'Unsplash: Sai Kalyan Achanta',
  },
];

function formatUSD(n){
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }).format(n);
}

/* ========================= NAVBAR ========================= */
function Navbar(){
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(()=>{
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive:true });
    return () => window.removeEventListener('scroll', onScroll);
  },[]);

  useEffect(()=>{
    const onKey = (e)=>{ if(e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[]);

  return (
    <div className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={navRef} role="navigation" aria-label="Primary">
      <div className="container nav-inner">
        <a className="brand" href="#home" aria-label="RevMeet home">
          <span className="brand-mark" aria-hidden="true"></span>
          RevMeet
        </a>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={()=> setOpen(o=>!o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>

        <div id="primary-menu" className={`nav-links ${open ? 'open' : ''}`}>
          {NAV_LINKS.map(l=>(
            <a key={l.href} href={l.href} onClick={()=> setOpen(false)}>{l.label}</a>
          ))}
          <div className="nav-cta" style={{marginTop:'.4rem'}}>
            <a className="btn secondary" href="#login">Sign In</a>
            <a className="btn" href="#get-tickets">Get Tickets</a>
          </div>
        </div>

        <div className="nav-cta" aria-hidden>
          <a className="btn secondary" href="#login">Sign In</a>
          <a className="btn" href="#get-tickets">Get Tickets</a>
        </div>
      </div>
    </div>
  );
}

/* ========================= HOME ========================= */
function Hero(){
  return (
    <section id="home" className="hero">
      <div className="container hero-grid">
        <div>
          <p className="kicker">Luxury & Supercar Meetup • Nairobi</p>
          <h1 className="h1">Where horsepower meets <span style={{color:'var(--accent-2)'}}>hype</span>.</h1>
          <p className="lede">
            High-octane meetups, dealership showcases, and exclusive test-drive experiences.
            Discover upcoming events, reserve tickets, and explore our curated supercar lineup.
          </p>
          <div className="hero-cta">
            <a className="btn" href="#events">Browse Events</a>
            <a className="btn secondary" href="#showcase">Explore Showcase</a>
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
            <span>Sat, 26 Oct • 10:00</span>
            <span>Whistling Morans, Athi River</span>
          </div>
          <div className="meta" style={{marginTop:'.2rem'}}>
            <span>VIP from {formatUSD(150)}</span>
            <span>General {formatUSD(45)}</span>
          </div>
          <div className="hero-cta">
            <a className="btn" href="#get-tickets">Get Tickets</a>
            <button className="ghost">Add to Calendar</button>
          </div>
          <p style={{color:'var(--muted)', margin:'4px 0 0', fontSize:'.92rem'}}>
            Static hero per NN/g usability guidance (no auto-rotating carousel).
          </p>
        </aside>
      </div>
    </section>
  );
}

function FeaturedCars(){
  return (
    <section id="showcase" className="section container">
      <h2>Featured Supercars</h2>
      <p className="sub">Curated lineup for upcoming meets. Prices are indicative MSRP.</p>

      <div className="grid">
        {FEATURED_CARS.map(car=>(
          <article key={car.id} className="card" tabIndex="0" aria-label={`${car.model} card`}>
            <img className="card-img" src={car.img} alt={car.model} loading="lazy" />
            <div className="card-body">
              <div className="card-row">
                <div className="model">{car.model}</div>
                <div className="price">{formatUSD(car.priceUSD)} <small>MSRP</small></div>
              </div>
              <div className="card-row" style={{gap:'.4rem', flexWrap:'wrap'}}>
                <span className="pill">Power: {car.power}</span>
                <span className="pill">0–100: {car.zeroTo100}</span>
              </div>
              <div className="actions">
                <a className="btn" href="#get-tickets">See at Event</a>
                <button className="ghost">Details</button>
              </div>
              <div style={{marginTop:'.4rem', color:'#7d90a3', fontSize:'.8rem'}}>{car.credit}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function App(){
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedCars />
      <footer className="section" id="contact" style={{background:'linear-gradient(180deg, #0b0f14, #0a0e13)'}}>
        <div className="container" style={{display:'grid', gap:'10px'}}>
          <h3 style={{margin:0}}>RevMeet</h3>
          <p style={{color:'var(--muted)', margin:0}}>
            © {new Date().getFullYear()} RevMeet. Built for your student assignment — integrates with your Node/Express backend (Auth, Events, Payments) next.
          </p>
        </div>
      </footer>
    </>
  );
}
