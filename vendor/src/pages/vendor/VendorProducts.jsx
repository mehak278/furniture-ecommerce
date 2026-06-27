import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = { approved: { bg: '#dcfce7', color: '#166534' }, pending: { bg: '#fef9c3', color: '#854d0e' }, rejected: { bg: '#fee2e2', color: '#991b1b' } };
  const s = map[status] || map.pending;
  return <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>{status}</span>;
};

export const VendorProducts = () => {
  usePageTitle('My Products');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/vendor/products');
      setProducts(data.products || []);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <VendorLayout>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>{products.length} products total</p>
          <Link to="/products/add" style={{ background: '#d4a054', color: '#fff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            ➕ Add Product
          </Link>
        </div>

        {loading ? <p>Loading products...</p> : products.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '48px', margin: 0 }}>🪑</p>
            <h3 style={{ color: '#2c1a0e' }}>No products yet</h3>
            <p style={{ color: '#888' }}>Add your first furniture product to start selling</p>
            <Link to="/vendor/products/add" style={{ background: '#d4a054', color: '#fff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Add First Product</Link>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#faf7f2', borderBottom: '2px solid #f0e8dc' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Product</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Price</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Stock</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f8f5f0' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={p.images?.[0]?.url || '/placeholder.jpg'} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', background: '#f0e8dc' }} onError={e => e.target.style.display = 'none'} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#2c1a0e' }}>{p.name}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{p.category?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#d4a054', fontWeight: 600 }}>PKR {p.price?.toLocaleString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ color: p.stock < 5 ? '#dc2626' : '#166534', fontWeight: 600 }}>{p.stock}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>{statusBadge(p.isApproved ? 'approved' : p.isActive === false ? 'rejected' : 'pending')}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/vendor/products/edit/${p._id}`} style={{ background: '#f0f9ff', color: '#0369a1', padding: '6px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px' }}>Edit</Link>
                        <button onClick={() => handleDelete(p._id)} style={{ background: '#fff0f0', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </VendorLayout>
  );
};

