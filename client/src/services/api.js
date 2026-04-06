import axios from 'axios';

// All API calls are proxied to http://localhost:5000

export const api = {
  // Contacts
  getContacts: () => axios.get('/api/contacts'),
  addContact: (data) => axios.post('/api/contacts', data),
  deleteContact: (id) => axios.delete(`/api/contacts/${id}`),
  getAlertInbox: () => axios.get('/api/contacts/inbox'),

  // Trips
  startTrip: (data) => axios.post('/api/trips/start', data),
  getTrips: () => axios.get('/api/trips'),
  getActiveTrip: () => axios.get('/api/trips/active'),
  markTripSafe: (id) => axios.put(`/api/trips/${id}/safe`),

  // Rides
  logRide: (data) => axios.post('/api/rides', data),
  getRides: () => axios.get('/api/rides'),

  // Alerts
  getAlerts: () => axios.get('/api/alerts'),
  createAlert: (data) => axios.post('/api/alerts', data),
  voteAlert: (id) => axios.put(`/api/alerts/${id}/vote`),
  getSafetyScore: (lat, lng) => axios.get(`/api/alerts/safety-score?lat=${lat}&lng=${lng}`),

  // Buddy
  createBuddyRequest: (data) => axios.post('/api/buddy/request', data),
  getMyBuddyRequests: () => axios.get('/api/buddy/my'),
  getOpenBuddyRequests: () => axios.get('/api/buddy/open'),

  // Messages
  getMessages: (roomId) => axios.get(`/api/messages/${roomId}`),

  // SOS tracking (public)
  getSOSByTracking: (trackingId) => axios.get(`/api/sos/track/${trackingId}`),
  getSOSHistory: () => axios.get('/api/sos/history'),
};
