import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Priya Sharma' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'priya@email.com' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '9876543210' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 6 characters' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛡️</div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--rose)', fontFamily: 'Sora, sans-serif' }}>
          Create Account
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '4px' }}>
          Join SheSafe — Stay protected
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {fields.map(({ key, label, type, placeholder }) => (
          <div key={key}>
            <label className="label">{label}</label>
            <input className="input" type={type} placeholder={placeholder}
              value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
          </div>
        ))}

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#fca5a5', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px', marginTop: '4px' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '14px' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: 'var(--rose)', fontWeight: 700, textDecoration: 'none' }}>
          Sign In
        </Link>
      </p>
    </div>
  );
}
