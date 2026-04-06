import React from 'react';
import { useSOS } from '../context/SOSContext';

export default function SOSActiveBar() {
  const { sosActive, trackingId, resolveSOS } = useSOS();

  if (!sosActive) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: 'var(--rose)', zIndex: 999,
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '18px', animation: 'sos-pulse 1s infinite' }}>🔴</span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: 'white', fontFamily: 'Sora, sans-serif' }}>
            SOS ACTIVE
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
            ID: {trackingId} · Contacts alerted
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <a
          href={`/track/${trackingId}`}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '6px 12px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.2)', color: 'white',
            fontSize: '12px', fontWeight: 700, textDecoration: 'none',
          }}
        >
          Track
        </a>
        <button
          onClick={() => resolveSOS('RESOLVED')}
          style={{
            padding: '6px 12px', borderRadius: '8px',
            background: 'white', color: 'var(--rose)',
            border: 'none', fontSize: '12px', fontWeight: 800, cursor: 'pointer',
          }}
        >
          I'm Safe ✓
        </button>
      </div>
    </div>
  );
}
