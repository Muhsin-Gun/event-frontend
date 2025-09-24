import React, { useEffect, useState } from 'react';
import API_BASE from '../config/api';

export default function EmployeeDashboard() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });

  // Form and events state
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

  // Settings & Help state
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const employeeName = localStorage.getItem('username') || 'Employee';

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadEvents();
    } else {
      setShowLoginModal(true);
    }
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
      
      // Add CarAuction as default ongoing event if no ongoing events exist
      const now = new Date();
      const hasOngoingEvents = list.some(event => {
        const eventDate = new Date(event.date);
        const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
        return eventDate <= now && now <= eventEnd;
      });

      if (!hasOngoingEvents) {
        const carAuction = {
          _id: 'car-auction-employee',
          title: 'CarAuction',
          date: new Date().toISOString(), // Current time
          location: 'Nairobi Convention Center',
          description: 'Live luxury car auction featuring premium vehicles. High-octane meetups, dealership showcases, and exclusive test-drive experiences.',
          price: 1000,
          createdBy: 'system'
        };
        list.unshift(carAuction); // Add to beginning of array
      }

      setEvents(list);
    } catch (err) {
      console.error('Load events error', err);
      setMessage({ type: 'error', text: 'Network error while loading events' });
      
      // Even on error, add CarAuction as ongoing event
      setEvents([{
        _id: 'car-auction-employee',
        title: 'CarAuction',
        date: new Date().toISOString(),
        location: 'Nairobi Convention Center',
        description: 'Live luxury car auction featuring premium vehicles. High-octane meetups, dealership showcases, and exclusive test-drive experiences.',
        price: 1000,
        createdBy: 'system'
      }]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const createEvent = async (payload) => {
    setSubmitting(true);
    setMessage(null);
    const token = getAuthToken();

    if (!token) {
      setMessage({ type: 'error', text: 'Not authenticated. Please log in to create events.' });
      setShowLoginModal(true);
      setSubmitting(false);
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

      if (resp.ok) {
        setMessage({ type: 'success', text: 'Event created successfully! It will appear in upcoming events for clients.' });
        setFormData({ title: '', description: '', date: '', location: '', price: '' });

        const created = body.data || body.event || body;
        if (created && (created._id || created.id)) {
          setEvents(prev => [created, ...prev]);
        }

        window.dispatchEvent(new CustomEvent('events:changed', { detail: { action: 'create' } }));
        setRefreshKey(k => k + 1);
      } else {
        const text = body.message || body.error || `Failed to create event (status ${resp.status})`;
        if (resp.status === 401 || /auth/i.test(text)) {
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
    // Prevent deletion of CarAuction system event
    if (eventId === 'car-auction-employee') {
      setMessage({ type: 'error', text: 'Cannot delete the CarAuction system event.' });
      return;
    }

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

      if (resp.ok) {
        setMessage({ type: 'success', text: 'Event deleted successfully' });
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

  const handleLogin = async () => {
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('token', data.token);
        if (data.user) {
          localStorage.setItem('username', data.user.username || data.user.name || '');
          localStorage.setItem('userRole', data.user.role || '');
        }

        setIsAuthenticated(true);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        setMessage({ type: 'success', text: 'Login successful!' });
        loadEvents();
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Login failed' });
      }
    } catch (err) {
      console.error('Login error', err);
      setMessage({ type: 'error', text: 'Network error during login' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    setAuthLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: authData.username,
          email: authData.email,
          password: authData.password,
          role: 'employee'
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
        }
        if (data.user) {
          localStorage.setItem('username', data.user.username || '');
          localStorage.setItem('userRole', data.user.role || '');
        }

        setShowRegisterModal(false);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        setMessage({ type: 'success', text: 'Registration successful!' });
        
        if (data.token) loadEvents();
      } else {
        setMessage({ type: 'error', text: data.message || data.error || 'Registration failed' });
      }
    } catch (err) {
      console.error('Register error', err);
      setMessage({ type: 'error', text: 'Network error during registration' });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setShowLoginModal(true);
    setMessage({ type: 'success', text: 'Logged out successfully' });
  };

  const generateReport = () => {
    const reportData = {
      employeeName: employeeName,
      totalEventsCreated: events.filter(e => e.createdBy !== 'system').length, // Exclude CarAuction
      upcomingEvents: events.filter(e => new Date(e.date) > new Date()).length,
      ongoingEvents: events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
        return eventDate <= now && now <= eventEnd;
      }).length,
      pastEvents: events.filter(e => new Date(e.date) <= new Date()).length,
      events: events.map(e => ({
        title: e.title,
        date: e.date,
        location: e.location,
        price: e.price,
        status: (() => {
          const eventDate = new Date(e.date);
          const now = new Date();
          const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
          if (eventDate <= now && now <= eventEnd) return 'ongoing';
          if (eventDate > now) return 'upcoming';
          return 'past';
        })(),
        isSystemEvent: e.createdBy === 'system'
      })),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee-report-${employeeName}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auth screens
  if (!isAuthenticated) {
    return (
      <div style={{ background: '#121212', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showLoginModal && (
          <div style={{ background: '#1f1f2e', padding: 30, borderRadius: 12, width: '100%', maxWidth: 420, border: '1px solid #333' }}>
            <h3 style={{ color: '#ffb703', marginBottom: 20 }}>Employee Login</h3>
            
            {message && (
              <div style={{
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
                background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
                color: message.type === 'success' ? '#ccffd8' : '#ffd1d1'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <input
                type="email"
                placeholder="Email"
                value={authData.email}
                onChange={e => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                style={inputStyle()}
              />
              <input
                type="password"
                placeholder="Password"
                value={authData.password}
                onChange={e => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                style={inputStyle()}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleLogin} disabled={authLoading} style={buttonStyle('#ff3b3b')}>
                  {authLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} style={buttonStyle('#ffb703')}>
                  Register
                </button>
              </div>
            </div>
          </div>
        )}

        {showRegisterModal && (
          <div style={{ background: '#1f1f2e', padding: 30, borderRadius: 12, width: '100%', maxWidth: 420, border: '1px solid #333' }}>
            <h3 style={{ color: '#ffb703', marginBottom: 20 }}>Employee Registration</h3>
            
            {message && (
              <div style={{
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
                background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
                color: message.type === 'success' ? '#ccffd8' : '#ffd1d1'
              }}>
                {message.text}
              </div>
            )}

            <div style={{ display: 'grid', gap: 12 }}>
              <input
                type="text"
                placeholder="Username"
                value={authData.username}
                onChange={e => setAuthData(prev => ({ ...prev, username: e.target.value }))}
                style={inputStyle()}
              />
              <input
                type="email"
                placeholder="Email"
                value={authData.email}
                onChange={e => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                style={inputStyle()}
              />
              <input
                type="password"
                placeholder="Password"
                value={authData.password}
                onChange={e => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                style={inputStyle()}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleRegister} disabled={authLoading} style={buttonStyle('#ff3b3b')}>
                  {authLoading ? 'Creating Account...' : 'Register'}
                </button>
                <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} style={buttonStyle('#ffb703')}>
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#1f1f2e', borderBottom: '1px solid #333', padding: '20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto' }}>
          <div>
            <h1 style={{ color: '#ffb703', margin: 0, fontSize: '2rem', fontWeight: '800' }}>Employee Dashboard</h1>
            <p style={{ color: '#9fb0c1', margin: '5px 0 0 0' }}>Welcome back, {employeeName}</p>
          </div>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ ...inputStyle(), width: 200, marginBottom: 0 }}
            />
            <button onClick={() => setShowHelp(true)} style={buttonStyle('#06d6a0')}>Help</button>
            <button onClick={() => setShowSettings(true)} style={buttonStyle('#8b5cf6')}>Settings</button>
            <button onClick={generateReport} style={buttonStyle('#ffb703')}>Generate Report</button>
            <button onClick={handleLogout} style={buttonStyle('#ff3b3b')}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '30px', maxWidth: 1400, margin: '0 auto' }}>
        {message && (
          <div style={{
            marginBottom: 20,
            padding: 15,
            borderRadius: 8,
            background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
            color: message.type === 'success' ? '#ccffd8' : '#ffd1d1',
            border: message.type === 'success' ? '1px solid rgba(18,183,103,.12)' : '1px solid rgba(255,59,59,.12)'
          }}>
            {message.text}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 30 }}>
          <div style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333', textAlign: 'center' }}>
            <h3 style={{ color: '#ffb703', margin: '0 0 5px 0', fontSize: '2rem' }}>
              {events.filter(e => e.createdBy !== 'system').length}
            </h3>
            <p style={{ color: '#9fb0c1', margin: 0 }}>Your Events Created</p>
          </div>
          <div style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333', textAlign: 'center' }}>
            <h3 style={{ color: '#3b82f6', margin: '0 0 5px 0', fontSize: '2rem' }}>
              {events.filter(e => new Date(e.date) > new Date()).length}
            </h3>
            <p style={{ color: '#9fb0c1', margin: 0 }}>Upcoming Events</p>
          </div>
          <div style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333', textAlign: 'center' }}>
            <h3 style={{ color: '#ef4444', margin: '0 0 5px 0', fontSize: '2rem' }}>
              {events.filter(e => {
                const eventDate = new Date(e.date);
                const now = new Date();
                const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
                return eventDate <= now && now <= eventEnd;
              }).length}
            </h3>
            <p style={{ color: '#9fb0c1', margin: 0 }}>Ongoing Events</p>
          </div>
          <div style={{ background: '#1f1f2e', padding: 20, borderRadius: 12, border: '1px solid #333', textAlign: 'center' }}>
            <h3 style={{ color: '#6b7280', margin: '0 0 5px 0', fontSize: '2rem' }}>
              {events.filter(e => new Date(e.date) <= new Date() && e.createdBy !== 'system').length}
            </h3>
            <p style={{ color: '#9fb0c1', margin: 0 }}>Past Events</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 30 }}>
          {/* Create Event Form */}
          <section style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 20 }}>Create New Event</h3>
            <div style={{ display: 'grid', gap: 15 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
                <input
                  placeholder="Event title"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  style={inputStyle()}
                />
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  style={inputStyle()}
                />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
                <input
                  placeholder="Location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
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
              </div>
              
              <textarea
                placeholder="Event description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{ ...inputStyle(), minHeight: 100, resize: 'vertical' }}
              />
              
              <div style={{ display: 'flex', gap: 15 }}>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    ...buttonStyle(submitting ? '#555' : '#ffb703'),
                    padding: '15px 25px',
                    fontSize: '16px',
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {submitting ? 'Creating Event...' : 'Create Event'}
                </button>
                <button
                  onClick={() => setFormData({ title: '', description: '', date: '', location: '', price: '' })}
                  style={{ ...buttonStyle('#6b7280'), padding: '15px 25px' }}
                >
                  Reset Form
                </button>
              </div>
            </div>
          </section>

          {/* Events List */}
          <section style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
            <h3 style={{ color: '#fff', marginTop: 0, marginBottom: 20 }}>
              All Events ({filteredEvents.length})
            </h3>
            
            {loadingEvents ? (
              <p style={{ color: '#9fb0c1', textAlign: 'center', padding: '40px 0' }}>Loading events...</p>
            ) : filteredEvents.length === 0 ? (
              <p style={{ color: '#9fb0c1', textAlign: 'center', padding: '40px 0' }}>
                {searchTerm ? 'No events match your search.' : 'No events found. Create your first event above!'}
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 15 }}>
                {filteredEvents.map(ev => {
                  const eventDate = new Date(ev.date);
                  const now = new Date();
                  const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
                  const isCarAuction = ev._id === 'car-auction-employee';
                  
                  let status = 'upcoming';
                  let statusColor = '#3b82f6';
                  
                  if (eventDate <= now && now <= eventEnd) {
                    status = 'ongoing';
                    statusColor = '#ef4444';
                  } else if (eventDate < now) {
                    status = 'completed';
                    statusColor = '#6b7280';
                  }
                  
                  return (
                    <div key={ev._id || ev.id} style={{ 
                      background: isCarAuction ? 'linear-gradient(135deg, #ffb70315, #2a2a3e)' : '#2a2a3e', 
                      padding: 20, 
                      borderRadius: 10, 
                      border: isCarAuction ? '2px solid #ffb703' : '1px solid #444'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <h4 style={{ color: isCarAuction ? '#ffb703' : '#fff', margin: 0, fontSize: '1.2rem' }}>
                              {ev.title}
                            </h4>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: 12,
                              background: statusColor,
                              color: '#fff',
                              fontSize: '12px',
                              fontWeight: '600',
                              textTransform: 'uppercase'
                            }}>
                              {status}
                            </span>
                            {isCarAuction && (
                              <span style={{
                                padding: '4px 8px',
                                borderRadius: 12,
                                background: '#ffb703',
                                color: '#121212',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>
                                SYSTEM EVENT
                              </span>
                            )}
                          </div>
                          <p style={{ color: '#9fb0c1', margin: '0 0 8px 0', fontSize: '14px' }}>
                            {ev.location} • {eventDate.toLocaleString()}
                          </p>
                          <p style={{ color: '#9fb0c1', margin: '0 0 10px 0', fontSize: '14px' }}>
                            {ev.description || 'No description provided'}
                          </p>
                          <div style={{ color: '#ffb703', fontWeight: '700', fontSize: '16px' }}>
                            {ev.price ? `KES ${ev.price}` : 'Free Event'}
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 10 }}>
                          {!isCarAuction && (
                            <button
                              onClick={() => handleDelete(ev._id || ev.id)}
                              style={{ ...buttonStyle('#ff3b3b'), padding: '8px 12px', fontSize: '14px' }}
                            >
                              Delete
                            </button>
                          )}
                          {isCarAuction && (
                            <span style={{ 
                              color: '#9fb0c1', 
                              fontSize: '12px', 
                              fontStyle: 'italic',
                              alignSelf: 'center'
                            }}>
                              Cannot delete system events
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, width: '100%', maxWidth: 500, border: '1px solid #333', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ color: '#ffb703', margin: 0 }}>Employee Help Guide</h4>
              <button onClick={() => setShowHelp(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ color: '#9fb0c1', lineHeight: 1.6 }}>
              <h5 style={{ color: '#fff', margin: '0 0 10px 0' }}>Creating Events:</h5>
              <p style={{ margin: '0 0 15px 0' }}>
                Fill out the event form with title, date, location, and price. Events you create will appear as "upcoming" for clients until the event time arrives.
              </p>
              
              <h5 style={{ color: '#fff', margin: '0 0 10px 0' }}>CarAuction System Event:</h5>
              <p style={{ margin: '0 0 15px 0' }}>
                The CarAuction is a permanent system event that showcases your platform's capabilities. It cannot be deleted and serves as an ongoing demonstration event for clients.
              </p>
              
              <h5 style={{ color: '#fff', margin: '0 0 10px 0' }}>Event Status:</h5>
              <p style={{ margin: '0 0 15px 0' }}>
                • <strong style={{color: '#3b82f6'}}>Upcoming</strong> - Future events clients can book<br/>
                • <strong style={{color: '#ef4444'}}>Ongoing</strong> - Currently happening (during event hours)<br/>
                • <strong style={{color: '#6b7280'}}>Completed</strong> - Past events
              </p>
              
              <h5 style={{ color: '#fff', margin: '0 0 10px 0' }}>Reports:</h5>
              <p style={{ margin: 0 }}>
                Click "Generate Report" to download your activity summary. This helps track your event creation performance and excludes system events from your personal statistics.
              </p>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => setShowHelp(false)} style={buttonStyle('#ffb703')}>Got It!</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 20 }}>
          <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, width: '100%', maxWidth: 400, border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h4 style={{ color: '#ffb703', margin: 0 }}>Employee Settings</h4>
              <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 22, cursor: 'pointer' }}>×</button>
            </div>
            
            <div style={{ color: '#9fb0c1' }}>
              <p><strong>Username:</strong> {employeeName}</p>
              <p><strong>Role:</strong> Employee</p>
              <p><strong>Your Events:</strong> {events.filter(e => e.createdBy !== 'system').length}</p>
              <p><strong>Total Events:</strong> {events.length}</p>
              <p style={{ fontSize: '14px', marginTop: 20 }}>
                Profile updates and password changes will be available in future updates.
              </p>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => setShowSettings(false)} style={buttonStyle('#ffb703')}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function inputStyle() {
  return {
    width: '100%',
    padding: '12px 15px',
    borderRadius: 8,
    background: '#333',
    border: '1px solid #555',
    color: '#fff',
    fontSize: 14,
    boxSizing: 'border-box',
    marginBottom: 0
  };
}

function buttonStyle(bgColor) {
  return {
    background: bgColor,
    color: '#fff',
    border: 'none',
    padding: '10px 15px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  };
}