// src/Components/EmployeeDashboard.js
import React, { useState } from 'react';
import axios from 'axios';

export default function EmployeeDashboard() {
  const [event, setEvent] = useState({ title: '', date: '', description: '' });

  const handleChange = e => setEvent({ ...event, [e.target.name]: e.target.value });
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', event);
      alert('Event created!');
      setEvent({ title: '', date: '', description: '' });
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    }
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Employee Dashboard</h2>
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <label>
              Event Title
              <input type="text" name="title" value={event.title} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Date
              <input type="date" name="date" value={event.date} onChange={handleChange} required />
            </label>
          </div>
          <div className="form-row">
            <label>
              Description
              <textarea name="description" value={event.description} onChange={handleChange} required />
            </label>
          </div>
          <button type="submit" className="btn">Add Event</button>
        </form>
      </div>
    </section>
  );
}
