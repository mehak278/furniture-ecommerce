import React, { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const AdminLoginPage = () => {
  usePageTitle('Admin Login');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result?.user?.role !== 'admin') {
        toast.error('Access denied. Admin accounts only.');
        return;
      }
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛡️</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#fff' }}>FurniMart</h1>
          <p style={{ margin: '4px 0 0', color: '#4f9cf9', fontSize: '14px' }}>Admin Panel</p>
        </div>

        {/* Card */}
        <div style={{ background: '#1a1f2e', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(0,0,0,0.4)', border: '1px solid #2d3548' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#fff', textAlign: 'center' }}>Admin Sign In</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="admin@furnimart.com"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #2d3548', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#0f1117', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #2d3548', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#0f1117', color: '#fff' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#4f9cf9', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '13px', color: '#555' }}>
            <a href="/" style={{ color: '#4f9cf9', textDecoration: 'none' }}>← Back to store</a>
          </p>
        </div>
      </div>
    </div>
  );
};
