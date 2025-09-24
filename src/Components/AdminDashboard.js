import React, { useState, useEffect } from 'react';
import API_BASE from '../config/api';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalEmployees: 0,
    totalClients: 0,
    totalPayments: 0,
    monthlyGrowth: 0,
    ongoingEvents: 0,
    upcomingEvents: 0
  });

  const [salesData, setSalesData] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const adminName = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      loadDashboardData();
    } else {
      setShowLoginModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Accept tokens stored under either key
  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // defensive parser for different possible response shapes
  const parsePossibleArray = (json) => {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (Array.isArray(json.events)) return json.events;
    if (Array.isArray(json.items)) return json.items;
    if (json.users && Array.isArray(json.users)) return json.users;
    return [];
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Ensure sales data (used for totalPayments) is loaded first
      const sales = await loadSalesData();
      // Then load rest in parallel
      await Promise.all([loadUsers(), loadEvents()]);

      // Boxing logic: we count punches (payments), not rounds (groups)
      // totalPayments should sum the 'payments' field from each aggregated group
      const totalPayments = Array.isArray(sales)
        ? sales.reduce((sum, g) => sum + (Number(g.payments) || 0), 0)
        : 0;

      setStats(prev => ({ ...prev, totalPayments }));
    } catch (err) {
      console.error('Dashboard error', err);
    } finally {
      setLoading(false);
    }
  };

  // return sales array for caller usage
  const loadSalesData = async () => {
    try {
      // Use last 30 days dynamically rather than a hard-coded year
      const toDate = new Date();
      const fromDate = new Date(toDate);
      fromDate.setDate(toDate.getDate() - 30);

      const fromStr = fromDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const toStr = toDate.toISOString().slice(0, 10);

      const salesResp = await fetch(
        `${API_BASE}/api/reports/sales?from=${fromStr}&to=${toStr}&groupBy=month`,
        { headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } }
      );

      if (!salesResp.ok) {
        // don't throw — just return empty array and log
        const txt = await salesResp.text().catch(() => '');
        console.warn('Sales API returned non-OK:', salesResp.status, txt);
        setSalesData([]);
        setStats(prev => ({ ...prev, totalRevenue: 0 }));
        return [];
      }

      const salesResult = await salesResp.json().catch(() => ({}));
      const data = Array.isArray(salesResult.data) ? salesResult.data : parsePossibleArray(salesResult);
      const dataArr = Array.isArray(data) ? data : [];

      setSalesData(dataArr);

      // compute total revenue defensively (sum of aggregated totalAmount fields)
      const totalRevenue = dataArr.reduce((s, item) => s + (Number(item.totalAmount) || 0), 0);
      setStats(prev => ({ ...prev, totalRevenue }));

      return dataArr;
    } catch (err) {
      console.error('Sales load error', err);
      setSalesData([]);
      setStats(prev => ({ ...prev, totalRevenue: 0 }));
      return [];
    }
  };

  const loadUsers = async () => {
    try {
      const usersResp = await fetch(`${API_BASE}/api/users/getUsers?limit=100`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });

      if (!usersResp.ok) {
        const txt = await usersResp.text().catch(() => '');
        console.warn('Users API returned non-OK:', usersResp.status, txt);
        setUsers([]);
        setStats(prev => ({ ...prev, totalUsers: 0, totalEmployees: 0, totalClients: 0 }));
        return;
      }

      const usersResult = await usersResp.json().catch(() => null);
      const userData = parsePossibleArray(usersResult);

      setUsers(userData);

      const totalUsers = userData.length;
      const totalEmployees = userData.filter(u => u.role === 'employee').length;
      const totalClients = userData.filter(u => u.role === 'client').length;

      setStats(prev => ({
        ...prev,
        totalUsers,
        totalEmployees,
        totalClients,
        monthlyGrowth: prev.monthlyGrowth || 8.4 // keep prior or set default
      }));
    } catch (err) {
      console.error('Users load error', err);
      setUsers([]);
      setStats(prev => ({ ...prev, totalUsers: 0, totalEmployees: 0, totalClients: 0 }));
    }
  };

  const loadEvents = async () => {
    try {
      const eventsResp = await fetch(`${API_BASE}/api/events?limit=100`, {
        headers: { ...getAuthHeaders() }
      });

      if (!eventsResp.ok) {
        const txt = await eventsResp.text().catch(() => '');
        console.warn('Events API returned non-OK:', eventsResp.status, txt);
        setEvents([]);
        setStats(prev => ({ ...prev, totalEvents: 0, ongoingEvents: 0, upcomingEvents: 0 }));
        return;
      }

      const eventsResult = await eventsResp.json().catch(() => null);
      const eventData = parsePossibleArray(eventsResult);

      setEvents(eventData);

      const now = new Date();
      const ongoing = eventData.filter(e => {
        const eventDate = new Date(e.date);
        const eventEnd = new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
        return eventDate <= now && now <= eventEnd;
      }).length;

      const upcoming = eventData.filter(e => new Date(e.date) > now).length;

      setStats(prev => ({
        ...prev,
        totalEvents: eventData.length,
        ongoingEvents: ongoing,
        upcomingEvents: upcoming
      }));
    } catch (err) {
      console.error('Events load error', err);
      setEvents([]);
      setStats(prev => ({ ...prev, totalEvents: 0, ongoingEvents: 0, upcomingEvents: 0 }));
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
        // save token under both keys to be compatible with other dashboards
        localStorage.setItem('authToken', json.token);
        localStorage.setItem('token', json.token);

        if (json.user?.username) localStorage.setItem('username', json.user.username);
        if (json.user?.role) localStorage.setItem('userRole', json.user.role);

        setIsAuthenticated(true);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        await loadDashboardData();
      } else {
        throw new Error(json?.message || 'Login failed');
      }
    } catch (err) {
      alert(err.message || 'Login error');
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
          role: 'admin'
        })
      });

      const json = await res.json();
      if (res.ok) {
        if (json.token) {
          localStorage.setItem('authToken', json.token);
          localStorage.setItem('token', json.token);
          setIsAuthenticated(true);
        }
        if (json.user?.username) localStorage.setItem('username', json.user.username);
        if (json.user?.role) localStorage.setItem('userRole', json.user.role);

        setShowRegisterModal(false);
        setShowLoginModal(false);
        setAuthData({ username: '', email: '', password: '' });
        alert('Registration successful');
        if (json.token) loadDashboardData();
      } else {
        throw new Error(json?.message || 'Registration failed');
      }
    } catch (err) {
      alert(err.message || 'Registration error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/users/deleteUser/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        }
      });

      const json = await res.json();

      if (res.ok) {
        // Remove user from local state
        setUsers(prev => prev.filter(user => user._id !== userId));
        
        // Update stats
        const deletedUser = users.find(u => u._id === userId);
        if (deletedUser) {
          setStats(prev => ({
            ...prev,
            totalUsers: prev.totalUsers - 1,
            totalEmployees: deletedUser.role === 'employee' ? prev.totalEmployees - 1 : prev.totalEmployees,
            totalClients: deletedUser.role === 'client' ? prev.totalClients - 1 : prev.totalClients
          }));
        }
        
        alert('User deleted successfully');
      } else {
        throw new Error(json.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Delete user error:', err);
      alert(err.message || 'Failed to delete user');
    }
  };

  const generateReport = () => {
    const reportData = {
      totalRevenue: stats.totalRevenue,
      totalUsers: stats.totalUsers,
      totalEvents: stats.totalEvents,
      totalPayments: stats.totalPayments,
      breakdown: {
        employees: stats.totalEmployees,
        clients: stats.totalClients,
        ongoingEvents: stats.ongoingEvents,
        upcomingEvents: stats.upcomingEvents
      },
      salesData: salesData,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = users.filter(user =>
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const chartData = {
    labels: salesData.map(item => {
      if (item._id && item._id.month && item._id.year) {
        return `${item._id.month}/${item._id.year}`;
      }
      return 'N/A';
    }),
    datasets: [{
      label: 'Revenue (KES)',
      data: salesData.map(item => Number(item.totalAmount) || 0),
      backgroundColor: 'rgba(255, 59, 59, 0.6)',
      borderColor: 'rgba(255, 59, 59, 1)',
      borderWidth: 2,
      fill: true
    }]
  };

  const userRoleData = {
    labels: ['Clients', 'Employees', 'Admins'],
    datasets: [{
      data: [
        stats.totalClients,
        stats.totalEmployees,
        users.filter(u => u.role === 'admin').length
      ],
      backgroundColor: ['#ffb703', '#ff3b3b', '#06d6a0'],
      borderWidth: 2,
      borderColor: '#1f1f2e'
    }]
  };

  if (!isAuthenticated) {
    return (
      <div style={{ background: '#121212', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {showLoginModal && (
          <div style={{ background: '#1f1f2e', padding: 30, borderRadius: 12, width: '100%', maxWidth: 420, border: '1px solid #333' }}>
            <h3 style={{ color: '#ffb703', marginBottom: 20 }}>Admin Login Required</h3>

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
            <h3 style={{ color: '#ffb703', marginBottom: 20 }}>Admin Registration</h3>

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
                  {authLoading ? 'Creating...' : 'Register'}
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

  if (loading) {
    return (
      <div style={{ padding: 30, color: '#fff', background: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #333', borderTop: '3px solid #ff3b3b', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <div>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#121212', minHeight: '100vh', color: '#fff' }}>
      {/* Header */}
      <div style={{ background: '#1f1f2e', borderBottom: '1px solid #333', padding: '20px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 1400, margin: '0 auto' }}>
          <div>
            <h1 style={{ margin: 0, color: '#ff3b3b', fontSize: '2rem', fontWeight: '800' }}>Admin Dashboard</h1>
            <p style={{ color: '#9fb0c1', margin: '5px 0 0 0' }}>Welcome back, {adminName}</p>
          </div>
          <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search users, events..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ ...inputStyle(), width: 250, paddingLeft: 35 }}
              />
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9fb0c1' }}>🔍</span>
            </div>
            <button onClick={generateReport} style={buttonStyle('#06d6a0')}>Generate Report</button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} style={buttonStyle('#ff3b3b')}>Logout</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 30px', maxWidth: 1400, margin: '0 auto' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 30, borderBottom: '1px solid #333', paddingTop: 20 }}>
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'users', label: 'Users' },
            { key: 'events', label: 'Events' },
            { key: 'reports', label: 'Reports' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === tab.key ? '#ff3b3b' : '#9fb0c1',
                padding: '10px 20px',
                borderBottom: activeTab === tab.key ? '2px solid #ff3b3b' : '2px solid transparent',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: activeTab === tab.key ? '700' : '500'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 20, marginBottom: 30 }}>
              {[
                { title: 'Total Revenue', value: `KES ${Number(stats.totalRevenue || 0).toLocaleString()}`, color: '#06d6a0' },
                { title: 'Total Users', value: stats.totalUsers, color: '#ffb703' },
                { title: 'Total Events', value: stats.totalEvents, color: '#ff3b3b' },
                { title: 'Total Payments', value: stats.totalPayments, color: '#8b5cf6' },
                { title: 'Employees', value: stats.totalEmployees, color: '#f59e0b' },
                { title: 'Clients', value: stats.totalClients, color: '#10b981' },
                { title: 'Ongoing Events', value: stats.ongoingEvents, color: '#ef4444' },
                { title: 'Upcoming Events', value: stats.upcomingEvents, color: '#3b82f6' }
              ].map((stat, i) => (
                <div key={i} style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333', textAlign: 'center' }}>
                  <h3 style={{ color: stat.color, margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '800' }}>{stat.value}</h3>
                  <p style={{ color: '#9fb0c1', margin: 0, fontWeight: '500' }}>{stat.title}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 30 }}>
              <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>Revenue Analytics</h3>
                {salesData.length > 0 ? (
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: { legend: { display: true, labels: { color: '#9fb0c1' } } },
                      scales: {
                        y: { beginAtZero: true, ticks: { color: '#9fb0c1' }, grid: { color: '#333' } },
                        x: { ticks: { color: '#9fb0c1' }, grid: { color: '#333' } }
                      }
                    }}
                  />
                ) : (
                  <p style={{ color: '#9fb0c1', textAlign: 'center', padding: '50px 0' }}>No revenue data available</p>
                )}
              </div>

              <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
                <h3 style={{ color: '#fff', marginTop: 0 }}>User Roles</h3>
                <Doughnut
                  data={userRoleData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: true,
                        labels: { color: '#9fb0c1' },
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333', marginBottom: 30 }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>User Management ({filteredUsers.length} users)</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle()}>Username</th>
                    <th style={tableHeaderStyle()}>Email</th>
                    <th style={tableHeaderStyle()}>Role</th>
                    <th style={tableHeaderStyle()}>Joined</th>
                    <th style={tableHeaderStyle()}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id || user.id}>
                      <td style={tableCellStyle()}>{user.username || '—'}</td>
                      <td style={tableCellStyle()}>{user.email}</td>
                      <td style={tableCellStyle()}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: 20,
                          background: user.role === 'admin' ? '#ff3b3b' : user.role === 'employee' ? '#ffb703' : '#06d6a0',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {user.role || 'client'}
                        </span>
                      </td>
                      <td style={tableCellStyle()}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                      <td style={tableCellStyle()}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button 
                            style={{ ...buttonStyle('#06d6a0'), padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => alert('Edit functionality coming soon')}
                          >
                            Edit
                          </button>
                          <button 
                            style={{ ...buttonStyle('#ff3b3b'), padding: '5px 10px', fontSize: '12px' }}
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333', marginBottom: 30 }}>
            <h3 style={{ color: '#fff', marginTop: 0 }}>Event Management ({events.length} events)</h3>
            <div style={{ display: 'grid', gap: 15 }}>
              {events.map(event => {
                const eventDate = new Date(event.date);
                const now = new Date();
                const isOngoing = eventDate <= now && now <= new Date(eventDate.getTime() + 8 * 60 * 60 * 1000);
                const isUpcoming = eventDate > now;

                return (
                  <div key={event._id || event.id} style={{ background: '#2a2a3e', padding: 20, borderRadius: 8, border: '1px solid #444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ color: '#fff', margin: '0 0 5px 0' }}>{event.title}</h4>
                        <p style={{ color: '#9fb0c1', margin: '0 0 5px 0' }}>{event.location} • {eventDate.toLocaleDateString()}</p>
                        <p style={{ color: '#9fb0c1', margin: 0, fontSize: '14px' }}>{event.description}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: 20,
                          background: isOngoing ? '#ef4444' : isUpcoming ? '#3b82f6' : '#6b7280',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {isOngoing ? 'ONGOING' : isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                        </span>
                        <div style={{ color: '#ffb703', fontWeight: '700', marginTop: 10 }}>
                          {event.price ? `KES ${event.price}` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div style={{ display: 'grid', gap: 20, marginBottom: 30 }}>
            <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Generate Reports</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 15 }}>
                <button onClick={generateReport} style={{ ...buttonStyle('#06d6a0'), padding: '15px', borderRadius: 8 }}>
                  📊 Download Full Report
                </button>
                <button style={{ ...buttonStyle('#ffb703'), padding: '15px', borderRadius: 8 }}>
                  📈 Revenue Report
                </button>
                <button style={{ ...buttonStyle('#ff3b3b'), padding: '15px', borderRadius: 8 }}>
                  👥 User Activity Report
                </button>
                <button style={{ ...buttonStyle('#8b5cf6'), padding: '15px', borderRadius: 8 }}>
                  🎫 Event Performance Report
                </button>
              </div>
            </div>

            <div style={{ background: '#1f1f2e', padding: 25, borderRadius: 12, border: '1px solid #333' }}>
              <h3 style={{ color: '#fff', marginTop: 0 }}>Summary Statistics</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                <div>
                  <h4 style={{ color: '#ffb703', margin: '0 0 10px 0' }}>Employee Performance</h4>
                  <p style={{ color: '#9fb0c1', margin: 0 }}>Total events created: <strong style={{ color: '#fff' }}>{events.length}</strong></p>
                  <p style={{ color: '#9fb0c1', margin: 0 }}>Active employees: <strong style={{ color: '#fff' }}>{stats.totalEmployees}</strong></p>
                </div>
                <div>
                  <h4 style={{ color: '#ffb703', margin: '0 0 10px 0' }}>Client Engagement</h4>
                  <p style={{ color: '#9fb0c1', margin: 0 }}>Total payments: <strong style={{ color: '#fff' }}>{stats.totalPayments}</strong></p>
                  <p style={{ color: '#9fb0c1', margin: 0 }}>Active clients: <strong style={{ color: '#fff' }}>{stats.totalClients}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
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
    boxSizing: 'border-box'
  };
}

function buttonStyle(bgColor) {
  return {
    background: bgColor,
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  };
}

function tableHeaderStyle() {
  return {
    textAlign: 'left',
    color: '#ffb703',
    padding: '12px 8px',
    borderBottom: '1px solid #333',
    fontWeight: '600'
  };
}

function tableCellStyle() {
  return {
    padding: '12px 8px',
    borderBottom: '1px solid #2a2a3e',
    color: '#fff'
  };
}