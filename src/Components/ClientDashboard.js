// src/Components/ClientDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function ClientDashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem('userRole') || null);
  }, []);

  return (
    <section className="section client-landing" style={{ padding: '40px 12px' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ color: 'var(--accent-2, #ffb703)', fontWeight: 900 }}>CLIENT</h1>
        <p className="muted-note">Don’t miss the latest updates — sign up or log in to reserve tickets and view deals.</p>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link to="/login" className="btn">Login</Link>
          <Link to="/register" className="btn secondary">Register</Link>
        </div>

        <div style={{ marginTop: 26 }}>
          {/* Use the real route for your event frontend here ("/home" or "/events") */}
          <Link to="/home" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <strong>Events</strong>
            <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="muted-note" style={{ marginTop: 14 }}>Click Events to open the full event frontend in the main UI.</p>
      </div>
    </section>
  );
}

