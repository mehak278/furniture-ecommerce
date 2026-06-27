import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../../components/product/ProductCard';
import api from '../../services/api';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter States
  const [priceRange, setPriceRange] = useState(250000);
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortOption, setSortOption] = useState('-createdAt');

  const materials = ['Solid Wood', 'Engineered Wood', 'Metal', 'Fabric', 'Leather', 'Glass'];
  const categories = [
    { label: 'Living Room', value: 'living-room' },
    { label: 'Bedroom', value: 'bedroom' },
    { label: 'Office Study', value: 'office' },
    { label: 'Dining Room', value: 'dining' },
  ];

  const q = searchParams.get('q') || '';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        sort: sortOption,
        limit: 9,
      };

      if (q) params.q = q;
      if (selectedCategory) params.categorySlug = selectedCategory;
      if (selectedMaterial) params.material = selectedMaterial;
      if (priceRange) params['price[lte]'] = priceRange;

      const { data } = await api.get('/products', { params });
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Failed to load products', error);
      // Fallback mock data
      const mockProducts = [
        {
          _id: 'mock1',
          name: 'Classic Velvet Chesterfield Sofa',
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
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [currentPage, selectedCategory, selectedMaterial, priceRange, sortOption, q]);

  const shopStyles = {
    pageLayout: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '40px',
      marginTop: '40px',
    },
    sidebar: {
      backgroundColor: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      padding: '24px',
      height: 'fit-content',
    },
    sidebarTitle: {
      fontSize: '18px',
      fontWeight: 600,
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      borderBottom: '1px solid var(--color-border)',
      paddingBottom: '10px',
    },
    filterGroup: {
      marginBottom: '24px',
    },
    filterLabel: {
      fontWeight: 500,
      fontSize: '14px',
      marginBottom: '12px',
      display: 'block',
    },
    list: {
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    listItem: {
      fontSize: '14px',
      cursor: 'pointer',
      color: 'var(--color-text-muted)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    activeItem: {
      color: 'var(--color-primary)',
      fontWeight: 500,
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      backgroundColor: 'var(--color-surface)',
      padding: '16px 24px',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      gap: '30px',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '12px',
      marginTop: '40px',
    },
    pageBtn: {
      border: '1px solid var(--color-border)',
      padding: '8px 16px',
      borderRadius: 'var(--radius-sm)',
      cursor: 'pointer',
      backgroundColor: 'var(--color-surface)',
    },
    activePageBtn: {
      backgroundColor: 'var(--color-primary)',
      color: 'var(--color-text-light)',
      border: 'none',
    },
  };

  return (
    <div className="container">
      <div style={shopStyles.pageLayout}>
        {/* Left Sidebar Filters */}
        <aside style={shopStyles.sidebar}>
          <h3 style={shopStyles.sidebarTitle}>
            <SlidersHorizontal size={18} /> Filters
          </h3>

          {/* Category Filter */}
          <div style={shopStyles.filterGroup}>
            <span style={shopStyles.filterLabel}>Rooms</span>
            <ul style={shopStyles.list}>
              <li
                style={{
                  ...shopStyles.listItem,
                  ...(selectedCategory === '' ? shopStyles.activeItem : {}),
                }}
                onClick={() => { setSelectedCategory(''); setCurrentPage(1); }}
              >
                All Rooms
              </li>
              {categories.map((cat) => (
                <li
                  key={cat.value}
                  style={{
                    ...shopStyles.listItem,
                    ...(selectedCategory === cat.value ? shopStyles.activeItem : {}),
                  }}
                  onClick={() => { setSelectedCategory(cat.value); setCurrentPage(1); }}
                >
                  {cat.label}
                </li>
              ))}
            </ul>
          </div>

          {/* Material Filter */}
          <div style={shopStyles.filterGroup}>
            <span style={shopStyles.filterLabel}>Material</span>
            <ul style={shopStyles.list}>
              <li
                style={{
                  ...shopStyles.listItem,
                  ...(selectedMaterial === '' ? shopStyles.activeItem : {}),
                }}
                onClick={() => { setSelectedMaterial(''); setCurrentPage(1); }}
              >
                All Materials
              </li>
              {materials.map((mat) => (
                <li
                  key={mat}
                  style={{
                    ...shopStyles.listItem,
                    ...(selectedMaterial === mat ? shopStyles.activeItem : {}),
                  }}
                  onClick={() => { setSelectedMaterial(mat); setCurrentPage(1); }}
                >
                  {mat}
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div style={shopStyles.filterGroup}>
            <span style={shopStyles.filterLabel}>Max Price (PKR {priceRange})</span>
            <input
              type="range"
              min="10000"
              max="500000"
              step="10000"
              value={priceRange}
              onChange={(e) => { setPriceRange(parseInt(e.target.value)); setCurrentPage(1); }}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </div>
        </aside>

        {/* Right Main Grid */}
        <main>
          {/* Top Sorting Bar */}
          <div style={shopStyles.topBar}>
            <span style={{ fontSize: '15px', color: 'var(--color-text-muted)' }}>
              Showing {products.length} products {q && `for "${q}"`}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowUpDown size={16} color="var(--color-text-muted)" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="-createdAt">Newest Arrivals</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="-ratings.average">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading products catalog...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--color-text-muted)' }}>
              No products found matching your current filter settings.
            </div>
          ) : (
            <>
              <div style={shopStyles.grid}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={shopStyles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    style={shopStyles.pageBtn}
                  >
                    Previous
                  </button>
                  {[...Array(totalPages).keys()].map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p + 1)}
                      style={{
                        ...shopStyles.pageBtn,
                        ...(currentPage === p + 1 ? shopStyles.activePageBtn : {}),
                      }}
                    >
                      {p + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={shopStyles.pageBtn}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
