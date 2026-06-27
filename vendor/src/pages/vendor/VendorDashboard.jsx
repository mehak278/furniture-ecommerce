import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';

const StatCard = ({ icon, label, value, color, sub }) => (
  <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{label}</p>
        <h3 style={{ margin: '6px 0 0', fontSize: '26px', color: '#2c1a0e', fontWeight: 700 }}>{value}</h3>
        {sub && <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#aaa' }}>{sub}</p>}
      </div>
      <span style={{ fontSize: '32px' }}>{icon}</span>
    </div>
  </div>
);

export const VendorDashboard = () => {
  usePageTitle('Vendor Dashboard');
  const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0, pendingPayout: 0, rating: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/vendor/dashboard');
        if (data.success) {
          setStats(data.stats || stats);
          setRecentOrders(data.recentOrders || []);
        }
      } catch {
        // mock data if API not ready
        setStats({ totalSales: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0, pendingPayout: 0, rating: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <VendorLayout><p>Loading...</p></VendorLayout>;

  return (
    <VendorLayout>
      <div style={{ maxWidth: '1100px' }}>
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <StatCard icon="💰" label="Total Sales" value={`PKR ${stats.totalSales?.toLocaleString() || 0}`} color="#d4a054" />
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders || 0} color="#4f9cf9" sub={`${stats.pendingOrders || 0} pending`} />
          <StatCard icon="🪑" label="My Products" value={stats.totalProducts || 0} color="#22c55e" />
          <StatCard icon="⏳" label="Pending Payout" value={`PKR ${stats.pendingPayout?.toLocaleString() || 0}`} color="#f59e0b" />
          <StatCard icon="⭐" label="Rating" value={stats.rating ? `${stats.rating}/5` : 'No reviews'} color="#ec4899" />
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#2c1a0e', fontSize: '16px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/vendor/products/add" style={{ background: '#d4a054', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
              ➕ Add New Product
            </Link>
            <Link to="/vendor/orders" style={{ background: '#fff', color: '#d4a054', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', border: '1px solid #d4a054', fontWeight: 600 }}>
              📦 View Orders
            </Link>
            <Link to="/vendor/earnings" style={{ background: '#fff', color: '#22c55e', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', border: '1px solid #22c55e', fontWeight: 600 }}>
              💰 Earnings
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, color: '#2c1a0e', fontSize: '16px' }}>Recent Orders</h3>
            <Link to="/vendor/orders" style={{ color: '#d4a054', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
              <p style={{ fontSize: '40px', margin: 0 }}>📦</p>
              <p>No orders yet. Add products to start selling!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0e8dc' }}>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Order ID</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '10px', textAlign: 'left', color: '#888', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f8f5f0' }}>
                    <td style={{ padding: '10px', color: '#d4a054', fontWeight: 600 }}>#{order._id?.slice(-6)}</td>
                    <td style={{ padding: '10px' }}>{order.user?.name}</td>
                    <td style={{ padding: '10px' }}>PKR {order.totalAmount?.toLocaleString()}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ background: order.orderStatus === 'delivered' ? '#dcfce7' : '#fef9c3', color: order.orderStatus === 'delivered' ? '#166534' : '#854d0e', padding: '3px 10px', borderRadius: '20px', fontSize: '12px' }}>
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </VendorLayout>
  );
};

