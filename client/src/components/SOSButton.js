import React from 'react';
import { useSOS } from '../context/SOSContext';

export default function SOSButton() {
  const { sosActive, initiateSOS, countdown } = useSOS();

  if (sosActive || countdown !== null) return null; // Hide when SOS active (bar shows instead)

  return (
    <button
      onClick={initiateSOS}
      style={{
        position: 'fixed',
        bottom: '84px',
        right: '20px',
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'var(--rose)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 0 var(--rose-glow)',
        animation: 'sos-pulse 2s infinite',
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Sora, sans-serif',
        fontWeight: 800,
        fontSize: '13px',
        gap: '2px',
        letterSpacing: '0.05em',
      }}
      aria-label="Trigger SOS"
    >
      <span style={{ fontSize: '20px', lineHeight: 1 }}>🆘</span>
      <span>SOS</span>
      <style>{`
        @keyframes sos-pulse {
          0% { box-shadow: 0 0 0 0 rgba(225,29,72,0.5); }
          70% { box-shadow: 0 0 0 16px rgba(225,29,72,0); }
          100% { box-shadow: 0 0 0 0 rgba(225,29,72,0); }
        }
      `}</style>
    </button>
  );
}
