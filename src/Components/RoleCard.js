// src/Components/RoleCards.js
import React from 'react';

// RoleCards (plain .js) — layout: two cards side-by-side (Admin, Employee) and Client centered below.
// Each card now uses the same orange color (client color) per your request.

export const ROLE_CARDS = [
  { key: 'admin', label: 'ADMIN', subtitle: 'Manage events, users & reports', to: '/admin', color: '#ff8a00' },
  { key: 'employee', label: 'EMPLOYEE', subtitle: 'Add events & handle sales', to: '/employee', color: '#ff8a00' },
  { key: 'client', label: 'CLIENT', subtitle: 'Browse events & buy tickets', to: '/client', color: '#ff8a00' },
];

export default function RoleCards() {
  function handleAnchorClick(e, to) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) return;
    e.preventDefault();
    try {
      window.history.pushState({}, '', to);
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err) {
      window.location.href = to;
    }
  }

  return (
    <section className="role-cards-section" aria-label="Role selection">
      <div className="role-cards-grid">
        {/* Top row: Admin & Employee */}
        <a
          href={ROLE_CARDS[0].to}
          className="role-card role-admin"
          onClick={(e) => handleAnchorClick(e, ROLE_CARDS[0].to)}
          aria-label={`Open ${ROLE_CARDS[0].label} dashboard`}
        >
          <div className="role-card-inner">
            <div className="role-title-wrap">
              <div className="role-title">{ROLE_CARDS[0].label}</div>
              <div className="role-sub">{ROLE_CARDS[0].subtitle}</div>
            </div>
            <div className="role-cta">Enter →</div>
          </div>
        </a>

        <a
          href={ROLE_CARDS[1].to}
          className="role-card role-employee"
          onClick={(e) => handleAnchorClick(e, ROLE_CARDS[1].to)}
          aria-label={`Open ${ROLE_CARDS[1].label} dashboard`}
        >
          <div className="role-card-inner">
            <div className="role-title-wrap">
              <div className="role-title">{ROLE_CARDS[1].label}</div>
              <div className="role-sub">{ROLE_CARDS[1].subtitle}</div>
            </div>
            <div className="role-cta">Enter →</div>
          </div>
        </a>

        {/* Middle row: Client centered */}
        <a
          href={ROLE_CARDS[2].to}
          className="role-card role-client role-client-centered"
          onClick={(e) => handleAnchorClick(e, ROLE_CARDS[2].to)}
          aria-label={`Open ${ROLE_CARDS[2].label} dashboard`}
        >
          <div className="role-card-inner">
            <div className="role-title-wrap">
              <div className="role-title">{ROLE_CARDS[2].label}</div>
              <div className="role-sub">{ROLE_CARDS[2].subtitle}</div>
            </div>
            <div className="role-cta">Enter →</div>
          </div>
        </a>
      </div>

      <style>{`
        .role-cards-section { padding: 40px 12px; }
        .role-cards-grid { width: min(1100px, 94vw); margin: 0 auto; display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); grid-auto-rows: minmax(160px, auto); }

        /* Place client as full-width row below and center it visually */
        .role-client-centered { grid-column: 1 / -1; justify-self: center; width: 60%; }

        .role-card { display: block; text-decoration: none; color: inherit; border-radius: 14px; padding: 26px; min-height: 180px; box-shadow: 0 10px 30px rgba(0,0,0,.35); border: 1px solid rgba(255,255,255,.04); transition: transform .28s ease, box-shadow .28s ease; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.08)); }
        .role-card:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 28px 60px rgba(0,0,0,.5); }

        .role-card-inner { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .role-title { font-size: clamp(1.8rem, 4.6vw, 2.8rem); font-weight: 900; }
        .role-sub { color: rgba(255,255,255,.8); font-weight:600; margin-top:6px; font-size: .95rem; }
        .role-title-wrap { display:flex; flex-direction:column; }
        .role-cta { font-weight:800; opacity:.95; }

        /* Colors: all cards use the client orange */
        .role-admin, .role-employee, .role-client { background: linear-gradient(180deg, rgba(255,138,0,0.14), rgba(255,138,0,0.06)); color: #fff7ef; }

        .role-card:focus { outline: 4px solid rgba(255,183,3,.12); outline-offset: 6px; }

        @media (max-width: 880px) {
          .role-cards-grid { grid-template-columns: 1fr; }
          .role-client-centered { width: 100%; }
          .role-card { min-height: 160px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .role-card { transition: none !important; transform: none !important; }
        }
      `}</style>
    </section>
  );
}
