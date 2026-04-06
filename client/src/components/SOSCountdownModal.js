import React from 'react';
import { useSOS } from '../context/SOSContext';

export default function SOSCountdownModal() {
  const { countdown, cancelSOS } = useSOS();

  if (countdown === null) return null;

  const progress = ((5 - countdown) / 5) * 100;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, backdropFilter: 'blur(6px)',
    }}>
      <div style={{
        background: 'var(--bg2)', borderRadius: '24px', padding: '40px 32px',
        textAlign: 'center', maxWidth: '320px', width: '90%',
        border: '1px solid rgba(225,29,72,0.3)',
        animation: 'slideUp 0.3s ease',
      }}>
        {/* Countdown ring */}
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px' }}>
          <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="60" cy="60" r="54" fill="none" stroke="var(--bg3)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke="var(--rose)" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '48px', fontWeight: 800, color: 'var(--rose)',
            fontFamily: 'Sora, sans-serif',
          }}>
            {countdown}
          </div>
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '8px', color: 'var(--rose)' }}>
          SOS Activating
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '28px', lineHeight: 1.5 }}>
          Sending emergency alerts to your contacts in <strong style={{ color: 'white' }}>{countdown} seconds</strong>
        </p>

        <button
          onClick={cancelSOS}
          style={{
            width: '100%', padding: '16px', borderRadius: '12px',
            background: 'var(--bg3)', border: '1.5px solid var(--border)',
            color: 'white', fontSize: '16px', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          Cancel — I'm Safe
        </button>
      </div>
    </div>
  );
}
