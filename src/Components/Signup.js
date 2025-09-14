import React, { useState } from 'react';
import '../styles/home.css';

export default function Signup({ onSignupSuccess }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      if (!resp.ok) throw new Error(await resp.text());
      const body = await resp.json();
      setMsg({ type: 'success', text: 'Registered. You may now sign in.' });
      if (onSignupSuccess) onSignupSuccess(body.user);
    } catch (e) {
      setMsg({ type: 'error', text: e.message || 'Register failed' });
    } finally { setBusy(false); }
  }

  return (
    <form className="card-body" onSubmit={submit}>
      <h3>Sign Up</h3>
      {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}
      <label>Username<input value={username} onChange={e=>setUsername(e.target.value)} required /></label>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
      <div className="actions">
        <button className="btn" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</button>
      </div>
    </form>
  );
}
