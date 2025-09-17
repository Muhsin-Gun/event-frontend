// src/Components/Register.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '../contexts/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // send role: 'client' explicitly or backend default
      const res = await axios.post('/api/auth/register', {
        ...form,
        role: 'client',
      });
      if (res.data.success) {
        // maybe auto-login
        const user = res.data.user;
        const token = res.data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userRole', user.role);
        navigate('/client');
      } else {
        alert('Register failed: ' + (res.data.message || 'Unknown'));
      }
    } catch (err) {
      console.error('Register error', err);
      alert('Register failed');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Register as Client</h2>
        <form onSubmit={handleRegister}>
          <div className="form-row">
            <label>Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>Password
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit" className="btn">Sign Up (Client)</button>
        </form>
      </div>
    </section>
  );
}
