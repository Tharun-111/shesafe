import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet icon path issue in CRA
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom alert icon
const alertIcon = (severity) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:${severity === 'HIGH' ? '#ef4444' : severity === 'MEDIUM' ? '#f59e0b' : '#6b7280'};
    border:3px solid white;display:flex;align-items:center;justify-content:center;
    font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.4);
  ">⚠️</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// User location icon
const userIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:20px;height:20px;border-radius:50%;
    background:#e11d48;border:3px solid white;
    box-shadow:0 0 0 6px rgba(225,29,72,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function MapComponent({ center, zoom = 13, alerts = [], userLocation, trackingPoints = [] }) {
  return (
    <MapContainer
      center={center || [12.9347, 77.6243]}
      zoom={zoom}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />

      {/* Community alerts as markers */}
      {alerts.map((alert) => (
        <React.Fragment key={alert._id}>
          <Marker position={[alert.coords.lat, alert.coords.lng]} icon={alertIcon(alert.severity)}>
            <Popup>
              <strong>{alert.type.replace(/_/g, ' ')}</strong><br />
              {alert.description}<br />
              <small>Votes: {alert.votes} · {alert.severity}</small>
            </Popup>
          </Marker>
          {/* Danger radius circle */}
          <Circle
            center={[alert.coords.lat, alert.coords.lng]}
            radius={300}
            pathOptions={{
              color: alert.severity === 'HIGH' ? '#ef4444' : alert.severity === 'MEDIUM' ? '#f59e0b' : '#6b7280',
              fillOpacity: 0.1, weight: 1,
            }}
          />
        </React.Fragment>
      ))}

      {/* User's current location */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* SOS tracking path */}
      {trackingPoints.length > 0 && trackingPoints.map((pt, i) => (
        <Marker key={i} position={[pt.lat, pt.lng]} icon={userIcon}>
          <Popup>Location at {new Date(pt.timestamp).toLocaleTimeString()}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
