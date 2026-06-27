import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import { Package, User, MapPin, Key, CheckCircle, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Edit profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error(err);
        // Mock data
        setOrders([
          {
            _id: 'ORD584729',
            createdAt: '2026-06-25T10:00:00Z',
            totalAmount: 111500,
            orderStatus: 'processing',
            paymentMethod: 'cod',
            paymentStatus: 'pending',
            orderItems: [
              { name: 'Velvet Chesterfield Sofa', qty: 1, price: 110000, itemStatus: 'processing' },
            ],
          },
        ]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const res = await updateProfile({ name, phone });
    setUpdatingProfile(false);
    if (res.success) {
      toast.success('Profile updated successfully!');
    } else {
      toast.error(res.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    try {
      const { data } = await api.put('/users/change-password', { currentPassword, newPassword });
      if (data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${orderId}/cancel`);
      if (data.success) {
        toast.success('Order cancelled successfully!');
        // Update list
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, orderStatus: 'cancelled' } : o)));
      }
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

  const dStyles = {
    layout: {
      display: 'grid',
      gridTemplateColumns: '220px 1fr',
      gap: '40px',
      marginTop: '40px',
    },
    sidebar: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    tabBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all var(--transition-fast)',
    },
    activeTabBtn: {
      backgroundColor: 'var(--color-primary)',
      color: '#FFFFFF',
      fontWeight: 500,
    },
    orderCard: {
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      marginBottom: '20px',
      backgroundColor: 'var(--color-surface)',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--color-border)',
      paddingBottom: '16px',
      marginBottom: '16px',
      fontSize: '14px',
    },
  };

  return (
    <div className="container">
      <h1 style={{ fontFamily: 'var(--font-primary)', fontSize: '32px', marginTop: '40px' }}>My Account</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>Manage orders, profile settings, and shipping addresses</p>

      <div style={dStyles.layout}>
        {/* Left Side: Sidebar Tabs */}
        <aside style={dStyles.sidebar}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ ...dStyles.tabBtn, ...(activeTab === 'orders' ? dStyles.activeTabBtn : {}) }}
          >
            <Package size={18} /> My Orders
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            style={{ ...dStyles.tabBtn, ...(activeTab === 'profile' ? dStyles.activeTabBtn : {}) }}
          >
            <User size={18} /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            style={{ ...dStyles.tabBtn, ...(activeTab === 'password' ? dStyles.activeTabBtn : {}) }}
          >
            <Key size={18} /> Change Password
          </button>
        </aside>

        {/* Right Side: Tab Contents */}
        <main>
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Order History</h3>

              {loadingOrders ? (
                <div>Loading your orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  You haven't placed any orders yet.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order._id} style={dStyles.orderCard}>
                    <div style={dStyles.orderHeader}>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Order ID:</span>{' '}
                        <strong>{order._id}</strong>
                        <span style={{ margin: '0 12px', color: 'var(--color-border)' }}>|</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>Placed:</span>{' '}
                        <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>{' '}
                        <strong style={{ textTransform: 'capitalize', color: order.orderStatus === 'delivered' ? 'var(--color-success)' : 'var(--color-primary)' }}>
                          {order.orderStatus}
                        </strong>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                          <div>
                            <strong>{item.name}</strong> <span style={{ color: 'var(--color-text-muted)' }}>x {item.qty}</span>
                          </div>
                          <strong>PKR {item.price * item.qty}</strong>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      <div>
                        <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Total Amount paid:</span>{' '}
                        <strong style={{ fontSize: '18px', color: 'var(--color-primary)' }}>PKR {order.totalAmount}</strong>
                      </div>
                      
                      {order.orderStatus === 'pending' && (
                        <button onClick={() => handleCancelOrder(order._id)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '13px', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}>
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* EDIT PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="card" style={{ maxWidth: '500px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Edit Profile</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={updatingProfile}>
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* CHANGE PASSWORD TAB */}
          {activeTab === 'password' && (
            <div className="card" style={{ maxWidth: '500px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '20px' }}>Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                  {changingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
