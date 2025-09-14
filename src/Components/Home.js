// src/Components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Gallery from './Gallery';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="kicker">Welcome to EventOrg</p>
            <h1 className="h1">Experience Aura of Events</h1>
            <p className="lede">Join the ultimate event organizing platform. Create and manage events seamlessly.</p>
            <div className="hero-cta">
              <Link to="/events" className="btn">View Events</Link>
              <Link to="/contact" className="btn secondary">Contact Us</Link>
            </div>
          </div>
          <div className="hero-card">
            <span className="badge">Featured Event</span>
            <h3>Event Title</h3>
            <p>Event description goes here.</p>
            <div className="featured-actions">
              <Link to="/events" className="btn">Join Now</Link>
            </div>
          </div>
        </div>
      </section>
      <Gallery />
    </>
  );
}
