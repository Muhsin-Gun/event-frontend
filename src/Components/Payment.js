// Fixed Payment.js - Complete M-Pesa integration
import React, { useEffect, useState } from 'react';
import API_BASE from '../config/api';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('+254793027220');
  const [amount, setAmount] = useState('');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const eventId = params.get('eventId');
    if (eventId) loadEvent(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadEvent = async (id) => {
    try {
      const resp = await fetch(`${API_BASE}/api/events/${id}`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });
      if (resp.ok) {
        const body = await resp.json();
        const ev = body.data || body;
        setEvent(ev);
        if (ev.price) setAmount(ev.price);
      } else {
        console.warn('Failed to fetch event', resp.status);
      }
    } catch (err) {
      console.error('loadEvent error', err);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setMessage(null);

    const cleanedPhone = String(phone).replace(/\D/g, '');
    const amt = Number(String(amount).replace(/\D/g, ''));
    if (!cleanedPhone || !amt || amt <= 0) {
      setMessage({ type: 'error', text: 'Valid phone and amount required' });
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/payments/mpesa/stkpush`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          ...getAuthHeaders() 
        },
        body: JSON.stringify({
          eventId: event?._id,
          phone: cleanedPhone,
          payment: amt
        })
      });
      
      const body = await resp.json();
      if (resp.ok && body.success) {
        setMessage({ 
          type: 'success', 
          text: body.message || 'STK push initiated. Check your phone.' 
        });
        setAmount('');
      } else {
        setMessage({ 
          type: 'error', 
          text: body.message || 'Payment failed' 
        });
      }
    } catch (err) {
      console.error('Payment error', err);
      setMessage({ type: 'error', text: 'Network error. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{
      background: '#121212',
      minHeight: '100vh',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }}>
      <div style={{
        width: '100%',
        maxWidth: 560,
        background: '#1f1f2e',
        padding: 28,
        borderRadius: 12,
        border: '1px solid #333'
      }}>
        <h2 style={{ color: '#ffb703', marginTop: 0 }}>M-Pesa Payment</h2>

        {event && (
          <div style={{ marginBottom: 12, color: '#9fb0c1' }}>
            <strong>{event.title}</strong>
            <div style={{ fontSize: 13 }}>
              {event.location} • {event.date ? new Date(event.date).toLocaleString() : ''}
            </div>
          </div>
        )}

        {message && (
          <div style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
            color: message.type === 'success' ? '#ccffd8' : '#ffd1d1'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePayment} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ color: '#fff', fontSize: 13 }}>Phone (format: 2547xxxxxxxx)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="254712345678"
              required
              style={inputStyle()}
            />
          </div>

          <div>
            <label style={{ color: '#fff', fontSize: 13 }}>Amount (KES)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="1"
              required
              style={inputStyle()}
            />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)} 
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #555',
                background: 'transparent',
                color: '#fff'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: 8,
                border: 'none',
                background: loading ? '#555' : '#ff3b3b',
                color: '#fff',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Processing...' : 'Pay with M-Pesa'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function inputStyle() {
  return {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    background: '#333',
    border: '1px solid #555',
    color: '#fff',
    fontSize: 14
  };
}