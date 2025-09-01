import React, { useEffect, useRef, useState } from 'react';
import '../styles/home.css';

const NAV_LINKS = [
  { href: '#events', label: 'Events' },
  { href: '#showcase', label: 'Showcase' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={navRef} role="navigation" aria-label="Primary">
      <div className="container nav-inner">
        <a className="brand" href="#home" aria-label="RevMeet home">
          <span className="brand-mark" aria-hidden="true" />
          RevMeet
        </a>

        <button
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-menu"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav id="primary-menu" className={`nav-links ${open ? 'open' : ''}`}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <div className="nav-cta" style={{ marginTop: '.4rem' }}>
            <a className="btn secondary" href="#login">Sign In</a>
            <a className="btn" href="#get-tickets">Get Tickets</a>
          </div>
        </nav>

        <div className="nav-cta nav-cta-desktop" aria-hidden>
          <a className="btn secondary" href="#login">Sign In</a>
          <a className="btn" href="#get-tickets">Get Tickets</a>
        </div>
      </div>
    </header>
  );
}