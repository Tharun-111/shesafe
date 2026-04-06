import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import MapComponent from '../components/MapComponent';

export default function TrackSOS() {
  const { trackingId } = useParams();
  const [sosData, setSosData] = useState(null);
  const [error, setError] = useState('');
  const [liveLocation, setLiveLocation] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    // Load SOS data
    api.getSOSByTracking(trackingId)
      .then(({ data }) => {
        setSosData(data);
        if (data.locationHistory?.length > 0) {
          const last = data.locationHistory[data.locationHistory.length - 1];
          setLiveLocation({ lat: last.lat, lng: last.lng });
        }
      })
      .catch(() => setError('Tracking ID not found or expired.'));

    // Join real-time tracking room
    socket.emit('track:join', trackingId);
    socket.on(`sos:location:${trackingId}`, ({ lat, lng }) => {
      setLiveLocation({ lat, lng });
      setSosData(prev => prev ? {
        ...prev,
        locationHistory: [...(prev.locationHistory || []), { lat, lng, timestamp: new Date() }]
      } : prev);
    });
    socket.on(`sos:resolved:${trackingId}`, ({ status }) => {
      setSosData(prev => prev ? { ...prev, status } : prev);
    });

    return () => {
      socket.off(`sos:location:${trackingId}`);
      socket.off(`sos:resolved:${trackingId}`);
    };
  }, [trackingId]);

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'var(--bg)', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ color: 'var(--rose)', marginBottom: '8px' }}>Not Found</h2>
        <p style={{ color: 'var(--muted)' }}>{error}</p>
      </div>
    </div>
  );

  if (!sosData) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--rose)' }}>
      Loading tracking data...
    </div>
  );

  const isActive = sosData.status === 'ACTIVE';
  const lastLocation = liveLocation || (sosData.locationHistory?.length > 0 ? sosData.locationHistory[sosData.locationHistory.length - 1] : null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '0' }}>
      {/* Status Banner */}
      <div style={{
        background: isActive ? 'var(--rose)' : 'var(--success)',
        padding: '16px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isActive ? '🔴 LIVE SOS TRACKING' : '✅ SOS RESOLVED'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'white', fontFamily: 'Sora, sans-serif' }}>
            {sosData.user?.name || 'Unknown User'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>Tracking ID</div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>{trackingId}</div>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: '55vh', background: 'var(--bg3)' }}>
        {lastLocation ? (
          <MapComponent
            center={[lastLocation.lat, lastLocation.lng]}
            zoom={15}
            userLocation={lastLocation}
            trackingPoints={sosData.locationHistory || []}
          />
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }}>
            Waiting for location data...
          </div>
        )}
      </div>

      {/* Info panel */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Last known location */}
        {lastLocation && (
          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>
              {isActive ? '📍 LIVE LOCATION' : '📍 LAST KNOWN LOCATION'}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '15px', color: isActive ? 'var(--rose)' : 'var(--success)' }}>
              {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
              {sosData.locationHistory?.length || 0} location updates received
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="card">
          <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, marginBottom: '10px' }}>SOS TIMELINE</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px' }}>🚨</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>SOS Triggered</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                  {new Date(sosData.triggeredAt).toLocaleString()}
                </div>
              </div>
            </div>
            {!isActive && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px' }}>✅</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>Resolved: {sosData.status}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {sosData.resolvedAt ? new Date(sosData.resolvedAt).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Alerts sent */}
        {sosData.alertsSent?.length > 0 && (
          <div className="card">
            <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 700, marginBottom: '10px' }}>
              📱 CONTACTS ALERTED ({sosData.alertsSent.length})
            </div>
            {sosData.alertsSent.map((alert, i) => (
              <div key={i} style={{ padding: '8px', background: 'var(--bg3)', borderRadius: '8px', marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>{alert.contactName}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{alert.contactPhone}</div>
                <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>✅ {alert.status}</div>
              </div>
            ))}
          </div>
        )}

        {isActive && (
          <div style={{ padding: '14px', background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)', borderRadius: '12px', textAlign: 'center', fontSize: '13px', color: 'var(--rose-light)' }}>
            🔴 Live tracking active · Location updates every 60 seconds
          </div>
        )}
      </div>
    </div>
  );
}
