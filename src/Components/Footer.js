import React from 'react';
import '../styles/home.css';

export default function SiteFooter() {
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
