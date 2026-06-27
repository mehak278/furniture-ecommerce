import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} style={{ textDecoration: 'none' }}>
    <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}`, cursor: 'pointer', transition: 'transform 0.1s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{label}</p>
          <h3 style={{ margin: '6px 0 0', fontSize: '26px', color: '#1a1f2e', fontWeight: 700 }}>{value}</h3>
        </div>
        <span style={{ fontSize: '36px' }}>{icon}</span>
      </div>
    </div>
  </Link>
);

export const AdminDashboard = () => {
  usePageTitle('Admin Dashboard');
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalVendors: 0, pendingVendors: 0, pendingProducts: 0, totalProducts: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setStats(data.stats || {});
      setRecentOrders(data.recentOrders || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Alert banners */}
        {stats.pendingVendors > 0 && (
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#92400e', fontSize: '14px' }}>⚠️ <strong>{stats.pendingVendors}</strong> vendor application(s) pending approval</span>
            <Link to="/admin/vendors" style={{ color: '#92400e', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Review →</Link>
          </div>
        )}
        {stats.pendingProducts > 0 && (
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#1e40af', fontSize: '14px' }}>🪑 <strong>{stats.pendingProducts}</strong> product(s) waiting for approval</span>
            <Link to="/admin/products" style={{ color: '#1e40af', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>Review →</Link>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard icon="💰" label="Total Revenue" value={`PKR ${stats.totalRevenue?.toLocaleString() || 0}`} color="#22c55e" link="/admin/orders" />
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders || 0} color="#4f9cf9" link="/admin/orders" />
          <StatCard icon="👥" label="Total Users" value={stats.totalUsers || 0} color="#a855f7" link="/admin/users" />
          <StatCard icon="🏪" label="Total Vendors" value={stats.totalVendors || 0} color="#f59e0b" link="/admin/vendors" />
          <StatCard icon="🪑" label="Total Products" value={stats.totalProducts || 0} color="#ec4899" link="/admin/products" />
          <StatCard icon="⏳" label="Pending Approvals" value={(stats.pendingVendors || 0) + (stats.pendingProducts || 0)} color="#ef4444" link="/admin/vendors" />
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#1a1f2e', fontSize: '16px' }}>Recent Orders</h3>
            <Link to="/admin/orders" style={{ color: '#4f9cf9', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '24px' }}>No orders yet</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f2f5' }}>
                  {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                    <td style={{ padding: '10px', color: '#4f9cf9', fontWeight: 600 }}>#{o._id?.slice(-6)}</td>
                    <td style={{ padding: '10px' }}>{o.user?.name}</td>
                    <td style={{ padding: '10px', fontWeight: 600, color: '#22c55e' }}>PKR {o.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: o.orderStatus === 'delivered' ? '#dcfce7' : '#dbeafe', color: o.orderStatus === 'delivered' ? '#166534' : '#1e40af', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px', color: '#888', fontSize: '13px' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

