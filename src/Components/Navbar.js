// src/Components/Navbar.js
import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../styles/home.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/showcase', label: 'Showcase' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
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

  // mobile: close menu but DO NOT remove navbar from page (keeps it persistent)
  function onNavClick() {
    setOpen(false);
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
            <NavLink
              key={l.to}
              to={l.to}
              onClick={onNavClick}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {l.label}
            </NavLink>
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
