import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = { pending: { bg: '#fef9c3', color: '#854d0e' }, processing: { bg: '#dbeafe', color: '#1e40af' }, shipped: { bg: '#ede9fe', color: '#5b21b6' }, delivered: { bg: '#dcfce7', color: '#166534' }, cancelled: { bg: '#fee2e2', color: '#991b1b' } };

export const AdminOrders = () => {
  usePageTitle('All Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/orders').then(({ data }) => setOrders(data.orders || [])).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  const filtered = orders
    .filter(o => filter === 'all' || o.orderStatus === filter)
    .filter(o => !search || o._id?.includes(search) || o.user?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by order ID or customer..." style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', minWidth: '260px' }} />
          <div style={{ display: 'flex', gap: '6px' }}>
            {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: filter === s ? '#4f9cf9' : '#fff', color: filter === s ? '#fff' : '#888', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <p>Loading orders...</p> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>📦</p>
            <p style={{ color: '#888' }}>No orders found</p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  {['Order ID', 'Customer', 'Amount', 'Items', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const sc = statusColors[o.orderStatus] || statusColors.pending;
                  return (
                    <tr key={o._id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                      <td style={{ padding: '14px 16px', color: '#4f9cf9', fontWeight: 700 }}>#{o._id?.slice(-6)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#1a1f2e' }}>{o.user?.name}</div>
                        <div style={{ fontSize: '12px', color: '#888' }}>{o.user?.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#22c55e' }}>PKR {o.totalAmount?.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', color: '#555' }}>{o.orderItems?.length} item(s)</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{o.orderStatus}</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#888', fontSize: '13px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
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

