import React, { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const VendorLoginPage = () => {
  usePageTitle('Vendor Login');
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      if (result?.user?.role !== 'vendor') {
        toast.error('This account is not a vendor account');
        return;
      }
      toast.success('Welcome back!');
      navigate('/vendor/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdfbf7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛋️</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#2c1a0e' }}>FurniMart</h1>
          <p style={{ margin: '4px 0 0', color: '#8B5E2A', fontSize: '14px' }}>Vendor Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 24px rgba(44,26,14,0.1)', border: '1px solid #f0e6d3' }}>
          <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 700, color: '#2c1a0e', textAlign: 'center' }}>Sign in to your store</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="vendor@example.com"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8d9c5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fdfbf7' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e8d9c5', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', background: '#fdfbf7' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: '#d4a054', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ margin: '20px 0 0', textAlign: 'center', fontSize: '13px', color: '#888' }}>
            Not a vendor yet?{' '}
            <Link to="/register" style={{ color: '#d4a054', fontWeight: 600, textDecoration: 'none' }}>Apply here</Link>
          </p>
          <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '13px', color: '#888' }}>
            <Link to="/" style={{ color: '#aaa', textDecoration: 'none' }}>← Back to store</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
