// src/Components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: ''});
  const handleChange = e => setForm({...form, [e.target.name]: e.target.value});
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/register', form);
      if (res.data.success) {
        alert('Registration successful!');
        setForm({ name: '', email: '', password: ''});
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <div className="form-row">
            <label>
              Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit" className="btn">Sign Up</button>
        </form>
      </div>
    </section>
  );
}
