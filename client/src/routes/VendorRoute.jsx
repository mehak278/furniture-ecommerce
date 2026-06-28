import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const [isApproved, setIsApproved] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const checkVendorApproval = async () => {
      if (!isAuthenticated || user?.role !== 'vendor') {
        setCheckingStatus(false);
        return;
      }

      try {
        // Attempt to request dashboard stats
        await api.get('/vendor/dashboard');
        setIsApproved(true);
      } catch (err) {
        // If server responds with 403 Forbidden, they are not approved
        if (err.response?.status === 403) {
          setIsApproved(false);
        } else {
          // On network/other temporary errors, allow route and let child handle
          setIsApproved(true);
        }
      } finally {
        setCheckingStatus(false);
      }
    };

    checkVendorApproval();
  }, [isAuthenticated, user]);

  if (loading || checkingStatus) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fdfbf9' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-primary)', color: '#2c1a0e' }}>Verifying Seller Account...</h3>
          <p style={{ fontSize: '14px', color: '#9a7a5a', marginTop: '6px' }}>Connecting to FurniMart secure portal</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/vendor/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Outlet />;
  }

  if (user?.role !== 'vendor') {
    return <Navigate to="/user/dashboard" replace />;
  }

  if (isApproved === false) {
    // If role is vendor but application is not approved (pending/suspended), redirect to see status
    return <Navigate to="/become-vendor" replace />;
  }

  return <Outlet />;
};
