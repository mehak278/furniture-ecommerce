import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#fdfbf7' }}>
        <p style={{ color: '#d4a054', fontSize: '16px' }}>Loading Vendor Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (user?.role !== 'vendor' && user?.role !== 'admin') {
    return <Navigate to="/vendor/login" replace />;
  }

  return <Outlet />;
};
