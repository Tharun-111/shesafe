import React, { createContext, useContext, useState, useRef } from 'react';
import axios from 'axios';

const SOSContext = createContext(null);

export const SOSProvider = ({ children }) => {
  const [sosActive, setSosActive] = useState(false);
  const [sosId, setSosId] = useState(null);
  const [trackingId, setTrackingId] = useState(null);
  const [countdown, setCountdown] = useState(null); // 5-sec cancel countdown
  const locationIntervalRef = useRef(null);
  const countdownRef = useRef(null);

  // Get current GPS position
  const getPosition = () =>
    new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      })
    );

  // Start 5-second countdown before firing SOS
  const initiateSOS = () => {
    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          fireSOS();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(countdownRef.current);
    setCountdown(null);
  };

  const fireSOS = async () => {
    try {
      let lat = 12.9347; // fallback coords (Bangalore)
      let lng = 77.6243;
      try {
        const pos = await getPosition();
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch (e) {
        console.warn('GPS unavailable, using fallback');
      }

      const { data } = await axios.post('/api/sos/trigger', { lat, lng });
      setSosActive(true);
      setSosId(data.sosId);
      setTrackingId(data.trackingId);

      // Update location every 60 seconds
      locationIntervalRef.current = setInterval(async () => {
        try {
          const pos = await getPosition();
          await axios.put(`/api/sos/${data.sosId}/location`, {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        } catch (e) { /* silent */ }
      }, 60000);
    } catch (err) {
      console.error('SOS trigger failed:', err);
    }
  };

  const resolveSOS = async (status = 'RESOLVED') => {
    if (!sosId) return;
    clearInterval(locationIntervalRef.current);
    await axios.put(`/api/sos/${sosId}/resolve`, { status });
    setSosActive(false);
    setSosId(null);
    setTrackingId(null);
  };

  return (
    <SOSContext.Provider value={{ sosActive, sosId, trackingId, countdown, initiateSOS, cancelSOS, resolveSOS }}>
      {children}
    </SOSContext.Provider>
  );
};

export const useSOS = () => useContext(SOSContext);
