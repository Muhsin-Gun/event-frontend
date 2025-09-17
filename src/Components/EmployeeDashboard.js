import React, { useState } from 'react';

export default function EmployeeDashboard() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [events, setEvents] = useState([]);

  // Add a new event to the list
  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title || !date) return;
    const newEvent = { id: Date.now(), title, date };
    setEvents([...events, newEvent]);
    setTitle('');
    setDate('');
  };

  // Delete an event by id
  const handleDeleteEvent = (id) => {
    setEvents(events.filter((evt) => evt.id !== id));
  };

  const containerStyle = {
    background: '#121212',
    padding: '20px',
    minHeight: '100vh',
    color: '#ffffff'
  };
  const inputStyle = {
    padding: '8px',
    margin: '5px 0 15px 0',
    borderRadius: '4px',
    border: '1px solid #555',
    width: '100%',
    background: '#1e1e1e',
    color: '#ffffff'
  };
  const buttonStyle = {
    background: '#e3a008',  // amber accent
    color: '#fff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };
  const thTdStyle = {
    border: '1px solid #555',
    padding: '12px',
    textAlign: 'left'
  };

  return (
    <div style={containerStyle}>
      <h2>Employee Dashboard</h2>
      {/* Form to add an event */}
      <form onSubmit={handleAddEvent} style={{ marginBottom: '20px', maxWidth: '400px' }}>
        <label>
          Title:<br />
          <input
            style={inputStyle}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
          />
        </label>
        <label>
          Date:<br />
          <input
            style={inputStyle}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button style={buttonStyle} type="submit">Add Event</button>
      </form>

      {/* Table of events */}
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thTdStyle}>Title</th>
            <th style={thTdStyle}>Date</th>
            <th style={thTdStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((evt) => (
            <tr key={evt.id}>
              <td style={thTdStyle}>{evt.title}</td>
              <td style={thTdStyle}>{evt.date}</td>
              <td style={thTdStyle}>
                <button
                  style={buttonStyle}
                  onClick={() => handleDeleteEvent(evt.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td style={thTdStyle} colSpan="3">No events added yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
