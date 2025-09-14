// src/Components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { email, password });
      if (res.data.success) {
        // Save token or user info, then navigate based on role
        const user = res.data.user;
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'employee') navigate('/employee');
        else navigate('/client');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label>
              Email
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Password
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </label>
          </div>
          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </section>
  );
}

