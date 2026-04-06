import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import MapComponent from '../components/MapComponent';

const typeIcons = { UNSAFE_AREA: '🔴', HARASSMENT: '😡', POOR_LIGHTING: '🌑', SUSPICIOUS: '👁️', ASSAULT: '⚠️', OTHER: '📍' };
const severityColors = { HIGH: 'badge-red', MEDIUM: 'badge-yellow', LOW: 'badge-blue' };

export default function CommunityAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ type: 'UNSAFE_AREA', description: '', location: '', severity: 'MEDIUM', anonymous: true });
  const socket = getSocket();

  useEffect(() => {
    loadAlerts();
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
      () => setUserLocation({ lat: 12.9347, lng: 77.6243 })
    );

    // Real-time new alerts
    socket.on('alert:new', (alert) => setAlerts(prev => [alert, ...prev]));
    socket.on('alert:voted', ({ alertId, votes }) => {
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, votes } : a));
    });
    return () => { socket.off('alert:new'); socket.off('alert:voted'); };
  }, []);

  const loadAlerts = async () => {
    try { const { data } = await api.getAlerts(); setAlerts(data); } catch (e) {}
  };

  const submitAlert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let coords = userLocation || { lat: 12.9347, lng: 77.6243 };
      await api.createAlert({ ...form, coords });
      setShowForm(false);
      setForm({ type: 'UNSAFE_AREA', description: '', location: '', severity: 'MEDIUM', anonymous: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit alert');
    } finally { setLoading(false); }
  };

  const vote = async (id) => {
    try { await api.voteAlert(id); }
    catch (err) { if (err.response?.status === 400) alert('You already voted on this alert'); }
  };

  // Demo: simulate danger for hackathon
  const simulateDanger = async () => {
    const dangers = [
      { type: 'HARASSMENT', description: 'DEMO: Group harassing women near bus stop', severity: 'HIGH' },
      { type: 'SUSPICIOUS', description: 'DEMO: Suspicious vehicle following pedestrians', severity: 'HIGH' },
      { type: 'POOR_LIGHTING', description: 'DEMO: Street lights broken on main road', severity: 'MEDIUM' },
    ];
    const d = dangers[Math.floor(Math.random() * dangers.length)];
    const offset = () => (Math.random() - 0.5) * 0.02;
    const coords = { lat: (userLocation?.lat || 12.9347) + offset(), lng: (userLocation?.lng || 77.6243) + offset() };
    await api.createAlert({ ...d, location: 'Near current location', coords, anonymous: true });
    loadAlerts();
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>📍 Community Alerts</h1>
        <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '13px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Report'}
        </button>
      </div>

      {/* Map */}
      <div style={{ marginBottom: '16px', borderRadius: '16px', overflow: 'hidden' }}>
        <MapComponent
          center={userLocation ? [userLocation.lat, userLocation.lng] : [12.9347, 77.6243]}
          alerts={alerts}
          userLocation={userLocation}
        />
      </div>

      {/* Demo Simulate button */}
      <button
        onClick={simulateDanger}
        className="btn"
        style={{ width: '100%', marginBottom: '16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '12px' }}
      >
        🎭 Simulate Danger (Demo)
      </button>

      {/* Report Form */}
      {showForm && (
        <form onSubmit={submitAlert} className="card" style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Report Unsafe Area</h3>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {['UNSAFE_AREA', 'HARASSMENT', 'POOR_LIGHTING', 'SUSPICIOUS', 'ASSAULT', 'OTHER'].map(t => (
                <option key={t} value={t}>{typeIcons[t]} {t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="Describe what you observed..."
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required
              style={{ resize: 'none' }} />
          </div>
          <div>
            <label className="label">Location (optional)</label>
            <input className="input" placeholder="e.g. Near Metro Station"
              value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          </div>
          <div>
            <label className="label">Severity</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['LOW', 'MEDIUM', 'HIGH'].map(s => (
                <button key={s} type="button" onClick={() => setForm({ ...form, severity: s })}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: '1.5px solid',
                    borderColor: form.severity === s ? 'var(--rose)' : 'var(--border)',
                    background: form.severity === s ? 'var(--rose-glow)' : 'var(--bg3)',
                    color: form.severity === s ? 'var(--rose)' : 'var(--muted)',
                    cursor: 'pointer', fontWeight: 700, fontSize: '13px',
                  }}>{s}</button>
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px' }}>
            <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} />
            <span style={{ color: 'var(--muted)' }}>Report anonymously</span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Submitting...' : 'Submit Alert'}
          </button>
        </form>
      )}

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 700 }}>
          {alerts.length} ACTIVE ALERTS (last 48hrs)
        </div>
        {alerts.map((alert) => (
          <div key={alert._id} className="card" style={{ padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px' }}>{typeIcons[alert.type] || '📍'}</span>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{alert.type.replace(/_/g, ' ')}</span>
              </div>
              <span className={`badge ${severityColors[alert.severity]}`}>{alert.severity}</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px', lineHeight: 1.4 }}>{alert.description}</p>
            {alert.location && <p style={{ fontSize: '12px', color: 'var(--rose-light)' }}>📍 {alert.location}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                By {alert.reporterName} · {new Date(alert.createdAt).toLocaleDateString()}
              </span>
              <button onClick={() => vote(alert._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '8px', padding: '5px 10px', color: 'var(--text)', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
                👍 {alert.votes}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
