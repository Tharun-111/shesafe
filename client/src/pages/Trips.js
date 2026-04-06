import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const statusBadge = { ONGOING: 'badge-blue', SAFE: 'badge-green', OVERDUE: 'badge-red', CANCELLED: 'badge-yellow' };
const statusIcon = { ONGOING: '🧭', SAFE: '✅', OVERDUE: '⚠️', CANCELLED: '❌' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ destination: '', startLocation: '', etaDate: '', etaTime: '' });

  useEffect(() => { loadTrips(); }, []);

  const loadTrips = async () => {
    try {
      const { data } = await api.getTrips();
      setTrips(data);
    } catch (e) {}
  };

  const startTrip = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eta = new Date(`${form.etaDate}T${form.etaTime}`).toISOString();
      let coords = { lat: 12.9347, lng: 77.6243 };
      try {
        await new Promise((res) => navigator.geolocation.getCurrentPosition(
          ({ coords: c }) => { coords = { lat: c.latitude, lng: c.longitude }; res(); },
          res, { timeout: 5000 }
        ));
      } catch (e) {}
      await api.startTrip({ ...form, eta, startCoords: coords });
      setShowForm(false);
      setForm({ destination: '', startLocation: '', etaDate: '', etaTime: '' });
      loadTrips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  const markSafe = async (id) => {
    await api.markTripSafe(id);
    loadTrips();
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🧭 Trips</h1>
        <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Trip'}
        </button>
      </div>

      {/* New Trip Form */}
      {showForm && (
        <form onSubmit={startTrip} className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Start a New Trip</h3>
          <div>
            <label className="label">From (Start Location)</label>
            <input className="input" placeholder="e.g. Home, Koramangala"
              value={form.startLocation} onChange={e => setForm({ ...form, startLocation: e.target.value })} required />
          </div>
          <div>
            <label className="label">Destination</label>
            <input className="input" placeholder="e.g. Office, MG Road"
              value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="label">ETA Date</label>
              <input className="input" type="date"
                value={form.etaDate} onChange={e => setForm({ ...form, etaDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="label">ETA Time</label>
              <input className="input" type="time"
                value={form.etaTime} onChange={e => setForm({ ...form, etaTime: e.target.value })} required />
            </div>
          </div>
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#fcd34d' }}>
            ⚠️ If you don't mark yourself safe 10 min after ETA, your contacts will be auto-alerted.
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Starting...' : 'Start Trip & Notify Contacts'}
          </button>
        </form>
      )}

      {/* Trip History */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {trips.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
            No trips yet. Start your first trip!
          </div>
        )}
        {trips.map((trip) => (
          <div key={trip._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '16px' }}>{statusIcon[trip.status]}</span>
                  <span style={{ fontWeight: 700, fontSize: '15px' }}>{trip.destination}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--muted)' }}>From: {trip.startLocation}</div>
              </div>
              <span className={`badge ${statusBadge[trip.status]}`}>{trip.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--muted)' }}>
              <span>Started: {new Date(trip.startedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
              <span>ETA: {new Date(trip.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {trip.status === 'ONGOING' && (
              <button className="btn btn-success" style={{ marginTop: '12px', width: '100%', padding: '12px' }} onClick={() => markSafe(trip._id)}>
                ✅ Mark Me Safe
              </button>
            )}
            {trip.status === 'OVERDUE' && (
              <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '13px', color: '#fca5a5' }}>
                🚨 Auto-alert sent to your contacts!
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
