import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminVendors = () => {
  usePageTitle('Manage Vendors');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [acting, setActing] = useState(null);

  const fetchVendors = async () => {
    try {
      const { data } = await api.get('/admin/vendors');
      setVendors(data.vendors || []);
    } catch { toast.error('Failed to load vendors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleAction = async (id, action) => {
    setActing(id + action);
    try {
      await api.put(`/admin/vendors/${id}/${action}`);
      toast.success(`Vendor ${action}d successfully`);
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} vendor`);
    } finally { setActing(null); }
  };

  const filtered = filter === 'all' ? vendors : vendors.filter(v => v.status === filter);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {['all', 'pending', 'approved', 'suspended'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filter === s ? '#4f9cf9' : '#fff', color: filter === s ? '#fff' : '#888',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({vendors.filter(v => s === 'all' ? true : v.status === s).length})
            </button>
          ))}
        </div>

        {loading ? <p>Loading vendors...</p> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>🏪</p>
            <p style={{ color: '#888' }}>No {filter} vendors</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(vendor => (
              <div key={vendor._id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ margin: 0, color: '#1a1f2e', fontSize: '16px' }}>{vendor.shopName || 'Unnamed Shop'}</h3>
                      <span style={{
                        background: vendor.status === 'approved' ? '#dcfce7' : vendor.status === 'suspended' ? '#fee2e2' : '#fef9c3',
                        color: vendor.status === 'approved' ? '#166534' : vendor.status === 'suspended' ? '#991b1b' : '#854d0e',
                        padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600
                      }}>{vendor.status}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      <span>👤 {vendor.user?.name}</span>
                      <span>📧 {vendor.user?.email}</span>
                      <span>📅 Joined: {new Date(vendor.createdAt).toLocaleDateString()}</span>
                      <span>⭐ Rating: {vendor.rating || 'No reviews'}</span>
                      <span>📦 Commission: {vendor.commissionRate || 10}%</span>
                    </div>
                    {vendor.shopDescription && <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#666' }}>{vendor.shopDescription}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {vendor.status === 'pending' && (
                      <>
                        <button onClick={() => handleAction(vendor._id, 'approve')} disabled={acting === vendor._id + 'approve'} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                          {acting === vendor._id + 'approve' ? '...' : '✅ Approve'}
                        </button>
                        <button onClick={() => handleAction(vendor._id, 'reject')} disabled={acting === vendor._id + 'reject'} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          {acting === vendor._id + 'reject' ? '...' : '❌ Reject'}
                        </button>
                      </>
                    )}
                    {vendor.status === 'approved' && (
                      <button onClick={() => handleAction(vendor._id, 'suspend')} style={{ background: '#fef9c3', color: '#854d0e', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        ⏸ Suspend
                      </button>
                    )}
                    {vendor.status === 'suspended' && (
                      <button onClick={() => handleAction(vendor._id, 'approve')} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                        ▶ Reinstate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

