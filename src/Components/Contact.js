// src/Components/Contact.js
import React, { useRef, useState } from 'react';
import '../styles/home.css';

export default function Contact() {
  const [status, setStatus] = useState(null);
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const msgRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');

    const payload = {
      name: nameRef.current.value,
      email: emailRef.current.value,
      message: msgRef.current.value,
    };

    try {
      const resp = await fetch('/api/contact', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Network response was not ok');
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <section id="contact" className="section container">
      <h2>Contact</h2>
      <p className="sub">Questions, partnerships or media — reach out.</p>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: '1rem' }}>
        <article className="card" style={{ gridColumn: 'span 7' }}>
          <form className="card-body" onSubmit={submit}>
            <div className="form-row">
              <label>Name<input ref={nameRef} placeholder="Jane Gearhead" required /></label>
              <label>Email<input ref={emailRef} type="email" placeholder="you@example.com" required /></label>
            </div>
            <div className="form-row">
              <label style={{ width: '100%' }}>Message
                <textarea ref={msgRef} rows="5" placeholder="How can we help?" style={{ width: '100%', resize: 'vertical' }} />
              </label>
            </div>
            <div className="actions">
              <button className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Send'}</button>
              {status === 'sent' && <span className="pill">Thanks — we’ll reply soon.</span>}
              {status === 'error' && <span className="pill" style={{ background: '#fdd' }}>Send failed — try again.</span>}
            </div>
          </form>
        </article>

        <article className="card" style={{ gridColumn: 'span 5' }}>
          <div className="card-body">
            <div className="card-row" style={{ justifyContent: 'space-between' }}>
              <div className="model">HQ</div>
              <div className="pill">Nairobi</div>
            </div>
            <p className="muted-note">Whistling Morans Circuit, Athi River</p>

            <div className="card-row" style={{ marginTop: '.6rem', flexWrap: 'wrap', gap: '.6rem' }}>
              <span className="pill">hello@revmeet.example</span>
              <span className="pill">+254 700 000 000</span>
              <span className="pill">Mon–Fri</span>
            </div>

            <div className="actions" style={{ marginTop: '.6rem' }}>
              <button className="ghost" onClick={() => window.open('https://maps.google.com', '_blank')}>Open Maps</button>
              <a className="btn secondary" href="/pricing">Tickets & Pricing</a>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
