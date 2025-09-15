// src/Components/Hero.js
import React, { useEffect, useMemo, useState } from 'react';
import '../styles/home.css';

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
function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function Hero({ onGetTickets }) {
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


