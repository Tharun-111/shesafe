import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSOS } from '../context/SOSContext';
import { api } from '../services/api';
import AlertPanel from '../components/AlertPanel';

export default function Home() {
  const { user, logout } = useAuth();
  const { sosActive, trackingId } = useSOS();
  const [safetyScore, setSafetyScore] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [showInbox, setShowInbox] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get safety score based on user's location (or fallback)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          api.getSafetyScore(coords.latitude, coords.longitude)
            .then(({ data }) => setSafetyScore(data))
            .catch(() => setSafetyScore({ safetyScore: 72, nearbyAlerts: 2 }));
        },
        () => {
          // Fallback: use Bangalore coords
          api.getSafetyScore(12.9347, 77.6243)
            .then(({ data }) => setSafetyScore(data))
            .catch(() => setSafetyScore({ safetyScore: 72, nearbyAlerts: 2 }));
        }
      );
    }

    api.getActiveTrip()
      .then(({ data }) => setActiveTrip(data))
      .catch(() => {});
  }, []);

  const scoreColor = safetyScore
    ? safetyScore.safetyScore >= 70 ? 'var(--success)'
      : safetyScore.safetyScore >= 40 ? 'var(--warning)'
      : 'var(--danger)'
    : 'var(--muted)';

  const markActiveTripSafe = async () => {
    if (!activeTrip) return;
    await api.markTripSafe(activeTrip._id);
    setActiveTrip(null);
  };

  return (
    <div className="page" style={{ paddingTop: sosActive ? '60px' : '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Welcome back,</p>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>{user?.name?.split(' ')[0]} 👋</h1>
        </div>
        <button onClick={logout} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px 14px', color: 'var(--muted)', fontSize: '13px', cursor: 'pointer' }}>
          Sign Out
        </button>
      </div>

      {/* Safety Score Card */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%)',
        border: `1px solid ${scoreColor}33`,
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Area Safety Score
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '42px', fontWeight: 800, color: scoreColor, fontFamily: 'Sora, sans-serif', lineHeight: 1 }}>
                {safetyScore ? safetyScore.safetyScore : '—'}
              </span>
              <span style={{ fontSize: '18px', color: 'var(--muted)' }}>/100</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {safetyScore ? `${safetyScore.nearbyAlerts} alerts nearby` : 'Fetching...'}
            </p>
          </div>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: `4px solid ${scoreColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
          }}>
            {!safetyScore ? '🔍' : safetyScore.safetyScore >= 70 ? '✅' : safetyScore.safetyScore >= 40 ? '⚠️' : '🔴'}
          </div>
        </div>
        <button
          onClick={() => navigate('/alerts')}
          style={{ marginTop: '14px', width: '100%', padding: '10px', background: `${scoreColor}22`, border: `1px solid ${scoreColor}44`, borderRadius: '8px', color: scoreColor, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
        >
          View Community Alerts Map →
        </button>
      </div>

      {/* Active Trip Banner */}
      {activeTrip && (
        <div className="card" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#93c5fd', fontWeight: 700 }}>🧭 ACTIVE TRIP</p>
              <p style={{ fontWeight: 700, marginTop: '2px' }}>{activeTrip.destination}</p>
              <p style={{ fontSize: '12px', color: 'var(--muted)' }}>
                ETA: {new Date(activeTrip.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <button className="btn btn-success" style={{ padding: '10px 16px', fontSize: '13px' }} onClick={markActiveTripSafe}>
              I'm Safe ✓
            </button>
          </div>
        </div>
      )}

      {/* SOS Active Status */}
      {sosActive && (
        <div className="card" style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.3)', marginBottom: '16px' }}>
          <p style={{ color: 'var(--rose)', fontWeight: 700, fontSize: '14px' }}>🚨 SOS ACTIVE</p>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            Tracking ID: <strong style={{ color: 'white' }}>{trackingId}</strong>
          </p>
          <a href={`/track/${trackingId}`} target="_blank" rel="noreferrer"
            style={{ display: 'inline-block', marginTop: '8px', color: 'var(--rose)', fontSize: '13px', fontWeight: 700 }}>
            Share Tracking Link →
          </a>
        </div>
      )}

      {/* Quick Actions */}
      <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', color: 'var(--muted)' }}>
        QUICK ACTIONS
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { icon: '🧭', label: 'Start Trip', sub: 'Share your journey', path: '/trips', color: '#3b82f6' },
          { icon: '🚕', label: 'Log Ride', sub: 'Share vehicle info', path: '/rides', color: '#8b5cf6' },
          { icon: '📍', label: 'Alert Map', sub: 'View danger zones', path: '/alerts', color: '#f59e0b' },
          { icon: '🤝', label: 'Find Buddy', sub: 'Travel together', path: '/buddy', color: '#10b981' },
        ].map(({ icon, label, sub, path, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="card"
            style={{ cursor: 'pointer', border: 'none', textAlign: 'left', padding: '16px' }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontWeight: 700, fontSize: '14px', color }}>{label}</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{sub}</div>
          </button>
        ))}
      </div>

      {/* Simulated SMS Inbox toggle */}
      <button
        onClick={() => setShowInbox(!showInbox)}
        style={{
          width: '100%', padding: '14px', borderRadius: '12px',
          background: 'var(--bg2)', border: '1px solid var(--border)',
          color: 'var(--text)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <span>📱 Simulated SMS Inbox</span>
        <span style={{ color: 'var(--muted)' }}>{showInbox ? '▲' : '▼'}</span>
      </button>

      {showInbox && <AlertPanel />}

      {/* Discreet mode link */}
      <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '8px' }}>
        <a href="/discreet" style={{ color: 'var(--muted)', fontSize: '12px', textDecoration: 'none' }}>
          🔒 Switch to Discreet Mode
        </a>
      </div>
    </div>
  );
}
