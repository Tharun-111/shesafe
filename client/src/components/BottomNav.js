import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/alerts', label: 'Alerts', icon: '📍' },
  { path: '/trips', label: 'Trips', icon: '🧭' },
  { path: '/buddy', label: 'Buddy', icon: '🤝' },
  { path: '/contacts', label: 'Contacts', icon: '👥' },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--bg2)', borderTop: '1px solid var(--border)',
      display: 'flex', zIndex: 900,
    }}>
      {tabs.map((tab) => {
        const active = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1, padding: '10px 4px 8px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
              color: active ? 'var(--rose)' : 'var(--muted)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: '20px', lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.03em',
            }}>
              {tab.label}
            </span>
            {active && (
              <div style={{
                position: 'absolute', bottom: 0, width: '32px', height: '2px',
                background: 'var(--rose)', borderRadius: '2px 2px 0 0',
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
