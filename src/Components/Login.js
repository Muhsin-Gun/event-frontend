import React, { useState } from 'react';
import '../styles/home.css';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Login failed');
      }
      const body = await resp.json();
      // backend returns accessToken and refreshToken and user
      localStorage.setItem('authToken', body.accessToken);
      localStorage.setItem('refreshToken', body.refreshToken);
      if (onLoginSuccess) onLoginSuccess(body.user);
    } catch (e) {
      setErr(e.message || 'Login failed');
    } finally { setBusy(false); }
  }

  return (
    <form className="card-body" onSubmit={submit}>
      <h3>Sign In</h3>
      {err && <div className="alert error">{err}</div>}
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign In'}</button>
      </div>
    </form>
  );
}
