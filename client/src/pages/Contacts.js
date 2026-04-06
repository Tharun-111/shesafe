import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '', email: '' });

  useEffect(() => { loadContacts(); }, []);

  const loadContacts = async () => {
    try { const { data } = await api.getContacts(); setContacts(data); } catch (e) {}
  };

  const addContact = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.addContact(form);
      setShowForm(false);
      setForm({ name: '', phone: '', relationship: '', email: '' });
      loadContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add contact');
    } finally { setLoading(false); }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Remove this contact?')) return;
    await api.deleteContact(id);
    loadContacts();
  };

  const relationshipIcons = { Mother: '👩', Father: '👨', Sister: '👧', Brother: '🧑', Husband: '💍', Friend: '👫', Other: '👤', Contact: '👤' };

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>👥 Contacts</h1>
        <button className="btn btn-primary" style={{ padding: '10px 14px', fontSize: '13px' }} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
        These contacts receive simulated SMS alerts when you trigger SOS, start a trip, or log a ride.
      </p>

      {contacts.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', marginBottom: '16px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>👥</div>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>No emergency contacts yet.</p>
          <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '6px' }}>Add at least one contact to enable SOS alerts.</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={addContact} className="card" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '16px' }}>Add Emergency Contact</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="Contact's name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" type="tel" placeholder="10-digit phone number" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="label">Relationship</label>
            <select className="input" value={form.relationship} onChange={e => setForm({ ...form, relationship: e.target.value })}>
              <option value="">Select relationship</option>
              {['Mother', 'Father', 'Sister', 'Brother', 'Husband', 'Friend', 'Other'].map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input className="input" type="email" placeholder="contact@email.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '14px' }}>
            {loading ? 'Adding...' : 'Add Contact'}
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {contacts.map((contact) => (
          <div key={contact._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: 'var(--rose-glow)', border: '2px solid var(--rose)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
              flexShrink: 0,
            }}>
              {relationshipIcons[contact.relationship] || '👤'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{contact.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{contact.phone}</div>
              {contact.relationship && (
                <div style={{ fontSize: '11px', color: 'var(--rose-light)', marginTop: '2px' }}>{contact.relationship}</div>
              )}
            </div>
            <button
              onClick={() => deleteContact(contact._id)}
              style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', padding: '8px' }}
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {contacts.length > 0 && (
        <div style={{ marginTop: '24px', padding: '14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', fontSize: '13px', color: '#6ee7b7' }}>
          ✅ {contacts.length} contact{contacts.length > 1 ? 's' : ''} will receive alerts during emergencies
        </div>
      )}
    </div>
  );
}
