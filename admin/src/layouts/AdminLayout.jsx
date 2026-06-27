import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard' },
  { path: '/vendors', icon: '🏪', label: 'Vendors' },
  { path: '/products', icon: '🪑', label: 'Products' },
  { path: '/orders', icon: '📦', label: 'Orders' },
  { path: '/users', icon: '👥', label: 'Users' },
  { path: '/categories', icon: '📂', label: 'Categories' },
  { path: '/payouts', icon: '💸', label: 'Payouts' },
];

export const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? '60px' : '240px',
        background: '#1a1f2e',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflowX: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #2d3548', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {!collapsed && <span style={{ fontWeight: 700, fontSize: '16px', color: '#4f9cf9' }}>⚙️ Admin Panel</span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', color: '#4f9cf9', cursor: 'pointer', fontSize: '18px' }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{ padding: '16px', borderBottom: '1px solid #2d3548' }}>
            <div style={{ fontSize: '13px', color: '#4f9cf9', fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: '11px', color: '#6b7a99', marginTop: '2px' }}>Super Admin</div>
          </div>
        )}

        {/* Nav Links */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(item => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px', textDecoration: 'none',
              color: location.pathname === item.path ? '#4f9cf9' : '#8892a4',
              background: location.pathname === item.path ? 'rgba(79,156,249,0.1)' : 'transparent',
              borderLeft: location.pathname === item.path ? '3px solid #4f9cf9' : '3px solid transparent',
              fontSize: '14px', fontWeight: location.pathname === item.path ? 600 : 400,
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '18px', minWidth: '20px' }}>{item.icon}</span>
              {!collapsed && item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px', borderTop: '1px solid #2d3548' }}>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            background: 'none', border: '1px solid #2d3548', color: '#8892a4',
            padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
            width: '100%', fontSize: '14px',
          }}>
            <span>🚪</span>
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: collapsed ? '60px' : '240px', flex: 1, background: '#f0f2f5', minHeight: '100vh', transition: 'margin-left 0.2s' }}>
        {/* Top bar */}
        <div style={{ background: '#fff', padding: '14px 24px', borderBottom: '1px solid #e4e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#1a1f2e' }}>
            {navItems.find(n => n.path === location.pathname)?.icon} {navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
          </h2>
          <Link to="/" style={{ color: '#4f9cf9', fontSize: '13px', textDecoration: 'none' }}>← View Store</Link>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
