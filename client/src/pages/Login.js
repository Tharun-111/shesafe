import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => setForm({ email: 'priya@shesafe.com', password: 'demo1234' });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px', background: 'var(--bg)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛡️</div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--rose)', fontFamily: 'Sora, sans-serif' }}>
          SheSafe
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '6px' }}>
          Your Women's Safety Companion
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" placeholder="you@email.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', color: '#fca5a5', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        {/* Demo shortcut */}
        <button type="button" onClick={fillDemo} className="btn btn-ghost" style={{ width: '100%', fontSize: '13px' }}>
          🎯 Fill Demo Credentials
        </button>
      </form>

      <p style={{ marginTop: '24px', color: 'var(--muted)', fontSize: '14px' }}>
        No account?{' '}
        <Link to="/register" style={{ color: 'var(--rose)', fontWeight: 700, textDecoration: 'none' }}>
          Register
        </Link>
      </p>

      <p style={{ marginTop: '12px', color: 'var(--muted)', fontSize: '12px' }}>
        <Link to="/discreet" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
          🔒 Discreet Mode
        </Link>
      </p>
    </div>
  );
}
