import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const vehicleIcons = { Cab: '🚕', Auto: '🛺', Bus: '🚌', Bike: '🏍️', Other: '🚗' };

export default function Rides() {
  const [rides, setRides] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ vehicleNumber: '', vehicleType: 'Cab', driverName: '', fromLocation: '', toLocation: '' });

  useEffect(() => { loadRides(); }, []);

  const loadRides = async () => {
    try { const { data } = await api.getRides(); setRides(data); } catch (e) {}
  };

  const logRide = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let coords = { lat: 12.9347, lng: 77.6243 };
      try {
        await new Promise(res => navigator.geolocation.getCurrentPosition(
          ({ coords: c }) => { coords = { lat: c.latitude, lng: c.longitude }; res(); }, res, { timeout: 5000 }
        ));
      } catch (e) {}
      await api.logRide({ ...form, coords });
      setShowForm(false);
      setForm({ vehicleNumber: '', vehicleType: 'Cab', driverName: '', fromLocation: '', toLocation: '' });
      loadRides();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to log ride');
    } finally { setLoading(false); }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🚕 Ride Log</h1>
        <button className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Log Ride'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={logRide} className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Log This Ride</h3>
          <div>
            <label className="label">Vehicle Type</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Cab', 'Auto', 'Bus', 'Bike', 'Other'].map((type) => (
                <button key={type} type="button"
                  onClick={() => setForm({ ...form, vehicleType: type })}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: form.vehicleType === type ? 'var(--rose)' : 'var(--border)',
                    background: form.vehicleType === type ? 'var(--rose-glow)' : 'var(--bg3)',
                    color: form.vehicleType === type ? 'var(--rose)' : 'var(--muted)',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  }}
                >
                  {vehicleIcons[type]} {type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Vehicle Number</label>
            <input className="input" placeholder="e.g. KA 01 AB 1234" value={form.vehicleNumber}
              onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} required />
          </div>
          <div>
            <label className="label">Driver Name</label>
            <input className="input" placeholder="Driver's name (optional)" value={form.driverName}
              onChange={e => setForm({ ...form, driverName: e.target.value })} />
          </div>
          <div>
            <label className="label">From</label>
            <input className="input" placeholder="Pickup location" value={form.fromLocation}
              onChange={e => setForm({ ...form, fromLocation: e.target.value })} required />
          </div>
          <div>
            <label className="label">To</label>
            <input className="input" placeholder="Drop location" value={form.toLocation}
              onChange={e => setForm({ ...form, toLocation: e.target.value })} required />
          </div>
          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: '#93c5fd' }}>
            📱 This ride info will be shared with your emergency contacts (simulated SMS).
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Logging...' : 'Log Ride & Share with Contacts'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rides.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>
            No rides logged yet. Log your first ride!
          </div>
        )}
        {rides.map((ride) => (
          <div key={ride._id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '28px' }}>{vehicleIcons[ride.vehicleType] || '🚗'}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{ride.vehicleNumber}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{ride.vehicleType} · Driver: {ride.driverName || 'N/A'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted)' }}>
              <span>{ride.fromLocation}</span>
              <span style={{ color: 'var(--rose)' }}>→</span>
              <span>{ride.toLocation}</span>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {new Date(ride.loggedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              {ride.sharedWith?.length > 0 && (
                <span style={{ fontSize: '11px', color: '#6ee7b7' }}>
                  ✅ Shared with {ride.sharedWith.length} contacts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
