// EmployeeDashboard.js (updated)
import React, { useEffect, useState } from 'react';
import API_BASE from '../config/api';

export default function EmployeeDashboard() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: ''
  });
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Login modal states
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Pending create payload
  const [pendingCreatePayload, setPendingCreatePayload] = useState(null);

  const employeeName = localStorage.getItem('username') || 'Employee';

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token') || '';

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  };

  const parseEventsResponse = (json) => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.events)) return json.events;
    if (json.items && Array.isArray(json.items)) return json.items;
    if (json.success && Array.isArray(json.data)) return json.data;
    return [];
  };

  const loadEvents = async () => {
    setLoadingEvents(true);
    setMessage(null);

    try {
      const resp = await fetch(`${API_BASE}/api/events`, {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const json = await resp.json().catch(() => null);

      if (!resp.ok) {
        const text = (json && (json.message || json.error)) || `Failed to load events (status ${resp.status})`;
        setMessage({ type: 'error', text });
        setEvents([]);
        return;
      }

      const list = parseEventsResponse(json);
      setEvents(list);
    } catch (err) {
      console.error('Load events error', err);
      setMessage({ type: 'error', text: 'Network error while loading events' });
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const createEvent = async (payload) => {
    setSubmitting(true);
    setMessage(null);
    const token = getAuthToken();

    if (!token) {
      setPendingCreatePayload(payload);
      setShowLoginModal(true);
      setSubmitting(false);
      setMessage({ type: 'error', text: 'Not authenticated. Please log in to create events.' });
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload)
      });

      const body = await resp.json().catch(() => ({}));

      // DEBUG: log status & body to help backend inspection
      console.debug('Create event response', resp.status, body);

      if (resp.ok) {
        setMessage({ type: 'success', text: 'Event created successfully' });
        setFormData({ title: '', description: '', date: '', location: '', price: '' });

        // If backend returned the created event, figure it out and add to local list
        const created = body.data || body.event || (body.success && body.data) || body || null;
        if (created && (created._id || created.id || (Array.isArray(created) && created.length))) {
          // if created is array, take first
          const newEvent = Array.isArray(created) ? created[0] : created;
          setEvents(prev => [newEvent, ...prev]);
        }

        // notify other components (Events.js) to reload from server
        window.dispatchEvent(new CustomEvent('events:changed', { detail: { action: 'create' } }));

        // bump refresh key to also re-fetch in this component
        setRefreshKey(k => k + 1);
        setPendingCreatePayload(null);
      } else {
        const text = body.message || body.error || `Failed to create event (status ${resp.status})`;
        if (resp.status === 401 || /auth/i.test(text)) {
          setPendingCreatePayload(payload);
          setShowLoginModal(true);
        }
        setMessage({ type: 'error', text });
      }
    } catch (err) {
      console.error('Create event error', err);
      setMessage({ type: 'error', text: 'Network error while creating event' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.location) {
      setMessage({ type: 'error', text: 'Title, date and location are required' });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      date: formData.date,
      location: formData.location,
      price: formData.price ? Number(formData.price) : 0
    };

    createEvent(payload);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;

    setMessage(null);
    const token = getAuthToken();

    if (!token) {
      setMessage({ type: 'error', text: 'Not authenticated. Please log in to delete events.' });
      setShowLoginModal(true);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });

      const body = await resp.json().catch(() => ({}));
      console.debug('Delete response', resp.status, body);

      if (resp.ok) {
        setMessage({ type: 'success', text: 'Event deleted' });
        // remove locally if present
        setEvents(prev => prev.filter(ev => (ev._id || ev.id) !== eventId));
        window.dispatchEvent(new CustomEvent('events:changed', { detail: { action: 'delete', id: eventId } }));
        setRefreshKey(k => k + 1);
      } else {
        setMessage({ type: 'error', text: body.message || body.error || `Failed to delete (status ${resp.status})` });
      }
    } catch (err) {
      console.error('Delete error', err);
      setMessage({ type: 'error', text: 'Network error while deleting' });
    }
  };

  const handleModalLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email, password: loginForm.password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('username', data.user.username || data.user.name || '');
          localStorage.setItem('userRole', data.user.role || '');
        }

        setLoginMsg({ type: 'success', text: 'Login successful. Continuing...' });
        setShowLoginModal(false);
        setLoginForm({ email: '', password: '' });

        setTimeout(() => {
          if (pendingCreatePayload) {
            createEvent(pendingCreatePayload);
          } else {
            setRefreshKey(k => k + 1);
          }
        }, 250);
      } else {
        setLoginMsg({ type: 'error', text: data.message || data.error || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error', err);
      setLoginMsg({ type: 'error', text: 'Network error during login' });
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setMessage({ type: 'success', text: 'Logged out' });
  };

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ color: '#ffb703', margin: 0 }}>Welcome, {employeeName} 🎯</h1>
          <p style={{ color: '#9fb0c1' }}>Create & manage events</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleLogout} style={{ background: '#ff3b3b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8 }}>
            Logout
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} style={{ background: '#ffb703', color: '#121212', border: 'none', padding: '8px 14px', borderRadius: 8 }}>
            Refresh
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: 16,
          padding: 12,
          borderRadius: 8,
          background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
          color: message.type === 'success' ? '#ccffd8' : '#ffd1d1'
        }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gap: 20 }}>
        <section style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>Create New Event</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
            <input
              placeholder="Event title"
              value={formData.title}
              onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              style={inputStyle()}
            />
            <input
              type="datetime-local"
              value={formData.date}
              onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
              style={inputStyle()}
            />
            <input
              placeholder="Location"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
              style={inputStyle()}
            />
            <input
              type="number"
              placeholder="Price (KES)"
              value={formData.price}
              onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
              min="0"
              style={inputStyle()}
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              style={{ ...inputStyle(), minHeight: 100 }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? '#555' : '#ffb703',
                  padding: '12px 18px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  color: '#121212'
                }}
              >
                {submitting ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ title: '', description: '', date: '', location: '', price: '' })}
                style={{
                  background: 'transparent',
                  color: '#9fb0c1',
                  border: '1px solid #555',
                  padding: '12px 18px',
                  borderRadius: 8
                }}
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333' }}>
          <h3 style={{ color: '#fff', marginTop: 0 }}>Your Events</h3>
          {loadingEvents ? (
            <p style={{ color: '#9fb0c1' }}>Loading events...</p>
          ) : (
            <>
              {events.length === 0 ? (
                <p style={{ color: '#9fb0c1' }}>No events yet</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ color: '#ffb703', padding: 8, textAlign: 'left' }}>Title</th>
                        <th style={{ color: '#ffb703', padding: 8, textAlign: 'left' }}>Date</th>
                        <th style={{ color: '#ffb703', padding: 8, textAlign: 'left' }}>Location</th>
                        <th style={{ color: '#ffb703', padding: 8, textAlign: 'left' }}>Price</th>
                        <th style={{ color: '#ffb703', padding: 8, textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map(ev => (
                        <tr key={ev._id || ev.id || JSON.stringify(ev).slice(0, 40)}>
                          <td style={{ padding: 8, color: '#fff', verticalAlign: 'top' }}>{ev.title}</td>
                          <td style={{ padding: 8, color: '#9fb0c1', verticalAlign: 'top' }}>
                            {ev.date ? new Date(ev.date).toLocaleString() : '-'}
                          </td>
                          <td style={{ padding: 8, color: '#9fb0c1', verticalAlign: 'top' }}>{ev.location}</td>
                          <td style={{ padding: 8, color: '#ffb703', verticalAlign: 'top' }}>
                            {ev.price ? `KES ${ev.price}` : 'Free'}
                          </td>
                          <td style={{ padding: 8, textAlign: 'center', verticalAlign: 'top' }}>
                            <button
                              onClick={() => handleDelete(ev._id || ev.id)}
                              style={{
                                background: '#ff3b3b',
                                color: '#fff',
                                border: 'none',
                                padding: '6px 10px',
                                borderRadius: 6,
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)',
          zIndex: 2000,
          padding: 20
        }}>
          <div style={{
            background: '#1f1f2e',
            padding: 20,
            borderRadius: 12,
            width: '100%',
            maxWidth: 420,
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ color: '#ffb703', margin: 0 }}>Please Login</h4>
              <button
                onClick={() => setShowLoginModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 22 }}
              >
                ×
              </button>
            </div>

            {loginMsg && (
              <div style={{
                padding: 10,
                borderRadius: 8,
                marginBottom: 10,
                background: loginMsg.type === 'success' ? '#0b2b13' : '#3b0f0f',
                color: loginMsg.type === 'success' ? '#ccffd8' : '#ffd1d1'
              }}>
                {loginMsg.text}
              </div>
            )}

            <form onSubmit={handleModalLogin} style={{ display: 'grid', gap: 10 }}>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={e => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                required
                style={inputStyle()}
              />
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={e => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                required
                style={inputStyle()}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="submit"
                  disabled={loginLoading}
                  style={{
                    background: loginLoading ? '#555' : '#ff3b3b',
                    color: '#fff',
                    border: 'none',
                    padding: '10px',
                    borderRadius: 8,
                    cursor: loginLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loginLoading ? 'Logging in...' : 'Login'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #555',
                    color: '#9fb0c1',
                    padding: '10px',
                    borderRadius: 8
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
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
    fontSize: 14,
    boxSizing: 'border-box'
  };
}
