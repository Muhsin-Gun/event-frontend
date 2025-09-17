import React, { useState } from 'react';
import '../styles/home.css';

const PLANS = [
  {
    id: 'gen',
    name: 'General Pass',
    priceUSD: 45,
    highlight: false,
    perks: ['Access to showcase', 'Pit-lane view', 'Food trucks access', 'Merch booths'],
  },
  {
    id: 'vip',
    name: 'VIP Pass',
    priceUSD: 150,
    highlight: true,
    perks: ['All General perks', 'VIP lounge', 'Priority pit access', 'Hot lap raffle entry'],
  },
  {
    id: 'team',
    name: 'Team / Exhibitor',
    priceUSD: 350,
    highlight: false,
    perks: ['2 VIP entries', 'Display slot', 'Brand mentions', 'Paddock parking'],
  },
];

function formatUSD(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function Pricing({ onOpenTicket }) {
  const [loadingPlan, setLoadingPlan] = useState(null); // id of plan being processed
  const [message, setMessage] = useState(null);

  // Direct STK push flow (simple experience)
  async function handleDirectPay(plan) {
    setMessage(null);

    // ask for phone quickly — replace with a proper modal if you want better UX
    let phone = window.prompt('Enter phone number to receive M-Pesa STK (e.g. +2547xxxxxxxx):');
    if (!phone) return;

    // sanitize
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.replace(/\D/g, '').length < 7) {
      setMessage({ type: 'error', text: 'Invalid phone number.' });
      return;
    }

    setLoadingPlan(plan.id);

    const payload = {
      eventId: plan.id || 'revmeet-weekend',
      phone: cleaned.replace(/\D/g, ''),
      amount: Math.round(plan.priceUSD),
      meta: { plan: plan.name },
    };

    try {
      const resp = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // read body if available
        const txt = await resp.text().catch(() => null);
        throw new Error(txt || 'Payment initiation failed');
      }

      const body = await resp.json().catch(() => ({}));
      // If backend returns something helpful, display it — otherwise show generic success
      setMessage({ type: 'success', text: body.message || 'STK Push initiated — check your phone to approve payment.' });
    } catch (err) {
      console.error('MPESA error:', err);
      // fall back to developer-friendly message
      setMessage({ type: 'warn', text: 'Could not reach payment endpoint — simulated success (dev). Please check backend.' });
    } finally {
      setLoadingPlan(null);
      // auto-clear after a while
      setTimeout(() => setMessage(null), 6500);
    }
  }

  return (
    <section id="pricing" className="section pricing-section container">
      <h2>Tickets & Pricing</h2>
      <p className="sub">Simple passes for every fan. All prices are shown in USD (demo). Click a card to open the ticket modal or use direct M-Pesa checkout.</p>

      {message && <div className={`alert ${message.type === 'error' ? 'error' : message.type === 'success' ? 'success' : 'warn'}`} style={{ marginTop: 12 }}>{message.text}</div>}

      <div className="pricing-grid" style={{ marginTop: 18 }}>
        {PLANS.map(plan => (
          <article key={plan.id} className={`pricing-card ${plan.highlight ? 'featured' : ''}`} tabIndex="0" aria-label={`${plan.name} card`}>
            {plan.highlight && <div className="ribbon">Recommended</div>}

            <div className="pricing-head">
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{formatUSD(plan.priceUSD)}</div>
            </div>

            <ul className="plan-perks" aria-hidden={false}>
              {plan.perks.map((p, i) => <li key={i}>{p}</li>)}
            </ul>

            <div className="pricing-cta">
              {/* Open the existing ticket modal if provided (keeps your current flow intact) */}
              <button
                className="btn buy-btn"
                onClick={() => onOpenTicket && onOpenTicket({ id: plan.id, model: plan.name })}
                title="Reserve via ticket modal"
                aria-label={`Open ticket modal for ${plan.name}`}
              >
                Reserve
              </button>

              {/* Direct M-Pesa pay */}
              <button
                className="btn ghost mpesa-btn"
                onClick={() => handleDirectPay(plan)}
                disabled={loadingPlan === plan.id}
                aria-label={`Pay with M-Pesa for ${plan.name}`}
              >
                {loadingPlan === plan.id ? 'Processing…' : 'Pay with M-Pesa'}
              </button>
            </div>

            <div className="plan-foot">
              <small>{plan.highlight ? 'VIP access includes lounge & priority' : 'Limited seats — early purchase recommended.'}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}


