import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SOSProvider } from './context/SOSContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Trips from './pages/Trips';
import Rides from './pages/Rides';
import CommunityAlerts from './pages/CommunityAlerts';
import BuddySystem from './pages/BuddySystem';
import TrackSOS from './pages/TrackSOS';
import DiscreetMode from './pages/DiscreetMode';
import Contacts from './pages/Contacts';

// Components
import BottomNav from './components/BottomNav';
import SOSButton from './components/SOSButton';
import SOSCountdownModal from './components/SOSCountdownModal';
import SOSActiveBar from './components/SOSActiveBar';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--rose)' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const AppShell = ({ children }) => (
  <SOSProvider>
    <SOSCountdownModal />
    <SOSActiveBar />
    {children}
    <SOSButton />
    <BottomNav />
  </SOSProvider>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/track/:trackingId" element={<TrackSOS />} />
      <Route path="/discreet" element={<DiscreetMode />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppShell><Home /></AppShell></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><AppShell><Trips /></AppShell></ProtectedRoute>} />
      <Route path="/rides" element={<ProtectedRoute><AppShell><Rides /></AppShell></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AppShell><CommunityAlerts /></AppShell></ProtectedRoute>} />
      <Route path="/buddy" element={<ProtectedRoute><AppShell><BuddySystem /></AppShell></ProtectedRoute>} />
      <Route path="/contacts" element={<ProtectedRoute><AppShell><Contacts /></AppShell></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
