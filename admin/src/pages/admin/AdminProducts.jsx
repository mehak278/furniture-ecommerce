import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminProducts = () => {
  usePageTitle('Manage Products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [acting, setActing] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/admin/products');
      setProducts(data.products || []);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAction = async (id, action) => {
    setActing(id + action);
    try {
      await api.put(`/admin/products/${id}/${action}`);
      toast.success(`Product ${action}d`);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally { setActing(null); }
  };

  const getStatus = (p) => p.isApproved ? 'approved' : !p.isActive ? 'rejected' : 'pending';
  const filtered = filter === 'all' ? products : products.filter(p => getStatus(p) === filter);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filter === s ? '#4f9cf9' : '#fff', color: filter === s ? '#fff' : '#888',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} ({products.filter(p => s === 'all' ? true : getStatus(p) === s).length})
            </button>
          ))}
        </div>

        {loading ? <p>Loading...</p> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>🪑</p>
            <p style={{ color: '#888' }}>No {filter} products</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  {['Product', 'Vendor', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const status = getStatus(p);
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={p.images?.[0]?.url} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '6px', background: '#f0f2f5' }} onError={e => e.target.style.display = 'none'} />
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a1f2e' }}>{p.name}</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{p.category?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#555', fontSize: '13px' }}>{p.vendor?.shopName || 'Unknown'}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#22c55e' }}>PKR {p.price?.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px' }}>{p.stock}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: status === 'approved' ? '#dcfce7' : status === 'rejected' ? '#fee2e2' : '#fef9c3', color: status === 'approved' ? '#166534' : status === 'rejected' ? '#991b1b' : '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                          {status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {status === 'pending' && (
                            <>
                              <button onClick={() => handleAction(p._id, 'approve')} disabled={acting === p._id + 'approve'} style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                                {acting === p._id + 'approve' ? '...' : '✅ Approve'}
                              </button>
                              <button onClick={() => handleAction(p._id, 'reject')} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {status === 'approved' && (
                            <button onClick={() => handleAction(p._id, 'feature')} style={{ background: '#ede9fe', color: '#5b21b6', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                              {p.isFeatured ? '★ Unfeature' : '☆ Feature'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

