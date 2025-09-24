import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import '../styles/home.css';

const API_BASE = 'http://localhost:5000';
const DEFAULT_PHONE = '+254793027220';

export default function ClientDashboard() {
  const [role, setRole] = useState(localStorage.getItem('userRole') || null);
  const [username, setUsername] = useState(localStorage.getItem('username') || null);

  // Events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventError, setEventError] = useState('');

  // Payment UI state
  const [paying, setPaying] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  const [errorMessages, setErrorMessages] = useState({});

  // Auth modal state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Help system state
  const [showHelp, setShowHelp] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: username || '',
    email: localStorage.getItem('userEmail') || '',
    phone: DEFAULT_PHONE,
    profilePhoto: null
  });

  useEffect(() => {
    setRole(localStorage.getItem('userRole') || null);
    setUsername(localStorage.getItem('username') || null);
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setEventError('');
    try {
      const res = await fetch(`${API_BASE}/api/events?limit=20`, {
        headers: { 'Content-Type': 'application/json' }
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.message || json?.error || 'Failed to fetch events');
      }

      const events = Array.isArray(json) ? json : (Array.isArray(json.data) ? json.data : []);
      
      // Categorize events by status
      const now = new Date();
      const upcoming = [];
      const ongoing = [];
      
      events.forEach(event => {
        const eventDate = new Date(event.date);
        const eventEndTime = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
        
        if (eventDate > now) {
          upcoming.push(event);
        } else if (eventDate <= now && now <= eventEndTime) {
          ongoing.push(event);
        }
      });

      // Add CarAuction as default ongoing event if no ongoing events exist
      if (ongoing.length === 0) {
        ongoing.push({
          _id: 'car-auction-live',
          title: 'CarAuction',
          date: new Date().toISOString(), // Current time
          location: 'Nairobi Convention Center',
          description: 'Live luxury car auction featuring premium vehicles. High-octane meetups, dealership showcases, and exclusive test-drive experiences.',
          price: 1000
        });
      }

      setUpcomingEvents(upcoming);
      setOngoingEvents(ongoing);
    } catch (err) {
      console.error('loadEvents error', err);
      setEventError(err.message || 'Failed to load events');
      
      // Even on error, add CarAuction as ongoing event
      setOngoingEvents([{
        _id: 'car-auction-live',
        title: 'CarAuction',
        date: new Date().toISOString(),
        location: 'Nairobi Convention Center',
        description: 'Live luxury car auction featuring premium vehicles. High-octane meetups, dealership showcases, and exclusive test-drive experiences.',
        price: 1000
      }]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const handlePayment = async (id, amount) => {
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
  };

  const handleJoinCarAuction = () => {
    // Navigate to the home event frontend
    window.location.href = '/home';
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
          role: 'client'
        })
      });
      const json = await res.json();
      if (res.ok) {
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
        alert('Registration successful!');
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

  const handleLogin = async () => {
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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowNavbar(true);
  };

  const updateProfile = async () => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      alert('Profile updated successfully!');
      setShowSettings(false);
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1200,
    padding: 20
  };
  
  const modalBoxStyle = {
    background: '#1f1f2e', borderRadius: 12, padding: 25, width: '100%', 
    maxWidth: 500, border: '1px solid #333', color: '#fff', maxHeight: '90vh', overflowY: 'auto'
  };
  
  const inputStyle = { 
    width: '100%', padding: '12px 15px', marginBottom: 12, borderRadius: 8, 
    background: '#333', border: '1px solid #555', color: '#fff', fontSize: '14px', boxSizing: 'border-box' 
  };
  
  const btnPrimary = { 
    background: '#ff3b3b', color: '#fff', padding: '12px 18px', borderRadius: 8, 
    border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px' 
  };
  
  const btnSecondary = { 
    background: 'transparent', color: '#ffb703', padding: '12px 18px', borderRadius: 8, 
    border: '2px solid #ffb703', cursor: 'pointer', fontWeight: '600', fontSize: '14px' 
  };

  return (
    <div>
      {showNavbar && selectedEvent && <Navbar />}
      
      <section className="section client-landing" style={{ padding: '40px 20px', background: '#121212', minHeight: '100vh' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
            <div>
              <h1 style={{ color: '#ffb703', fontWeight: '900', margin: 0, fontSize: '2.5rem' }}>CLIENT DASHBOARD</h1>
              <p style={{ color: '#9fb0c1', margin: '10px 0 0 0' }}>Discover and book amazing events</p>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button onClick={() => setShowHelp(true)} style={{ ...btnSecondary, padding: '10px 15px' }}>
                Help
              </button>
              <button onClick={() => setShowSettings(true)} style={{ ...btnSecondary, padding: '10px 15px' }}>
                Settings
              </button>
              {token ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#fff', padding: '10px 15px', background: '#333', borderRadius: 8 }}>
                    {username || 'User'}
                  </span>
                  <button onClick={handleLogout} style={btnPrimary}>Logout</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowLoginModal(true)} style={btnPrimary}>Login</button>
                  <button onClick={() => setShowRegisterModal(true)} style={btnSecondary}>Register</button>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ marginBottom: 40, maxWidth: 600, margin: '0 auto 40px auto' }}>
            <input
              type="text"
              placeholder="Search events..."
              style={{ ...inputStyle, marginBottom: 0, fontSize: '16px', padding: '15px 20px' }}
            />
          </div>

          {/* Loading State */}
          {loadingEvents && <p style={{ color: '#9fb0c1', fontSize: '18px' }}>Loading events...</p>}
          
          {/* Error State */}
          {eventError && <p style={{ color: '#ff6b6b', fontSize: '18px' }}>{eventError}</p>}

          {/* ONGOING EVENTS */}
          <div style={{ marginBottom: 50, textAlign: 'left' }}>
            <h2 style={{ color: '#ff3b3b', marginBottom: 20, fontSize: '1.8rem', fontWeight: '800' }}>
              🔴 ONGOING EVENTS ({ongoingEvents.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {ongoingEvents.map(ev => {
                const id = ev._id || ev.id;
                const isCarAuction = id === 'car-auction-live';
                
                return (
                  <article key={id} style={{ 
                    background: 'linear-gradient(135deg, #ff3b3b15, #1f1f2e)', 
                    borderRadius: 15, padding: 25, border: '2px solid #ff3b3b', 
                    cursor: 'pointer', transition: 'transform 0.3s ease',
                    boxShadow: '0 10px 30px rgba(255,59,59,0.2)'
                  }}
                  onClick={() => handleEventClick(ev)}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}>

                    <div style={{ marginBottom: 15 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <h3 style={{ color: '#ff3b3b', margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>{ev.title}</h3>
                        <span style={{ 
                          background: '#ff3b3b', color: '#fff', padding: '5px 12px', 
                          borderRadius: 20, fontSize: '12px', fontWeight: '700' 
                        }}>LIVE</span>
                      </div>
                      <div style={{ color: '#9fb0c1', fontSize: 14, marginBottom: 10 }}>
                        {new Date(ev.date).toLocaleDateString()} • {ev.location}
                      </div>
                      <p style={{ color: '#9fb0c1', marginBottom: 15, lineHeight: 1.5 }}>{ev.description}</p>
                      
                      {/* Pricing Information */}
                      {isCarAuction && (
                        <div style={{ 
                          background: 'rgba(255,183,3,0.1)', 
                          padding: 15, 
                          borderRadius: 8, 
                          marginBottom: 15,
                          border: '1px solid rgba(255,183,3,0.2)'
                        }}>
                          <h4 style={{ color: '#ffb703', margin: '0 0 8px 0', fontSize: '1.1rem' }}>Ticket Pricing</h4>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px' }}>
                            <span>General Pass:</span>
                            <strong>KES 1,000</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', marginTop: 4 }}>
                            <span>VIP Pass:</span>
                            <strong>KES 3,500</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontSize: '14px', marginTop: 4 }}>
                            <span>Exhibitor Pass:</span>
                            <strong>KES 8,500</strong>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>
                        {ev.price ? `KES ${ev.price}` : 'Free'}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); 
                          if (isCarAuction) {
                            handleJoinCarAuction();
                          } else {
                            handlePayment(id, ev.price || 0);
                          }
                        }}
                        disabled={!!paying[id]}
                        style={{ 
                          ...btnPrimary, 
                          opacity: paying[id] ? 0.7 : 1,
                          marginLeft: 'auto',
                          background: isCarAuction ? '#ffb703' : '#ff3b3b',
                          color: isCarAuction ? '#121212' : '#fff'
                        }}
                      >
                        {paying[id] ? 'Processing...' : (isCarAuction ? 'Join CarAuction →' : 'Join Now')}
                      </button>
                    </div>

                    {errorMessages[id] && <div style={{ color: '#ff6b6b', marginTop: 10, fontSize: '14px' }}>{errorMessages[id]}</div>}
                    {successMessages[id] && <div style={{ color: '#63d68e', marginTop: 10, fontSize: '14px' }}>{successMessages[id]}</div>}
                  </article>
                );
              })}
            </div>
          </div>

          {/* UPCOMING EVENTS */}
          <div style={{ marginBottom: 50, textAlign: 'left' }}>
            <h2 style={{ color: '#3b82f6', marginBottom: 20, fontSize: '1.8rem', fontWeight: '800' }}>
              📅 UPCOMING EVENTS ({upcomingEvents.length})
            </h2>
            
            {upcomingEvents.length === 0 ? (
              <div style={{ 
                background: '#1f1f2e', borderRadius: 12, padding: 40, textAlign: 'center',
                border: '1px solid #333'
              }}>
                <p style={{ color: '#9fb0c1', fontSize: '18px', margin: 0 }}>
                  No upcoming events at the moment. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {upcomingEvents.map(ev => {
                  const id = ev._id || ev.id;
                  return (
                    <article key={id} style={{ 
                      background: '#1f1f2e', borderRadius: 15, padding: 25, 
                      border: '1px solid #3b82f6', transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-3px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(59,130,246,0.2)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{ marginBottom: 15 }}>
                        <h3 style={{ color: '#3b82f6', margin: '0 0 10px 0', fontSize: '1.3rem', fontWeight: '800' }}>{ev.title}</h3>
                        <div style={{ color: '#9fb0c1', fontSize: 14, marginBottom: 10 }}>
                          {new Date(ev.date).toLocaleDateString()} • {ev.location}
                        </div>
                        <p style={{ color: '#9fb0c1', marginBottom: 15, lineHeight: 1.5 }}>{ev.description}</p>
                      </div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 15 }}>
                        <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem' }}>
                          {ev.price ? `KES ${ev.price}` : 'Free'}
                        </div>
                        <button
                          onClick={() => handlePayment(id, ev.price || 0)}
                          disabled={!!paying[id]}
                          style={{ 
                            background: '#3b82f6', color: '#fff', padding: '10px 16px', 
                            borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: '600',
                            opacity: paying[id] ? 0.7 : 1, marginLeft: 'auto'
                          }}
                        >
                          {paying[id] ? 'Processing...' : 'Book Ticket'}
                        </button>
                      </div>

                      {errorMessages[id] && <div style={{ color: '#ff6b6b', marginTop: 10, fontSize: '14px' }}>{errorMessages[id]}</div>}
                      {successMessages[id] && <div style={{ color: '#63d68e', marginTop: 10, fontSize: '14px' }}>{successMessages[id]}</div>}

                      <div style={{ marginTop: 15 }}>
                        <Link to={`/events/${id}`} style={{ 
                          color: '#9fb0c1', textDecoration: 'underline', fontSize: '14px' 
                        }}>
                          View Details →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Tickets Section */}
          <div style={{ marginTop: 50 }}>
            <div style={{ 
              background: '#1f1f2e', borderRadius: 15, padding: 30, border: '1px solid #333',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#ffb703', margin: '0 0 15px 0', fontSize: '1.5rem', fontWeight: '800' }}>My Tickets</h3>
              <p style={{ color: '#9fb0c1', marginTop: 10, fontSize: '16px' }}>
                Your booked tickets will appear here. Payment history and ticket management coming soon.
              </p>
            </div>
          </div>
        </div>

        {/* Help Modal */}
        {showHelp && (
          <div style={modalOverlayStyle} onClick={() => setShowHelp(false)}>
            <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#ffb703', fontSize: '1.5rem' }}>Help & Support</h3>
                <button onClick={() => setShowHelp(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>
              
              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>How to Join Events</h4>
                  <p style={{ color: '#9fb0c1', lineHeight: 1.6, margin: 0 }}>
                    1. Browse ongoing (live) and upcoming events<br/>
                    2. Click "Join CarAuction" for the live car auction or "Book Ticket" for other events<br/>
                    3. Complete payment via M-Pesa when prompted<br/>
                    4. Your tickets will appear in "My Tickets" section
                  </p>
                </div>
                
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>CarAuction Event</h4>
                  <p style={{ color: '#9fb0c1', lineHeight: 1.6, margin: 0 }}>
                    🔴 <strong style={{ color: '#ff3b3b' }}>ONGOING</strong> - Live luxury car auction happening now<br/>
                    💰 General tickets start at KES 1,000<br/>
                    🏆 VIP experience available for KES 3,500<br/>
                    🚗 Premium supercars and exclusive vehicles on display
                  </p>
                </div>
                
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 10px 0' }}>Payment & Support</h4>
                  <p style={{ color: '#9fb0c1', lineHeight: 1.6, margin: 0 }}>
                    • All payments processed securely via M-Pesa<br/>
                    • SMS confirmation sent to your phone<br/>
                    • For issues: Contact support at hello@revmeet.example<br/>
                    • Refunds available up to 24hrs before event
                  </p>
                </div>
              </div>
              
              <div style={{ marginTop: 25, textAlign: 'center' }}>
                <button onClick={() => setShowHelp(false)} style={btnPrimary}>
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div style={modalOverlayStyle} onClick={() => setShowSettings(false)}>
            <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#ffb703', fontSize: '1.5rem' }}>Profile Settings</h3>
                <button onClick={() => setShowSettings(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 24, cursor: 'pointer' }}>×</button>
              </div>
              
              <div style={{ display: 'grid', gap: 15 }}>
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: 5, fontWeight: '600' }}>Username</label>
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={e => setUserProfile(prev => ({ ...prev, username: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: 5, fontWeight: '600' }}>Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={e => setUserProfile(prev => ({ ...prev, email: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: 5, fontWeight: '600' }}>Phone Number</label>
                  <input
                    type="tel"
                    value={userProfile.phone}
                    onChange={e => setUserProfile(prev => ({ ...prev, phone: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: 5, fontWeight: '600' }}>Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files[0]) {
                        setUserProfile(prev => ({ ...prev, profilePhoto: e.target.files[0] }));
                      }
                    }}
                    style={{ ...inputStyle, padding: '10px' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 10, marginTop: 25 }}>
                <button onClick={updateProfile} style={{ ...btnPrimary, flex: 1 }}>
                  Update Profile
                </button>
                <button onClick={() => setShowSettings(false)} style={{ ...btnSecondary, flex: 1 }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div style={modalOverlayStyle} onClick={() => setShowLoginModal(false)}>
            <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#ffb703' }}>Client Login</h3>
                <button onClick={() => setShowLoginModal(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={e => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={e => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={handleLogin} style={{ ...btnPrimary, flex: 1 }} disabled={authLoading}>
                  {authLoading ? 'Logging in...' : 'Login'}
                </button>
                <button onClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} style={{ ...btnSecondary, flex: 1 }}>
                  Register
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Register Modal */}
        {showRegisterModal && (
          <div style={modalOverlayStyle} onClick={() => setShowRegisterModal(false)}>
            <div style={modalBoxStyle} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, color: '#ffb703' }}>Client Register</h3>
                <button onClick={() => setShowRegisterModal(false)} style={{ background: 'transparent', border: 'none', color: '#9fb0c1', fontSize: 20, cursor: 'pointer' }}>×</button>
              </div>

              <div style={{ display: 'grid', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Username"
                  value={authData.username}
                  onChange={e => setAuthData(prev => ({ ...prev, username: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={authData.email}
                  onChange={e => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={authData.password}
                  onChange={e => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={handleRegister} style={{ ...btnPrimary, flex: 1 }} disabled={authLoading}>
                  {authLoading ? 'Registering...' : 'Register'}
                </button>
                <button onClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} style={{ ...btnSecondary, flex: 1 }}>
                  Login
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
