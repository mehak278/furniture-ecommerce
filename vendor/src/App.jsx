import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Pages
import { LoginPage } from './pages/LoginPage';
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { VendorProducts } from './pages/vendor/VendorProducts';
import { AddProductPage } from './pages/vendor/AddProductPage';
import { VendorOrders } from './pages/vendor/VendorOrders';
import { VendorEarnings } from './pages/vendor/VendorEarnings';
import { VendorProfile } from './pages/vendor/VendorProfile';

// Local Protected Route Guard
const VendorRoute = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <h3>Loading Seller Portal...</h3>
      </div>
    );
  }

  return isAuthenticated && (user?.role === 'vendor' || user?.role === 'admin') ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Public Access */}
            <Route path="/login" element={<LoginPage />} />

            {/* Controlled Vendor Portal */}
            <Route element={<VendorRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<VendorDashboard />} />
              <Route path="/products" element={<VendorProducts />} />
              <Route path="/products/add" element={<AddProductPage />} />
              <Route path="/orders" element={<VendorOrders />} />
              <Route path="/earnings" element={<VendorEarnings />} />
              <Route path="/profile" element={<VendorProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </AuthProvider>
    </Router>
  );
}

export default App;
