import React, { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export const AdminLoginPage = () => {
  usePageTitle('Admin Login');
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
    setSubmitting(false);

    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('user'));
      if (savedUser?.role === 'admin') {
        toast.success('Admin login successful!');
        navigate('/admin');
      } else {
        // Log them out if they are not an admin
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Access Denied: Only administrators can log in here.');
      }
    } else {
      toast.error(result.message);
    }
  };

  const adminThemeStyles = {
    layout: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0f172a', // Dark Slate Blue Theme
      color: '#f8fafc',
    },
    card: {
      width: '100%',
      maxWidth: '400px',
      padding: '40px 30px',
      backgroundColor: '#1e293b', // Deep Slate Gray
      border: '1px solid #334155',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    },
    title: {
      textAlign: 'center',
      fontSize: '28px',
      marginBottom: '10px',
      color: '#38bdf8', // Neon Sky Blue
    },
    subtitle: {
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '14px',
      marginBottom: '30px',
    },
    formControl: {
      width: '100%',
      padding: '12px 16px',
      border: '1px solid #475569',
      borderRadius: 'var(--radius-md)',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
    },
    btn: {
      width: '100%',
      marginTop: '10px',
      backgroundColor: '#0284c7', // Professional Blue Button
      color: '#fff',
      padding: '12px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
    },
  };

  return (
    <div style={adminThemeStyles.layout}>
      <div style={adminThemeStyles.card} className="animate-fade-in">
        <h2 style={adminThemeStyles.title}>⚙️ Admin Control</h2>
        <p style={adminThemeStyles.subtitle}>Security Portal: Administrators Authenticate Here</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: '#94a3b8' }}>Admin Email</label>
            <input
              type="email"
              style={adminThemeStyles.formControl}
              placeholder="admin@furnimart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#94a3b8' }}>Secret Password</label>
            <input
              type="password"
              style={adminThemeStyles.formControl}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            style={adminThemeStyles.btn}
            disabled={submitting}
          >
            {submitting ? 'Verifying Identity...' : 'Access Console'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Authorized personnel only. Sessions are logged.
        </p>
      </div>
    </div>
  );
};

