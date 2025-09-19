// src/Components/ClientDashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css'; // keep your existing styles

const API_BASE = 'http://localhost:5000';
const DEFAULT_PHONE = '+254793027220';

export default function ClientDashboard() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  // Events state
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState('');

  // Payment UI state
  const [paying, setPaying] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  // Auth modal state (improved formatting)
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    setRole(localStorage.getItem('userRole') || null);
    setUsername(localStorage.getItem('username') || null);
    loadEvents();
    // eslint-disable-next-line
  }, []);

  async function loadEvents() {
    setLoadingEvents(true);
    setEventError('');
    try {
      const res = await fetch(`${API_BASE}/api/events?limit=6`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();

      // Accept various backend shapes: array, { data: [] }, { events: [] }
      if (!res.ok) {
        // backend may return message
        throw new Error(json?.message || json?.error || 'Failed to fetch events');
      }

      if (Array.isArray(json)) setEvents(json);
      else if (Array.isArray(json.data)) setEvents(json.data);
      else if (Array.isArray(json.events)) setEvents(json.events);
      else setEvents([]);
    } catch (err) {
      console.error('loadEvents error', err);
      setEventError(err.message || 'Failed to load events');
    } finally {
      setLoadingEvents(false);
    }
  }

  // Payment using configured phone (DEFAULT_PHONE) and backend route
  async function handlePayment(id, amount) {
    setPaying(prev => ({ ...prev, [id]: true }));
    setSuccessMessages(prev => ({ ...prev, [id]: '' }));
    setErrorMessages(prev => ({ ...prev, [id]: '' }));

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/payments/mpesa/stkpush`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ phoneNumber: DEFAULT_PHONE, amount })
      });

      const json = await res.json();

      if (res.ok) {
        setSuccessMessages(prev => ({ ...prev, [id]: 'STK Push initiated. Check your phone to complete payment.' }));
      } else {
        const message = json?.message || json?.error || 'Payment failed. Please try again.';
        setErrorMessages(prev => ({ ...prev, [id]: message }));
      }
    } catch (err) {
      console.error('handlePayment error', err);
      setErrorMessages(prev => ({ ...prev, [id]: 'Network error. Please try again.' }));
    } finally {
      setPaying(prev => ({ ...prev, [id]: false }));
    }
  }

  // REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authData.username,
          email: authData.email,
          password: authData.password,
          role: 'client'
        })
      });
      const json = await res.json();
      if (res.ok) {
        // Some backends return token on register; if so, store it.
        if (json.token) {
          localStorage.setItem('token', json.token);
          setToken(json.token);
        }
        if (json.user?.username) {
          localStorage.setItem('username', json.user.username);
          setUsername(json.user.username);
        }
        if (json.user?.role) {
          localStorage.setItem('userRole', json.user.role);
          setRole(json.user.role);
        }

        setShowRegisterModal(false);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        // friendly confirmation
        alert('Registration successful. You can now login (if not auto-logged in).');
      } else {
        throw new Error(json?.message || json?.error || 'Registration failed');
      }
    } catch (err) {
      console.error('register error', err);
      alert(err.message || 'Registration error');
    } finally {
      setAuthLoading(false);
    }
  };

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: authData.email,
          password: authData.password
        })
      });
      const json = await res.json();
      if (res.ok && json.token) {
        localStorage.setItem('token', json.token);
        if (json.user?.role) localStorage.setItem('userRole', json.user.role);
        if (json.user?.username) localStorage.setItem('username', json.user.username);

        setToken(json.token);
        setRole(json.user?.role || null);
        setUsername(json.user?.username || null);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        alert('Login successful');
      } else {
        throw new Error(json?.message || json?.error || 'Login failed');
      }
    } catch (err) {
      console.error('login error', err);
      alert(err.message || 'Login error');
    } finally {
      setAuthLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    setToken('');
    setRole(null);
    setUsername(null);
    setAuthData({ username: '', email: '', password: '' });
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  // Simple modal styling (keeps existing CSS but provides inline fallback)
  const modalOverlayStyle = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200
  };
  const modalBoxStyle = {
    background: '#1f1f2e', borderRadius: 8, padding: 22, width: '100%', maxWidth: 420, border: '1px solid #333', color: '#fff'
  };
  const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: 12, borderRadius: 8, background: '#333', border: '1px solid #555', color: '#fff' };
  const btnPrimary = { background: '#ff3b3b', color: '#fff', padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer' };
  const btnSecondary = { background: 'transparent', color: '#ffb703', padding: '10px 14px', borderRadius: 8, border: '2px solid #ffb703', cursor: 'pointer' };

  return (
    <section className="section client-landing" style={{ padding: '40px 12px' }}>
      <div className="container" style={{ textAlign: 'center', maxWidth: 1100, margin: '0 auto' }}>
        {/* HERO / CLIENT LANDING - preserved from your original file */}
        <h1 style={{ color: 'var(--accent-2, #ffb703)', fontWeight: 900 }}>CLIENT</h1>
        <p className="muted-note">Don’t miss the latest updates — sign up or log in to reserve tickets and view deals.</p>

        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Keep Login/Register links visible and well formatted */}
          {token ? (
            <>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn" onClick={() => setShowLoginModal(false)} style={btnSecondary}>Signed in: {username || 'Account'}</button>
                <button className="btn" onClick={handleLogout} style={btnPrimary}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => setShowLoginModal(true)} style={btnPrimary}>Login</button>
              <button className="btn secondary" onClick={() => setShowRegisterModal(true)} style={btnSecondary}>Register</button>
            </>
          )}
        </div>

        <div style={{ marginTop: 26 }}>
          {/* Events button preserved (keeps original behaviour) */}
          <Link to="/home" className="btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ffb703', color: '#121212', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>
            <strong>Events</strong>
            <span aria-hidden>→</span>
          </Link>
        </div>

        <p className="muted-note" style={{ marginTop: 14 }}>Click Events to open the full event frontend in the main UI.</p>

        {/* EVENTS SECTION (keeps the event listing you want visible on the same page) */}
        <div style={{ marginTop: 36, textAlign: 'left' }}>
          <h2 style={{ color: '#fff', marginBottom: 12 }}>Latest Events</h2>

          {loadingEvents && <p style={{ color: '#9fb0c1' }}>Loading events...</p>}
          {eventError && <p style={{ color: '#ff6b6b' }}>{eventError}</p>}
          {!loadingEvents && !eventError && events.length === 0 && <p style={{ color: '#9fb0c1' }}>No events available at the moment. Check back soon!</p>}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, marginTop: 16 }}>
            {events.map(ev => {
              const id = ev._id || ev.id || ev._id;
              return (
                <article key={id} style={{ background: '#1f1f2e', borderRadius: 12, padding: 18, border: '1px solid #333' }}>
                  <div style={{ marginBottom: 10 }}>
                    <h3 style={{ color: '#ffb703', margin: '0 0 8px 0' }}>{ev.title}</h3>
                    <div style={{ color: '#9fb0c1', fontSize: 14 }}>{new Date(ev.date).toLocaleDateString ? new Date(ev.date).toLocaleDateString() : ev.date} • {ev.location}</div>
                  </div>
                  <p style={{ color: '#9fb0c1', marginBottom: 12 }}>{ev.description}</p>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ color: '#fff', fontWeight: '700' }}>{ev.price ? `KES ${ev.price}` : 'Free'}</div>
                    <div style={{ marginLeft: 'auto' }}>
                      <button
                        onClick={() => handlePayment(id, ev.price || 0)}
                        disabled={!!paying[id]}
                        style={{ ...btnPrimary, opacity: paying[id] ? 0.7 : 1 }}
                      >
                        {paying[id] ? 'Processing...' : 'Pay with M-Pesa'}
                      </button>
                    </div>
                  </div>

                  {errorMessages[id] && <div style={{ color: '#ff6b6b' }}>{errorMessages[id]}</div>}
                  {successMessages[id] && <div style={{ color: '#63d68e' }}>{successMessages[id]}</div>}

                  <div style={{ marginTop: 10 }}>
                    <Link to={`/events/${id}`} className="btn secondary" style={{ textDecoration: 'none', padding: '8px 12px', borderRadius: 6, border: '1px solid #555', color: '#ffb703', background: 'transparent' }}>
                      Details
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* My Tickets */}
        <div style={{ marginTop: 30 }}>
          <div style={{ background: '#1f1f2e', borderRadius: 12, padding: 18, border: '1px solid #333' }}>
            <h5 style={{ color: '#ffb703', margin: 0 }}>My Tickets</h5>
            <p style={{ color: '#9fb0c1', marginTop: 8 }}>Coming Soon</p>
          </div>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowLoginModal(false); }}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#ffb703' }}>Client Login</h3>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 20 }}>×</button>
            </div>

            <form onSubmit={handleLogin}>
              <input required type="email" placeholder="Email" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} style={inputStyle} />
              <input required type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="submit" disabled={authLoading} style={btnPrimary}>{authLoading ? 'Signing in...' : 'Sign In'}</button>
                <button type="button" onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} style={btnSecondary}>Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegisterModal && (
        <div style={modalOverlayStyle} onClick={() => { setShowRegisterModal(false); }}>
          <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3 style={{ margin: 0, color: '#ffb703' }}>Create Your Account</h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 20 }}>×</button>
            </div>

            <form onSubmit={handleRegister}>
              <input required type="text" placeholder="Username" value={authData.username} onChange={e => setAuthData({ ...authData, username: e.target.value })} style={inputStyle} />
              <input required type="email" placeholder="Email" value={authData.email} onChange={e => setAuthData({ ...authData, email: e.target.value })} style={inputStyle} />
              <input required type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({ ...authData, password: e.target.value })} style={inputStyle} />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
                <button type="button" onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} style={btnSecondary}>Already have an account?</button>
                <button type="submit" disabled={authLoading} style={btnPrimary}>{authLoading ? 'Creating...' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
