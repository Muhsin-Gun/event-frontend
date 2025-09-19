// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from '../config/api';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // default role
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const storeTokenAndUser = (token, user) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('token', token);
    if (user) {
      localStorage.setItem('username', user.username || user.name || '');
      localStorage.setItem('userRole', user.role || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isRegister) {
        // --- REGISTER ---
        const res = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setMessage({ type: 'success', text: data.message || 'Registration successful! Please login.' });
          setIsRegister(false);
        } else {
          setMessage({ type: 'error', text: data.message || data.error || 'Registration failed' });
        }
      } else {
        // --- LOGIN ---
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.token) {
          storeTokenAndUser(data.token, data.user || data);
          setMessage({ type: 'success', text: 'Login successful!' });

          const role = data.user?.role || data.role || localStorage.getItem('userRole') || '';
          if (role === 'admin') navigate('/admin');
          else if (role === 'employee') navigate('/employee');
          else if (role === 'client') navigate('/client');
          else navigate('/');
        } else {
          setMessage({ type: 'error', text: data.message || data.error || 'Login failed' });
        }
      }
    } catch (err) {
      console.error('Auth error', err);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section style={{ background: '#121212', minHeight: '100vh', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#1f1f2e', borderRadius: 12, padding: 36, width: '100%', maxWidth: 520, border: '1px solid #333' }}>
        <h2 style={{ color: '#ffb703', textAlign: 'center', marginBottom: 20 }}>
          {isRegister ? 'Register' : 'Login'}
        </h2>

        {message && (
          <div style={{
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
            background: message.type === 'success' ? '#0b2b13' : '#3b0f0f',
            color: message.type === 'success' ? '#ccffd8' : '#ffd1d1',
            border: message.type === 'success' ? '1px solid rgba(18,183,103,.12)' : '1px solid rgba(255,59,59,.12)'
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          {isRegister && (
            <label style={{ color: '#fff' }}>
              Username
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={inputStyle()}
              />
            </label>
          )}

          <label style={{ color: '#fff' }}>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={inputStyle()}
            />
          </label>

          <label style={{ color: '#fff' }}>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={inputStyle()}
            />
          </label>

          {isRegister && (
            <label style={{ color: '#fff' }}>
              Role
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                style={inputStyle()}
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="client">Client</option>
              </select>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#555' : '#ff3b3b',
              color: loading ? '#999' : '#fff',
              border: 'none',
              padding: '12px',
              borderRadius: 8,
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (isRegister ? 'Registering...' : 'Signing in...') : (isRegister ? 'Register' : 'Sign in')}
          </button>
        </form>

        <div style={{ marginTop: 14, textAlign: 'center', color: '#9fb0c1' }}>
          {!isRegister && (
            <Link to="/forgot-password" style={{ color: '#ffb703', textDecoration: 'underline' }}>
              Forgot password?
            </Link>
          )}
          <p style={{ marginTop: 10 }}>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <span onClick={() => setIsRegister(false)} style={{ color: '#ffb703', textDecoration: 'underline', cursor: 'pointer' }}>
                  Login
                </span>
              </>
            ) : (
              <>
                Don&apos;t have an account?{' '}
                <span onClick={() => setIsRegister(true)} style={{ color: '#ffb703', textDecoration: 'underline', cursor: 'pointer' }}>
                  Register
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function inputStyle() {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    background: '#333',
    border: '1px solid #555',
    color: '#fff',
    marginTop: 6,
    boxSizing: 'border-box'
  };
}
