import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const VendorPendingPage = () => {
  usePageTitle('Application Pending');
  const navigate = useNavigate();
  const [shopName, setShopName] = useState('');
  const [submittedAt, setSubmittedAt] = useState(null);

  useEffect(() => {
    api.get('/vendor/my-status').then(({ data }) => {
      if (data.hasApplication) {
        setShopName(data.shopName || '');
        setSubmittedAt(data.submittedAt ? new Date(data.submittedAt) : null);
      }
    }).catch(() => {});
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fdfbf7 0%, #fef9f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>

        {/* Animated hourglass / clock icon */}
        <div style={{
          width: '100px',
          height: '100px',
          background: 'linear-gradient(135deg, #d4a054, #e8b96a)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          margin: '0 auto 28px',
          boxShadow: '0 8px 32px rgba(212, 160, 84, 0.35)',
        }}>
          ⏳
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 800, color: '#2c1a0e' }}>
          درخواست موصول ہوگئی!
        </h1>
        <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: 600, color: '#8B5E2A' }}>
          Your Application is Under Review
        </h2>

        {/* Main card */}
        <div style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 8px 40px rgba(44, 26, 14, 0.1)',
          border: '1px solid #f0e6d3',
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          {shopName && (
            <div style={{
              background: '#fef9f0',
              border: '1px solid #f0e6d3',
              borderRadius: '10px',
              padding: '12px 16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <span style={{ fontSize: '20px' }}>🏪</span>
              <div>
                <div style={{ fontSize: '11px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shop Name</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#2c1a0e' }}>{shopName}</div>
              </div>
            </div>
          )}

          <p style={{ margin: '0 0 20px', fontSize: '15px', color: '#555', lineHeight: 1.7 }}>
            آپ کی درخواست ہمارے <strong style={{ color: '#2c1a0e' }}>Admin Team</strong> کو مل گئی ہے۔
            ہم آپ کا ڈیٹا verify کر رہے ہیں۔
          </p>

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>✅</div>
                <div style={{ width: '2px', background: '#e2e8f0', flexGrow: 1, margin: '4px 0', minHeight: '32px' }} />
              </div>
              <div style={{ paddingTop: '4px', paddingBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Application Submitted</div>
                {submittedAt && <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{formatDate(submittedAt)}</div>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: '#fef9c3', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, border: '2px solid #d4a054' }}>🔍</div>
                <div style={{ width: '2px', background: '#e2e8f0', flexGrow: 1, margin: '4px 0', minHeight: '32px' }} />
              </div>
              <div style={{ paddingTop: '4px', paddingBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#854d0e' }}>Under Admin Review</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>Currently in progress</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '32px', height: '32px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>🏪</div>
              </div>
              <div style={{ paddingTop: '4px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#94a3b8' }}>Shop Opens</div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>After approval</div>
              </div>
            </div>

          </div>
        </div>

        {/* Time estimate banner */}
        <div style={{
          background: 'linear-gradient(135deg, #2c1a0e, #4a2c1a)',
          borderRadius: '14px',
          padding: '20px 24px',
          color: '#fff',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '32px' }}>⏰</div>
          <div>
            <div style={{ fontSize: '13px', color: '#d4a054', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Expected Time</div>
            <div style={{ fontSize: '18px', fontWeight: 800 }}>24 – 48 Hours</div>
            <div style={{ fontSize: '12px', color: '#c4a882', marginTop: '2px' }}>
              اگر آپ کا ڈیٹا درست ہے تو آپ کی شاپ جلد کھل جائے گی
            </div>
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 20px' }}>
          Approval notification your registered email per aayegi.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/vendor/login'); }}
            style={{ background: '#fff', color: '#8B5E2A', border: '1.5px solid #e8d9c5', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            ← Back to Login
          </button>
          <button
            onClick={() => navigate('/')}
            style={{ background: '#d4a054', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
          >
            Browse Store 🛋️
          </button>
        </div>

      </div>
    </div>
  );
};
