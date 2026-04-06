import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import ChatWindow from '../components/ChatWindow';

const statusColors = { OPEN: 'badge-blue', MATCHED: 'badge-green', CANCELLED: 'badge-yellow', COMPLETED: 'badge-green' };

export default function BuddySystem() {
  const [myRequests, setMyRequests] = useState([]);
  const [openRequests, setOpenRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeChatRoom, setActiveChatRoom] = useState(null);
  const [tab, setTab] = useState('mine');
  const [form, setForm] = useState({ fromLocation: '', toLocation: '', travelTime: '', travelDate: '' });
  const socket = getSocket();

  useEffect(() => {
    loadData();
    socket.on('buddy:matched', ({ chatRoomId }) => {
      alert('🎉 You have been matched with a travel buddy!');
      setActiveChatRoom(chatRoomId);
      loadData();
    });
    return () => socket.off('buddy:matched');
  }, []);

  const loadData = async () => {
    try {
      const [mine, open] = await Promise.all([api.getMyBuddyRequests(), api.getOpenBuddyRequests()]);
      setMyRequests(mine.data);
      setOpenRequests(open.data);
    } catch (e) {}
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.createBuddyRequest(form);
      if (data.chatRoomId) {
        alert('🎉 Instantly matched with a buddy!');
        setActiveChatRoom(data.chatRoomId);
      } else {
        alert('✅ Request posted! You will be notified when matched.');
      }
      setShowForm(false);
      setForm({ fromLocation: '', toLocation: '', travelTime: '', travelDate: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit request');
    } finally { setLoading(false); }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      {activeChatRoom && <ChatWindow chatRoomId={activeChatRoom} onClose={() => setActiveChatRoom(null)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>🤝 Buddy System</h1>
        <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '13px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Request Buddy'}
        </button>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.5 }}>
        Find a travel companion with a similar route for safer commutes.
      </p>

      {showForm && (
        <form onSubmit={submitRequest} className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Find a Travel Buddy</h3>
          <div>
            <label className="label">From</label>
            <input className="input" placeholder="e.g. Koramangala" value={form.fromLocation}
              onChange={e => setForm({ ...form, fromLocation: e.target.value })} required />
          </div>
          <div>
            <label className="label">To</label>
            <input className="input" placeholder="e.g. MG Road" value={form.toLocation}
              onChange={e => setForm({ ...form, toLocation: e.target.value })} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label className="label">Date</label>
              <input className="input" type="date" min={today} value={form.travelDate}
                onChange={e => setForm({ ...form, travelDate: e.target.value })} required />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" value={form.travelTime}
                onChange={e => setForm({ ...form, travelTime: e.target.value })} required />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Searching...' : '🔍 Find Buddy'}
          </button>
        </form>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0', marginBottom: '16px', background: 'var(--bg3)', borderRadius: '10px', padding: '4px' }}>
        {['mine', 'open'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: tab === t ? 'var(--rose)' : 'transparent',
              color: tab === t ? 'white' : 'var(--muted)',
              fontWeight: 700, fontSize: '13px', transition: 'all 0.2s',
            }}>
            {t === 'mine' ? `My Requests (${myRequests.length})` : `Open Buddies (${openRequests.length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tab === 'mine' && (
          myRequests.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No buddy requests yet.</div>
            : myRequests.map((req) => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span>{req.fromLocation}</span>
                      <span style={{ color: 'var(--rose)' }}>→</span>
                      <span>{req.toLocation}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {req.travelDate} at {req.travelTime}
                    </div>
                    {req.status === 'MATCHED' && (
                      <div style={{ fontSize: '12px', color: '#6ee7b7', marginTop: '4px' }}>
                        Matched with: {req.user2?.name || 'A buddy'}
                      </div>
                    )}
                  </div>
                  <span className={`badge ${statusColors[req.status]}`}>{req.status}</span>
                </div>
                {req.status === 'MATCHED' && req.chatRoomId && (
                  <button className="btn btn-primary" style={{ width: '100%', padding: '10px', fontSize: '13px' }}
                    onClick={() => setActiveChatRoom(req.chatRoomId)}>
                    💬 Open Chat
                  </button>
                )}
              </div>
            ))
        )}

        {tab === 'open' && (
          openRequests.length === 0
            ? <div className="card" style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No open buddy requests near you.<br/><small>Be the first to post!</small></div>
            : openRequests.map((req) => (
              <div key={req._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700 }}>{req.user1?.name}</div>
                  <span className="badge badge-blue">OPEN</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '4px' }}>
                  <span>{req.fromLocation}</span>
                  <span style={{ color: 'var(--rose)' }}>→</span>
                  <span>{req.toLocation}</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {req.travelDate} at {req.travelTime}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
