// src/Components/Events.js
import React from 'react';
import '../styles/home.css';

export default function Events({ onOpenTicket }) {
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

