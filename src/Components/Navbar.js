// src/Components/Navbar.js
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/home.css';

const NAV_LINKS = [
  { to: 'home', label: 'Home' },
  { to: 'events', label: 'Events' },
  { to: 'showcase', label: 'Showcase' },
  { to: 'pricing', label: 'Pricing' },
  { to: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  function onNavClick() {
    setOpen(false);
  }

  // Smooth scroll handler: if on homepage, scroll to section; otherwise navigate to home then scroll.
  async function handleAnchorClick(e, id) {
    e.preventDefault();
    onNavClick();
    if (location.pathname !== '/') {
      // navigate home first, then scroll when DOM ready
      navigate('/');
      // delay to allow Home to mount. Using requestAnimationFrame + setTimeout small delay.
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`} ref={navRef} role="navigation" aria-label="Primary">
      <div className="container nav-inner">
        <Link to="/" className="brand" aria-label="RevMeet home" onClick={onNavClick}>
          <span className="brand-mark" aria-hidden="true" /> RevMeet
        </Link>

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
            <a
              key={l.to}
              href={`#${l.to}`}
              onClick={(e) => handleAnchorClick(e, l.to)}
            >
              {l.label}
            </a>
          ))}

          <div className="nav-cta" style={{ marginTop: '.4rem' }}>
            <Link className="btn secondary" to="/login" onClick={onNavClick}>Sign In</Link>
            <Link className="btn" to="/payment" onClick={onNavClick}>Get Tickets</Link>
          </div>
        </nav>

        <div className="nav-cta nav-cta-desktop" aria-hidden>
          <Link className="btn secondary" to="/login">Sign In</Link>
          <Link className="btn" to="/payment">Get Tickets</Link>
        </div>
      </div>
    </header>
  );
}

