import React, { useState } from 'react';
import '../styles/home.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus('sending');
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const body = await resp.json();
      // backend returns 'link' for dev convenience; don't rely on it in production
      setStatus('sent');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  return (
    <form className="card-body" onSubmit={submit}>
      <h3>Forgot password</h3>
      {status === 'sent' && <div className="alert success">If that account exists, a reset link was sent.</div>}
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <div className="actions">
        <button className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send reset link'}</button>
      </div>
    </form>
  );
}
