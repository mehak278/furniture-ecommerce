import React, { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/product/ProductCard';
import api from '../../services/api';
import { Sofa, Bed, Briefcase, Utensils, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export const HomePage = () => {
  usePageTitle('Home');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, arrivalsRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/new-arrivals'),
        ]);

        if (featuredRes.data.success) {
          setFeaturedProducts(featuredRes.data.products);
        }
        if (arrivalsRes.data.success) {
          setNewArrivals(arrivalsRes.data.products);
        }
      } catch (error) {
        console.error('Failed to load homepage data', error);
        toast.error('Unable to connect to server. Running in mock data mode.');
        // Setup mock data so user has a working premium preview even if connection fails
        const mockProducts = [
          {
            _id: 'mock1',
            name: 'Velvet Chesterfield Sofa',
            slug: 'velvet-chesterfield-sofa',
            price: 125000,
            discountPrice: 110000,
            discountPercent: 12,
            ratings: { average: 4.8, count: 24 },
            images: [{ url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80' }],
            category: { name: 'Living Room' },
            variants: [{ color: '#0F2C59', material: 'Velvet' }],
          },
          {
            _id: 'mock2',
            name: 'Solid Teak Wood Dining Set',
            slug: 'solid-teak-wood-dining-set',
            price: 180000,
            discountPrice: 155000,
            discountPercent: 13,
            ratings: { average: 4.9, count: 18 },
            images: [{ url: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80' }],
            category: { name: 'Dining Room' },
            variants: [{ color: '#8C6239', material: 'Teak Wood' }],
          },
          {
            _id: 'mock3',
            name: 'Ergonomic Executive Office Chair',
            slug: 'ergonomic-office-chair',
            price: 35000,
            discountPrice: 0,
            ratings: { average: 4.6, count: 32 },
            images: [{ url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=600&q=80' }],
            category: { name: 'Office study' },
            variants: [{ color: '#111111', material: 'Mesh' }],
          },
        ];
        setFeaturedProducts(mockProducts);
        setNewArrivals(mockProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const homeStyles = {
    hero: {
      position: 'relative',
      height: '560px',
      backgroundImage: 'url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      marginBottom: '60px',
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(44, 44, 44, 0.3)',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '560px',
      padding: '40px',
      color: '#FFFFFF',
    },
    heroTitle: {
      fontSize: '44px',
      fontWeight: 700,
      color: '#FFFFFF',
      lineHeight: '1.2',
      marginBottom: '16px',
    },
    heroSubtitle: {
      fontSize: '16px',
      lineHeight: '1.6',
      marginBottom: '24px',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    sectionTitle: {
      textAlign: 'center',
      fontFamily: 'var(--font-primary)',
      fontSize: '32px',
      color: 'var(--color-secondary)',
      marginBottom: '8px',
    },
    sectionSubtitle: {
      textAlign: 'center',
      color: 'var(--color-text-muted)',
      marginBottom: '40px',
      fontSize: '15px',
    },
    categoryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '24px',
      marginBottom: '80px',
    },
    categoryCard: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '30px 20px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all var(--transition-normal)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '16px',
    },
    badgeContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '30px',
      margin: '80px 0',
      backgroundColor: 'var(--color-surface-soft)',
      padding: '40px 24px',
      borderRadius: 'var(--radius-lg)',
    },
    badgeItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
    },
    badgeTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '4px',
    },
    badgeDesc: {
      fontSize: '14px',
      color: 'var(--color-text-muted)',
      lineHeight: '1.5',
    },
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={homeStyles.hero}>
        <div style={homeStyles.heroOverlay}></div>
        <div className="container" style={{ width: '100%' }}>
          <div style={homeStyles.heroContent} className="glass animate-fade-in">
            <h1 style={homeStyles.heroTitle}>Crafted Comfort For Modern Living</h1>
            <p style={homeStyles.heroSubtitle}>
              Explore premium handcrafted sofas, dining sets, and ergonomic desks directly from local verified vendors with a 7-day refund guarantee.
            </p>
            <Link to="/shop" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Explore Collections
            </Link>
          </div>
        </div>
      </section>

      {/* Category Section */}
      <section className="container">
        <h2 style={homeStyles.sectionTitle}>Shop by Category</h2>
        <p style={homeStyles.sectionSubtitle}>Find high-quality furniture items matching your home rooms</p>

        <div style={homeStyles.categoryGrid}>
          <Link to="/shop?category=living-room" style={homeStyles.categoryCard} className="hover-scale">
            <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }}>
              <Sofa size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Living Room</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sofas, tables, TV units</p>
          </Link>

          <Link to="/shop?category=bedroom" style={homeStyles.categoryCard} className="hover-scale">
            <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }}>
              <Bed size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Bedroom</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Beds, cupboards, side stands</p>
          </Link>

          <Link to="/shop?category=office" style={homeStyles.categoryCard} className="hover-scale">
            <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }}>
              <Briefcase size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Office Study</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Ergonomic chairs, wood desks</p>
          </Link>

          <Link to="/shop?category=dining" style={homeStyles.categoryCard} className="hover-scale">
            <div style={{ padding: '16px', backgroundColor: 'var(--color-surface-soft)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)' }}>
              <Utensils size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Dining</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Dining tables, chairs, cabinets</p>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container" style={{ marginBottom: '60px' }}>
        <h2 style={homeStyles.sectionTitle}>Featured Collections</h2>
        <p style={homeStyles.sectionSubtitle}>Handpicked premium furniture pieces representing high quality</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading featured products...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="container">
        <div style={homeStyles.badgeContainer}>
          <div style={homeStyles.badgeItem}>
            <div style={{ color: 'var(--color-primary)' }}><Truck size={36} /></div>
            <div>
              <h4 style={homeStyles.badgeTitle}>Secure Safe Delivery</h4>
              <p style={homeStyles.badgeDesc}>Delivered directly to your living room by expert logistics with optional assembly.</p>
            </div>
          </div>

          <div style={homeStyles.badgeItem}>
            <div style={{ color: 'var(--color-primary)' }}><RefreshCw size={36} /></div>
            <div>
              <h4 style={homeStyles.badgeTitle}>7-Days Easy Return</h4>
              <p style={homeStyles.badgeDesc}>No questions asked policy if dimensions or quality do not match your standards.</p>
            </div>
          </div>

          <div style={homeStyles.badgeItem}>
            <div style={{ color: 'var(--color-primary)' }}><ShieldCheck size={36} /></div>
            <div>
              <h4 style={homeStyles.badgeTitle}>Verified Vendor Quality</h4>
              <p style={homeStyles.badgeDesc}>All manufacturers are pre-vetted with background audits for authentic wood and fabrics.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

