import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const VendorEarnings = () => {
  usePageTitle('Earnings');
  const [data, setData] = useState({ totalEarnings: 0, pendingPayout: 0, commissionRate: 10, payouts: [] });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    api.get('/vendor/earnings').then(({ data: d }) => setData(d.data || data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const requestPayout = async () => {
    if (data.pendingPayout <= 0) { toast.error('No pending payout available'); return; }
    setRequesting(true);
    try {
      await api.post('/vendor/payout-request');
      toast.success('Payout request sent to admin!');
      setData(prev => ({ ...prev, pendingPayout: 0 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request payout');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <VendorLayout>
      <div style={{ maxWidth: '900px' }}>
        {loading ? <p>Loading earnings...</p> : (
          <>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Lifetime Earnings', value: `PKR ${data.totalEarnings?.toLocaleString() || 0}`, color: '#22c55e', icon: '💰' },
                { label: 'Commission Rate', value: `${data.commissionRate || 10}%`, color: '#f59e0b', icon: '📊' },
                { label: 'Pending Payout', value: `PKR ${data.pendingPayout?.toLocaleString() || 0}`, color: '#d4a054', icon: '⏳' },
              ].map((c, i) => (
                <div key={i} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${c.color}` }}>
                  <div style={{ fontSize: '13px', color: '#888' }}>{c.label}</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#2c1a0e', marginTop: '6px' }}>{c.value}</div>
                  <div style={{ fontSize: '28px', marginTop: '8px' }}>{c.icon}</div>
                </div>
              ))}
            </div>

            {/* Commission Info */}
            <div style={{ background: '#fff8ed', border: '1px solid #f0d090', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#7c4a00' }}>
                💡 Platform commission is <strong>{data.commissionRate || 10}%</strong> per sale. Your net earning = Sale Price × {100 - (data.commissionRate || 10)}%
              </p>
            </div>

            {/* Request Payout */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 12px', color: '#2c1a0e', fontSize: '16px' }}>Request Payout</h3>
              <p style={{ color: '#888', fontSize: '14px', margin: '0 0 16px' }}>Available balance: <strong style={{ color: '#22c55e' }}>PKR {data.pendingPayout?.toLocaleString() || 0}</strong></p>
              <button onClick={requestPayout} disabled={requesting || data.pendingPayout <= 0} style={{
                background: data.pendingPayout > 0 ? '#22c55e' : '#e5e7eb', color: '#fff', border: 'none',
                padding: '12px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                cursor: data.pendingPayout > 0 ? 'pointer' : 'not-allowed',
              }}>
                {requesting ? 'Sending...' : '💸 Request Payout'}
              </button>
            </div>

            {/* Payout History */}
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <h3 style={{ margin: '0 0 16px', color: '#2c1a0e', fontSize: '16px' }}>Payout History</h3>
              {(!data.payouts || data.payouts.length === 0) ? (
                <p style={{ color: '#aaa', textAlign: 'center', padding: '24px 0' }}>No payouts yet</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f0e8dc' }}>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Date</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Amount</th>
                      <th style={{ padding: '10px', textAlign: 'left', color: '#888' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.payouts.map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f8f5f0' }}>
                        <td style={{ padding: '10px' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px', fontWeight: 600, color: '#22c55e' }}>PKR {p.netAmount?.toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>
                          <span style={{ background: p.status === 'completed' ? '#dcfce7' : '#fef9c3', color: p.status === 'completed' ? '#166534' : '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </VendorLayout>
  );
};

