import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Customer Pages (Imported from customer directory)
import { HomePage } from './pages/customer/HomePage';
import { ShopPage } from './pages/customer/ShopPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { LoginPage } from './pages/customer/LoginPage';
import { RegisterPage } from './pages/customer/RegisterPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { UserDashboard } from './pages/customer/UserDashboard';
import { BecomeVendorPage } from './pages/customer/BecomeVendorPage';
import { VendorStorePage } from './pages/customer/VendorStorePage';

// Admin Pages (Imported from admin directory)
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminVendors } from './pages/admin/AdminVendors';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminPayouts } from './pages/admin/AdminPayouts';

// Vendor Pages (Imported from vendor directory)
import { VendorLoginPage } from './pages/vendor/VendorLoginPage';
import { VendorPendingPage } from './pages/vendor/VendorPendingPage';
import { VendorDashboard } from './pages/vendor/VendorDashboard';
import { VendorProducts } from './pages/vendor/VendorProducts';
import { AddProductPage } from './pages/vendor/AddProductPage';
import { VendorOrders } from './pages/vendor/VendorOrders';
import { VendorEarnings } from './pages/vendor/VendorEarnings';
import { VendorProfile } from './pages/vendor/VendorProfile';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AdminRoute } from './routes/AdminRoute';
import { VendorRoute } from './routes/VendorRoute';

// Layout wrapper for customer pages so sidebar-driven layouts don't get main navbar/footers
const CustomerLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingBottom: '60px' }}>{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ═══ CUSTOMER ROUTES (with common Navbar & Footer) ═══ */}
            <Route path="/" element={<CustomerLayout><HomePage /></CustomerLayout>} />
            <Route path="/shop" element={<CustomerLayout><ShopPage /></CustomerLayout>} />
            <Route path="/product/:slug" element={<CustomerLayout><ProductDetailPage /></CustomerLayout>} />
            <Route path="/login" element={<CustomerLayout><LoginPage /></CustomerLayout>} />
            <Route path="/register" element={<CustomerLayout><RegisterPage /></CustomerLayout>} />
            <Route path="/become-vendor" element={<CustomerLayout><BecomeVendorPage /></CustomerLayout>} />
            <Route path="/store/:id" element={<CustomerLayout><VendorStorePage /></CustomerLayout>} />

            {/* Protected Customer User Dashboard */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<CustomerLayout><CartPage /></CustomerLayout>} />
              <Route path="/checkout" element={<CustomerLayout><CheckoutPage /></CustomerLayout>} />
              <Route path="/user/dashboard" element={<CustomerLayout><UserDashboard /></CustomerLayout>} />
            </Route>

            {/* ═══ VENDOR PORTAL (Independent layout with sidebar, no top Navbar) ═══ */}
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/vendor/pending" element={<VendorPendingPage />} />
            <Route path="/vendor" element={<Navigate to="/vendor/dashboard" replace />} />
            <Route element={<VendorRoute />}>
              <Route path="/vendor/dashboard" element={<VendorDashboard />} />
              <Route path="/vendor/products" element={<VendorProducts />} />
              <Route path="/vendor/products/add" element={<AddProductPage />} />
              <Route path="/vendor/orders" element={<VendorOrders />} />
              <Route path="/vendor/earnings" element={<VendorEarnings />} />
              <Route path="/vendor/profile" element={<VendorProfile />} />
            </Route>

            {/* ═══ ADMIN CONTROL PANEL (Independent layout with sidebar, no top Navbar) ═══ */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/vendors" element={<AdminVendors />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/payouts" element={<AdminPayouts />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
