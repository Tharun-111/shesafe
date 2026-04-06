import axios from 'axios';

// API base URL - uses environment variable or proxy (for local dev)
const apiBaseURL = process.env.REACT_APP_API_URL || '';

const axiosInstance = axios.create({
  baseURL: apiBaseURL,
});

export const api = {
  // Contacts
  getContacts: () => axiosInstance.get('/api/contacts'),
  addContact: (data) => axiosInstance.post('/api/contacts', data),
  deleteContact: (id) => axiosInstance.delete(`/api/contacts/${id}`),
  getAlertInbox: () => axiosInstance.get('/api/contacts/inbox'),

  // Trips
  startTrip: (data) => axiosInstance.post('/api/trips/start', data),
  getTrips: () => axiosInstance.get('/api/trips'),
  getActiveTrip: () => axiosInstance.get('/api/trips/active'),
  markTripSafe: (id) => axiosInstance.put(`/api/trips/${id}/safe`),

  // Rides
  logRide: (data) => axiosInstance.post('/api/rides', data),
  getRides: () => axiosInstance.get('/api/rides'),

  // Alerts
  getAlerts: () => axiosInstance.get('/api/alerts'),
  createAlert: (data) => axiosInstance.post('/api/alerts', data),
  voteAlert: (id) => axiosInstance.put(`/api/alerts/${id}/vote`),
  getSafetyScore: (lat, lng) => axiosInstance.get(`/api/alerts/safety-score?lat=${lat}&lng=${lng}`),

  // Buddy
  createBuddyRequest: (data) => axiosInstance.post('/api/buddy/request', data),
  getMyBuddyRequests: () => axiosInstance.get('/api/buddy/my'),
  getOpenBuddyRequests: () => axiosInstance.get('/api/buddy/open'),

  // Messages
  getMessages: (roomId) => axiosInstance.get(`/api/messages/${roomId}`),

  // SOS tracking (public)
  getSOSByTracking: (trackingId) => axiosInstance.get(`/api/sos/track/${trackingId}`),
  getSOSHistory: () => axiosInstance.get('/api/sos/history'),
};
