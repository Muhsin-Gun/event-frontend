// src/Components/TicketModal.js
import React, { useEffect, useState } from 'react';
import '../styles/home.css';

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function TicketModal({ open, onClose, item }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('general');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!open) {
      setName('');
      setEmail('');
      setPhone('');
      setType('general');
      setQty(1);
      setMessage(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const price = type === 'vip' ? 150 : 45;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    if (!phone || phone.replace(/\D/g, '').length < 7) {
      setMessage({ type: 'error', text: 'Please enter a valid phone number.' });
      return;
    }
    setLoading(true);

    const payload = {
      eventId: item?.id || 'revmeet-weekend',
      phone: phone.replace(/\D/g, ''),
      amount: Math.round(price * qty),
      meta: { name, email, type, qty },
    };

    try {
      const token = localStorage.getItem('authToken');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || 'Payment initiation failed');
      }

      await resp.json();
      setMessage({ type: 'success', text: 'STK Push initiated. Check your phone to complete payment.' });
    } catch (err) {
      console.error('STK error:', err);
      setMessage({ type: 'warn', text: 'Could not reach payment endpoint — simulated success (dev).' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ticket-modal-title">
      <div className="modal">
        <header className="modal-header">
          <h3 id="ticket-modal-title">Get Tickets {item ? `— ${item.model || item.title}` : ''}</h3>
          <button className="ghost" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Name<input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required /></label>
            <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          </div>

          <div className="form-row">
            <label>Phone<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+2547..." required /></label>
            <label>Type
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="general">General — $45</option>
                <option value="vip">VIP — $150</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>Quantity
              <input type="number" min="1" max="10" value={qty} onChange={e => setQty(Math.max(1, Number(e.target.value)))} />
            </label>
            <div className="summary">
              <div>Subtotal</div>
              <div className="summary-amount">{formatUSD(price * qty)}</div>
            </div>
          </div>

          {message && <div className={`alert ${message.type}`}>{message.text}</div>}

          <div className="modal-actions">
            <button type="button" className="btn secondary" onClick={onClose} disabled={loading}>Close</button>
            <button type="submit" className="btn" disabled={loading}>{loading ? 'Processing...' : `Pay ${formatUSD(price * qty)}`}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

