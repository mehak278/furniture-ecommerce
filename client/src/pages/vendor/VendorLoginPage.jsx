import React, { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const VendorLoginPage = () => {
  usePageTitle('Vendor Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setSubmitting(true);
    const result = await login(email, password);

    if (!result.success) {
      setSubmitting(false);
      toast.error(result.message);
      return;
    }

    const savedUser = JSON.parse(localStorage.getItem('user'));

    // Admin can always access vendor portal
    if (savedUser?.role === 'admin') {
      setSubmitting(false);
      navigate('/vendor/dashboard');
      return;
    }

    // Approved vendor — check if active/approved or redirect to become-vendor
    if (savedUser?.role === 'vendor') {
      try {
        await api.get('/vendor/dashboard');
        setSubmitting(false);
        toast.success('Welcome back!');
        navigate('/vendor/dashboard');
      } catch (err) {
        setSubmitting(false);
        if (err.response?.status === 403) {
          toast.success('Welcome! Redirecting to application status...');
          navigate('/become-vendor');
        } else {
          // On other errors, let route guard handle it
          navigate('/vendor/dashboard');
        }
      }
      return;
    }

    // Role is 'user' — check if they have a pending vendor application
    try {
      const { data } = await api.get('/vendor/my-status');
      setSubmitting(false);
      if (data.hasApplication) {
        // Application submitted but not yet approved — show pending page
        navigate('/vendor/pending');
      } else {
        // Not a vendor at all
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('You do not have a vendor account. Apply first.');
      }
    } catch {
      setSubmitting(false);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Access denied. Only vendors can login here.');
    }
  };

  const vendorThemeStyles = {
    layout: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#fdfbf7', // Soft Linen Beige Background
      color: '#2c1a0e',
      fontFamily: 'var(--font-primary)',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      padding: '45px 35px',
      backgroundColor: '#FFFFFF',
      border: '2px solid #e8e0d5',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 8px 32px rgba(44, 26, 14, 0.06)',
    },
    title: {
      textAlign: 'center',
      fontSize: '28px',
      marginBottom: '10px',
      color: '#2c1a0e', // Dark Wood Color
      fontWeight: 700,
    },
    subtitle: {
      textAlign: 'center',
      color: '#9a7a5a',
      fontSize: '14px',
      marginBottom: '30px',
    },
    formControl: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #d4a054', // Golden Accent Border
      borderRadius: 'var(--radius-md)',
      backgroundColor: '#fff',
      color: '#2c1a0e',
    },
    btn: {
      width: '100%',
      marginTop: '10px',
      backgroundColor: '#d4a054', // Golden Accent Button
      color: '#ffffff',
      padding: '12px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '15px',
      boxShadow: '0 4px 10px rgba(212, 160, 84, 0.25)',
      transition: 'all 0.2s',
    },
  };

  return (
    <div style={vendorThemeStyles.layout}>
      <div style={vendorThemeStyles.card} className="animate-fade-in">
        <h2 style={vendorThemeStyles.title}>🏪 Vendor Store</h2>
        <p style={vendorThemeStyles.subtitle}>Seller Portal: Manage and Sell Your Furniture</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#2c1a0e' }}>Vendor Email</label>
            <input
              type="email"
              style={vendorThemeStyles.formControl}
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#2c1a0e' }}>Password</label>
            <input
              type="password"
              style={vendorThemeStyles.formControl}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={vendorThemeStyles.btn}
            disabled={submitting}
          >
            {submitting ? 'Logging in...' : 'Enter Shop Console'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#9a7a5a' }}>
          Want to become a seller?{' '}
          <Link to="/become-vendor" style={{ color: '#d4a054', fontWeight: 'bold' }}>
            Apply here
          </Link>
        </p>
      </div>
    </div>
  );
};

