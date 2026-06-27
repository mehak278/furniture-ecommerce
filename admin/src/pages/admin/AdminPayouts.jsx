import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminPayouts = () => {
  usePageTitle('Payouts');
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [txnId, setTxnId] = useState({});

  const fetchPayouts = async () => {
    try {
      const { data } = await api.get('/admin/payouts');
      setPayouts(data.payouts || []);
    } catch { toast.error('Failed to load payouts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayouts(); }, []);

  const processPayout = async (id) => {
    if (!txnId[id]?.trim()) { toast.error('Enter transaction ID first'); return; }
    setProcessing(id);
    try {
      await api.put(`/admin/payouts/${id}/process`, { transactionId: txnId[id] });
      toast.success('Payout marked as completed!');
      fetchPayouts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process payout');
    } finally { setProcessing(null); }
  };

  const filtered = filter === 'all' ? payouts : payouts.filter(p => p.status === filter);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'pending', 'completed'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, background: filter === s ? '#4f9cf9' : '#fff', color: filter === s ? '#fff' : '#888', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({payouts.filter(p => s === 'all' || p.status === s).length})
            </button>
          ))}
        </div>

        {loading ? <p>Loading payouts...</p> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>💸</p>
            <p style={{ color: '#888' }}>No {filter} payout requests</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(p => (
              <div key={p._id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '15px', color: '#1a1f2e' }}>{p.vendor?.shopName || 'Unknown Vendor'}</h3>
                      <span style={{ background: p.status === 'completed' ? '#dcfce7' : '#fef9c3', color: p.status === 'completed' ? '#166534' : '#854d0e', padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <span>💰 Amount: <strong style={{ color: '#22c55e' }}>PKR {p.netAmount?.toLocaleString()}</strong></span>
                      <span>📊 Commission: PKR {p.commission?.toLocaleString()}</span>
                      <span>📅 Requested: {new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    {p.vendor?.bankDetails && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#666', background: '#f8f9fa', padding: '8px 12px', borderRadius: '6px' }}>
                        🏦 {p.vendor.bankDetails.bankName} | {p.vendor.bankDetails.accountName} | {p.vendor.bankDetails.accountNumber}
                      </div>
                    )}
                    {p.transactionId && <div style={{ marginTop: '6px', fontSize: '12px', color: '#22c55e' }}>✅ TXN: {p.transactionId}</div>}
                  </div>
                  {p.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input value={txnId[p._id] || ''} onChange={e => setTxnId(prev => ({ ...prev, [p._id]: e.target.value }))} placeholder="Transaction ID" style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', minWidth: '160px' }} />
                      <button onClick={() => processPayout(p._id)} disabled={processing === p._id} style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>
                        {processing === p._id ? '...' : '✅ Mark Paid'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

