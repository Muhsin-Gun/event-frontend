import React, { useState } from 'react';

export default function AdminAuth() {
  const [view, setView] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('adminToken', data.token);
        window.location.href = '/admin-dashboard';
      } else setError(data.message || 'Login failed');
    } catch {
      setError('Login error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/auth/admin-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();
      if (res.ok) {
        alert('Admin registered successfully. Please login.');
        setView('login');
      } else setError(data.message || 'Registration failed');
    } catch {
      setError('Registration error');
    }
  };

  if (view === 'login')
    return (
      <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
        <h2>Admin Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required style={{ display:'block', width:'100%', marginBottom:'10px', padding:'8px'}} />
          <input type="password" placeholder="Password" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required style={{ display:'block', width:'100%', marginBottom:'10px', padding:'8px'}} />
          <button type="submit" style={{ padding:'10px 20px', background:'blue', color:'#fff', border:'none', cursor:'pointer' }}>Login</button>
        </form>
        <p>Don’t have an account? <span style={{ color:'cyan', cursor:'pointer' }} onClick={() => setView('register')}>Register</span></p>
      </div>
    );

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Admin Register</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" value={registerData.username} onChange={e => setRegisterData({ ...registerData, username: e.target.value })} required style={{ display:'block', width:'100%', marginBottom:'10px', padding:'8px'}} />
        <input type="email" placeholder="Email" value={registerData.email} onChange={e => setRegisterData({ ...registerData, email: e.target.value })} required style={{ display:'block', width:'100%', marginBottom:'10px', padding:'8px'}} />
        <input type="password" placeholder="Password" value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} required style={{ display:'block', width:'100%', marginBottom:'10px', padding:'8px'}} />
        <button type="submit" style={{ padding:'10px 20px', background:'green', color:'#fff', border:'none', cursor:'pointer' }}>Register</button>
      </form>
      <p>Already have an account? <span style={{ color:'cyan', cursor:'pointer' }} onClick={() => setView('login')}>Login</span></p>
    </div>
  );
}
