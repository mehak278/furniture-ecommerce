import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  pending: { bg: '#fef9c3', color: '#854d0e' },
  processing: { bg: '#dbeafe', color: '#1e40af' },
  shipped: { bg: '#ede9fe', color: '#5b21b6' },
  delivered: { bg: '#dcfce7', color: '#166534' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
};

const nextStatus = { pending: 'processing', processing: 'shipped', shipped: 'delivered' };

export const VendorOrders = () => {
  usePageTitle('Vendor Orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/vendor/orders').then(({ data }) => setOrders(data.orders || [])).catch(() => toast.error('Failed to load orders')).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.put(`/vendor/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o));
      toast.success(`Order marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderStatus === filter);

  return (
    <VendorLayout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: filter === s ? '#d4a054' : '#fff', color: filter === s ? '#fff' : '#888',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}>
              {s.charAt(0).toUpperCase() + s.slice(1)} {s !== 'all' && `(${orders.filter(o => o.orderStatus === s).length})`}
            </button>
          ))}
        </div>

        {loading ? <p>Loading orders...</p> : filtered.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>📦</p>
            <p style={{ color: '#888' }}>No {filter === 'all' ? '' : filter} orders yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filtered.map(order => {
              const sc = statusColors[order.orderStatus] || statusColors.pending;
              const next = nextStatus[order.orderStatus];
              return (
                <div key={order._id} style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: '#2c1a0e', fontSize: '15px' }}>Order #{order._id?.slice(-6)}</span>
                        <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{order.orderStatus}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        Customer: <strong style={{ color: '#444' }}>{order.user?.name}</strong> &nbsp;•&nbsp;
                        Date: <strong style={{ color: '#444' }}>{new Date(order.createdAt).toLocaleDateString()}</strong> &nbsp;•&nbsp;
                        Amount: <strong style={{ color: '#d4a054' }}>PKR {order.totalAmount?.toLocaleString()}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {next && (
                        <button onClick={() => updateStatus(order._id, next)} disabled={updating === order._id} style={{ background: '#d4a054', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          {updating === order._id ? '...' : `Mark as ${next}`}
                        </button>
                      )}
                      {order.orderStatus === 'pending' && (
                        <button onClick={() => updateStatus(order._id, 'cancelled')} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Items */}
                  <div style={{ marginTop: '14px', borderTop: '1px solid #f0e8dc', paddingTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {order.orderItems?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#faf7f2', padding: '8px 12px', borderRadius: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#2c1a0e', fontSize: '13px' }}>{item.name}</span>
                        <span style={{ color: '#888', fontSize: '12px' }}>x{item.qty}</span>
                        <span style={{ color: '#d4a054', fontSize: '13px', fontWeight: 600 }}>PKR {item.price?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {/* Delivery Address */}
                  {order.shippingAddress && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                      📍 {order.shippingAddress.address}, {order.shippingAddress.city}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

