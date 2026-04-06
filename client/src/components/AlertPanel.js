import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const typeColors = {
  SOS: { bg: 'rgba(225,29,72,0.12)', color: 'var(--rose-light)', icon: '🚨' },
  TRIP: { bg: 'rgba(59,130,246,0.12)', color: '#93c5fd', icon: '🧭' },
  RIDE: { bg: 'rgba(139,92,246,0.12)', color: '#c4b5fd', icon: '🚕' },
  SAFE: { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', icon: '✅' },
};

export default function AlertPanel() {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlertInbox()
      .then(({ data }) => setInbox(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ color: 'var(--muted)', fontSize: '14px', padding: '20px', textAlign: 'center' }}>Loading alerts...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700 }}>📱 Simulated SMS Inbox</h3>
        <span className="badge badge-blue">{inbox.length} messages</span>
      </div>

      {inbox.length === 0 && (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '32px' }}>
          No alerts sent yet.<br />
          <small>Trigger SOS, start a trip, or log a ride to see simulated SMS alerts here.</small>
        </div>
      )}

      {inbox.slice(0, 10).map((item, i) => {
        const style = typeColors[item.type] || typeColors.SAFE;
        return (
          <div key={i} className="card" style={{ background: style.bg, borderColor: 'transparent', padding: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '20px' }}>{style.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: style.color }}>
                    To: {item.contactName} ({item.contactPhone})
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{item.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
