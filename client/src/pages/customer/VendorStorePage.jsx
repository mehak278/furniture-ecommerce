import React, { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Store, Star, MapPin, Calendar, Heart, ShieldCheck, ArrowRight, Grid, List } from 'lucide-react';
import toast from 'react-hot-toast';

export const VendorStorePage = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(148); // mock follower count base
  const [viewMode, setViewMode] = useState('grid');

  usePageTitle(vendor ? `${vendor.shopName} - Showroom` : 'Loading Store...');

  useEffect(() => {
    const fetchVendorData = async () => {
      setLoading(true);
      try {
        // Fetch all vendors to find the matching one
        const vendorsRes = await api.get('/admin/vendors');
        const foundVendor = vendorsRes.data?.vendors?.find(v => v._id === id);
        
        if (foundVendor) {
          setVendor(foundVendor);
          
          // Fetch products for this specific vendor
          const productsRes = await api.get(`/products?vendor=${id}`);
          if (productsRes.data?.success) {
            setProducts(productsRes.data.products);
          }
        } else {
          toast.error('Store profile not found');
        }
      } catch (error) {
        console.error('Error loading vendor store data:', error);
        toast.error('Failed to load store profile');
      } finally {
        setLoading(false);
      }
    };

    fetchVendorData();
  }, [id]);

  const handleFollowToggle = () => {
    if (isFollowing) {
      setFollowersCount(prev => prev - 1);
      toast.success(`Unfollowed ${vendor?.shopName}`);
    } else {
      setFollowersCount(prev => prev + 1);
      toast.success(`Following ${vendor?.shopName}! You will be notified of new furniture arrivals.`);
    }
    setIsFollowing(!isFollowing);
  };

  const storeStyles = {
    heroBanner: {
      position: 'relative',
      height: '240px',
      background: 'linear-gradient(135deg, #2c1a0e 0%, #6e4e37 100%)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '0 40px 30px',
      color: '#fff',
      overflow: 'hidden',
    },
    heroDecor: {
      position: 'absolute',
      right: '-10%',
      top: '-20%',
      fontSize: '300px',
      opacity: 0.04,
      fontFamily: 'serif',
      userSelect: 'none',
    },
    logoBox: {
      width: '100px',
      height: '100px',
      borderRadius: '12px',
      backgroundColor: '#fff',
      border: '4px solid #fff',
      boxShadow: '0 8px 24px rgba(44, 26, 14, 0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#d4a054',
      marginRight: '24px',
      zIndex: 2,
    },
    metaRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: '8px',
      fontSize: '14px',
      color: '#eae3db',
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    followBtn: (following) => ({
      backgroundColor: following ? 'transparent' : '#d4a054',
      color: following ? '#fff' : '#fff',
      border: following ? '2px solid #fff' : '2px solid #d4a054',
      padding: '10px 24px',
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
      marginLeft: 'auto',
      zIndex: 2,
    }),
    profileSection: {
      backgroundColor: '#fff',
      borderBottom: '1px solid #f0e8dc',
      padding: '30px 40px',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '40px',
      marginTop: '10px',
    },
    sidebarCard: {
      border: '1px solid #e8e0d5',
      borderRadius: '12px',
      padding: '24px',
      backgroundColor: '#fdfbf9',
      height: 'fit-content',
    },
    catalogHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      margin: '40px 0 20px',
      paddingBottom: '12px',
      borderBottom: '1px solid #e8e0d5',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '30px',
      marginBottom: '60px',
    },
    productCard: {
      backgroundColor: '#fff',
      border: '1px solid #e8e0d5',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    imgContainer: {
      height: '240px',
      backgroundColor: '#f5efe6',
      overflow: 'hidden',
      position: 'relative',
    },
    badge: {
      position: 'absolute',
      top: '12px',
      left: '12px',
      backgroundColor: '#d93838',
      color: '#fff',
      padding: '4px 8px',
      fontSize: '11px',
      fontWeight: 'bold',
      borderRadius: 'var(--radius-sm)',
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading store details...</p>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
        <Store size={48} style={{ color: '#d93838', margin: '0 auto 16px' }} />
        <h2>Store Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '8px 0 24px' }}>
          The requested vendor showroom profile could not be loaded.
        </p>
        <Link to="/shop" className="btn btn-primary">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      {/* 1. HERO COVER BANNER */}
      <div style={storeStyles.heroBanner}>
        <div style={storeStyles.heroDecor}>🛋️</div>
        
        <div style={storeStyles.logoBox}>
          <Store size={48} />
        </div>

        <div>
          <span style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: '#d4a054', fontWeight: 'bold' }}>
            Verified Showroom
          </span>
          <h1 style={{ fontSize: '32px', margin: '4px 0 0', color: '#fff', fontWeight: 700 }}>
            {vendor.shopName}
          </h1>
          
          <div style={storeStyles.metaRow}>
            <div style={storeStyles.metaItem}>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <strong>{vendor.rating || '4.8'}</strong> ({vendor.totalReviews || '12'} ratings)
            </div>
            <div style={storeStyles.metaItem}>
              <Calendar size={16} />
              <span>Seller since {new Date(vendor.createdAt).getFullYear()}</span>
            </div>
            <div style={storeStyles.metaItem}>
              <span>👥 {followersCount} followers</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleFollowToggle}
          style={storeStyles.followBtn(isFollowing)}
        >
          {isFollowing ? 'Following ✓' : 'Follow Store'}
        </button>
      </div>

      {/* 2. DESCRIPTION & METRICS */}
      <div style={storeStyles.profileSection}>
        <div style={storeStyles.infoGrid}>
          <div>
            <h3 style={{ fontSize: '18px', color: '#2c1a0e', fontWeight: 600, marginBottom: '12px' }}>
              About the Showroom
            </h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7, fontSize: '15px', whiteSpace: 'pre-line' }}>
              {vendor.shopDescription}
            </p>
          </div>

          <div style={storeStyles.sidebarCard}>
            <h4 style={{ fontSize: '15px', color: '#2c1a0e', fontWeight: 600, marginBottom: '16px', borderBottom: '1px solid #e8e0d5', paddingBottom: '8px' }}>
              Showroom details
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={18} style={{ color: '#d4a054', flexShrink: 0 }} />
                <div>
                  <strong>Showroom Location</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>
                    {vendor.hasPhysicalStore ? vendor.storeAddress : 'Online-only verified outlet'}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldCheck size={18} style={{ color: '#d4a054', flexShrink: 0 }} />
                <div>
                  <strong>Setup Type</strong>
                  <p style={{ margin: '2px 0 0', color: 'var(--color-text-muted)' }}>
                    {vendor.businessType || 'Single Owner (Independent)'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT CATALOG */}
      <div>
        <div style={storeStyles.catalogHeader}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#2c1a0e' }}>Showroom Catalog</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Showing {products.length} premium creations
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{ padding: '8px', border: '1px solid #e8e0d5', borderRadius: '6px', cursor: 'pointer', backgroundColor: viewMode === 'grid' ? '#f5efe6' : '#fff' }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{ padding: '8px', border: '1px solid #e8e0d5', borderRadius: '6px', cursor: 'pointer', backgroundColor: viewMode === 'list' ? '#f5efe6' : '#fff' }}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', border: '1px dashed #e8e0d5', borderRadius: '12px', backgroundColor: '#fdfbf9' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>No products listed by this showroom yet.</p>
          </div>
        ) : (
          <div style={storeStyles.grid}>
            {products.map((prod) => (
              <div key={prod._id} style={storeStyles.productCard}>
                {prod.discountPrice > 0 && (
                  <div style={storeStyles.badge}>-{prod.discountPercent}%</div>
                )}
                
                <div style={storeStyles.imgContainer}>
                  <img
                    src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '11px', color: '#9a7a5a', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {prod.material}
                  </span>
                  
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '6px 0 10px', height: '40px', overflow: 'hidden' }}>
                    <Link to={`/product/${prod.slug}`} style={{ color: '#2c1a0e' }}>
                      {prod.name}
                    </Link>
                  </h4>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid #f0e8dc' }}>
                    <div>
                      {prod.discountPrice > 0 ? (
                        <>
                          <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '16px' }}>PKR {prod.discountPrice}</span>
                          <span style={{ color: 'var(--color-text-muted)', textDecoration: 'line-through', fontSize: '12px', marginLeft: '6px' }}>PKR {prod.price}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '16px' }}>PKR {prod.price}</span>
                      )}
                    </div>

                    <Link to={`/product/${prod.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#d4a054', fontWeight: 'bold' }}>
                      View Details <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
