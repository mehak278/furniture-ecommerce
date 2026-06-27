import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h3>Loading Vendor Portal...</h3>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  return user?.role === 'vendor' || user?.role === 'admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/user/dashboard" replace />
  );
};
