// Events.js (updated)
import React, { useEffect, useState, useCallback } from 'react';
import API_BASE from '../config/api';
import { Link, useNavigate } from 'react-router-dom';

export default function Events({ onOpenTicket }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {};
  };

  const parseBody = (body) => {
    if (!body) return [];
    if (Array.isArray(body)) return body;
    if (Array.isArray(body.data)) return body.data;
    if (Array.isArray(body.events)) return body.events;
    if (body.items && Array.isArray(body.items)) return body.items;
    return [];
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/events?limit=50`, {
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() }
      });

      const body = await resp.json().catch(() => null);
      console.debug('Events fetch', resp.status, body);

      if (resp.ok) {
        const data = parseBody(body);
        setEvents(data);
      } else {
        // If backend returns an object that is the events directly, try to handle it
        const maybeArray = Array.isArray(body) ? body : [];
        setEvents(maybeArray);
        console.warn('Events fetch failed', resp.status, body);
      }
    } catch (err) {
      console.error('loadEvents error', err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();

    // listen for global events changed signal
    const handler = () => {
      loadEvents();
    };
    window.addEventListener('events:changed', handler);

    return () => {
      window.removeEventListener('events:changed', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBook = (event) => {
    if (onOpenTicket) return onOpenTicket(event);

    const token = localStorage.getItem('authToken');
    if (!token) {
      return navigate('/login');
    }

    if (localStorage.getItem('userRole') === 'client' || !localStorage.getItem('userRole')) {
      navigate(`/payment?eventId=${event._id || event.id}`);
    } else {
      alert('Please use a client account to book tickets.');
    }
  };

  if (loading) return (
    <section id="events" className="section container" style={{ padding: 20 }}>
      <h2 style={{ color: '#fff' }}>Upcoming Events</h2>
      <p style={{ color: '#9fb0c1' }}>Loading events...</p>
    </section>
  );

  return (
    <section id="events" className="section container" style={{ padding: 20 }}>
      <h2 style={{ color: '#fff' }}>Upcoming Events</h2>
      <p style={{ color: '#9fb0c1' }}>Live events, track days and dealer showcases. Click a ticket to reserve.</p>

      <div className="events-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: 20,
        marginTop: 16
      }}>
        {events.length > 0 ? events.map(event => (
          <article key={event._id || event.id || JSON.stringify(event).slice(0, 40)} style={{
            background: '#1f1f2e',
            borderRadius: 12,
            padding: 18,
            border: '1px solid #333'
          }}>
            <div style={{ marginBottom: 10 }}>
              <h3 style={{ color: '#ffb703', margin: '0 0 8px 0' }}>{event.title}</h3>
              <div style={{ color: '#9fb0c1', fontSize: 13 }}>
                {event.date ? new Date(event.date).toLocaleDateString() : ''} • {event.location}
              </div>
            </div>
            <p style={{ color: '#9fb0c1', minHeight: 60 }}>{event.description}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button
                onClick={() => handleBook(event)}
                style={{
                  flex: 1,
                  background: '#ff3b3b',
                  color: '#fff',
                  border: 'none',
                  padding: 12,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {event.price ? `Book - KES ${event.price}` : 'Book Free Ticket'}
              </button>
              <Link
                to={`/events/${event._id || event.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid #555',
                  color: '#9fb0c1',
                  textDecoration: 'none',
                  minWidth: 110
                }}
              >
                Details
              </Link>
            </div>
          </article>
        )) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            color: '#9fb0c1',
            padding: 40
          }}>
            No events available at the moment. Check back soon!
          </div>
        )}
      </div>
    </section>
  );
}
