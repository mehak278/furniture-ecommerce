import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { ShoppingCart, Heart, User, Search, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import '../../styles/globals.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const navStyles = {
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 'var(--header-height)',
      backgroundColor: 'var(--glass-bg)',
      backdropFilter: 'blur(var(--blur-amount))',
      borderBottom: '1px solid var(--color-border)',
    },
    nav: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
    },
    logo: {
      fontFamily: 'var(--font-primary)',
      fontSize: '24px',
      fontWeight: 700,
      color: 'var(--color-primary)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    logoSub: {
      color: 'var(--color-secondary)',
    },
    searchForm: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'var(--color-surface-soft)',
      borderRadius: 'var(--radius-md)',
      padding: '4px 12px',
      width: '320px',
    },
    searchInput: {
      border: 'none',
      background: 'none',
      outline: 'none',
      width: '100%',
      padding: '8px',
      fontSize: '14px',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
    },
    iconBtn: {
      position: 'relative',
      cursor: 'pointer',
      color: 'var(--color-text)',
      transition: 'color var(--transition-fast)',
    },
    badge: {
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-light)',
      borderRadius: 'var(--radius-full)',
      padding: '2px 6px',
      fontSize: '10px',
      fontWeight: 'bold',
    },
    profileContainer: {
      position: 'relative',
    },
    dropdown: {
      position: 'absolute',
      top: '40px',
      right: 0,
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-md)',
      width: '200px',
      display: dropdownOpen ? 'block' : 'none',
      padding: '8px 0',
      zIndex: 101,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      fontSize: '14px',
      color: 'var(--color-text)',
      cursor: 'pointer',
      transition: 'background-color var(--transition-fast)',
    },
  };

  return (
    <header style={navStyles.header}>
      <div className="container" style={{ height: '100%' }}>
        <nav style={navStyles.nav}>
          <Link to="/" style={navStyles.logo}>
            Furni<span style={navStyles.logoSub}>Mart</span>
          </Link>

          <form onSubmit={handleSearchSubmit} style={navStyles.searchForm}>
            <input
              type="text"
              placeholder="Search wood, tables, sofas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={navStyles.searchInput}
            />
            <button type="submit" style={{ cursor: 'pointer' }}>
              <Search size={18} color="var(--color-text-muted)" />
            </button>
          </form>

          <div style={navStyles.actions}>
            <Link to="/shop" style={{ fontWeight: 500, fontSize: '15px' }}>Shop</Link>
            
            <Link to="/wishlist" style={navStyles.iconBtn} title="Wishlist">
              <Heart size={22} />
            </Link>

            <Link to="/cart" style={navStyles.iconBtn} title="Shopping Cart">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span style={navStyles.badge}>{cartCount}</span>}
            </Link>

            {isAuthenticated ? (
              <div style={navStyles.profileContainer}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <User size={22} />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.name.split(' ')[0]}</span>
                </button>

                <div style={navStyles.dropdown}>
                  <Link
                    to="/user/dashboard"
                    style={navStyles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} /> My Dashboard
                  </Link>

                  {user?.role === 'vendor' && (
                    <a
                      href="/vendor"
                      style={navStyles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Vendor Panel
                    </a>
                  )}

                  {user?.role === 'admin' && (
                    <a
                      href="/admin"
                      style={navStyles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <LayoutDashboard size={16} /> Admin Panel
                    </a>
                  )}

                  <div
                    style={navStyles.dropdownItem}
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
