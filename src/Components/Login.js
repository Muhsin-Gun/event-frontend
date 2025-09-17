// in src/Components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// If you use an AuthContext to store token & role
// import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  // const { setAuthUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        const user = res.data.user; // expect { id, email, role, ... }
        const token = res.data.token; // if backend returns JWT

        // Save token & role locally
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role);

        // optionally via context
        // setAuthUser({ token, role: user.role });

        // navigate based on role
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'employee') navigate('/employee');
        else if (user.role === 'client') navigate('/client');
        else navigate('/'); // fallback
      } else {
        alert('Login failed: ' + (res.data.message || 'Unknown'));
      }
    } catch (err) {
      console.error('Login error', err);
      alert('Login failed');
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-row">
            <label>Email
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
          </div>
          <div className="form-row">
            <label>Password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" className="btn">Login</button>
        </form>
      </div>
    </section>
  );
}


