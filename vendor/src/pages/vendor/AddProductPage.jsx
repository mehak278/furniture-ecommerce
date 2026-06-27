import React, { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };

export const AddProductPage = () => {
  usePageTitle('Add Product');
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', description: '', price: '', discountPrice: '',
    stock: '', sku: '', material: '', warrantyMonths: '', deliveryDays: '5',
    deliveryCharge: '0', assemblyRequired: false, careInstructions: '',
    dimensions: { length: '', width: '', height: '', weight: '' },
  });

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || [])).catch(() => {});
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setDim = (field, value) => setForm(prev => ({ ...prev, dimensions: { ...prev.dimensions, [field]: value } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.price || !form.stock) {
      toast.error('Fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      await api.post('/products', form);
      toast.success('Product added! Waiting for admin approval.');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <VendorLayout>
      <div style={{ maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Basic Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Product Name *</label>
                <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g., Modern 3-Seater Sofa" required />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)} required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>SKU</label>
                <input style={inputStyle} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g., SOFA-001" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Description *</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe your product in detail..." />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Pricing & Inventory</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Price (PKR) *</label>
                <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="25000" required />
              </div>
              <div>
                <label style={labelStyle}>Discount Price (PKR)</label>
                <input style={inputStyle} type="number" value={form.discountPrice} onChange={e => set('discountPrice', e.target.value)} placeholder="20000" />
              </div>
              <div>
                <label style={labelStyle}>Stock *</label>
                <input style={inputStyle} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="10" required />
              </div>
            </div>
          </div>

          {/* Details */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Product Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Material</label>
                <input style={inputStyle} value={form.material} onChange={e => set('material', e.target.value)} placeholder="e.g., Sheesham Wood" />
              </div>
              <div>
                <label style={labelStyle}>Warranty (months)</label>
                <input style={inputStyle} type="number" value={form.warrantyMonths} onChange={e => set('warrantyMonths', e.target.value)} placeholder="12" />
              </div>
              <div>
                <label style={labelStyle}>Length (cm)</label>
                <input style={inputStyle} type="number" value={form.dimensions.length} onChange={e => setDim('length', e.target.value)} placeholder="200" />
              </div>
              <div>
                <label style={labelStyle}>Width (cm)</label>
                <input style={inputStyle} type="number" value={form.dimensions.width} onChange={e => setDim('width', e.target.value)} placeholder="90" />
              </div>
              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input style={inputStyle} type="number" value={form.dimensions.height} onChange={e => setDim('height', e.target.value)} placeholder="85" />
              </div>
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input style={inputStyle} type="number" value={form.dimensions.weight} onChange={e => setDim('weight', e.target.value)} placeholder="35" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Care Instructions</label>
                <input style={inputStyle} value={form.careInstructions} onChange={e => set('careInstructions', e.target.value)} placeholder="e.g., Wipe with dry cloth, avoid direct sunlight" />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Delivery</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Delivery Days</label>
                <input style={inputStyle} type="number" value={form.deliveryDays} onChange={e => set('deliveryDays', e.target.value)} placeholder="5" />
              </div>
              <div>
                <label style={labelStyle}>Delivery Charge (PKR)</label>
                <input style={inputStyle} type="number" value={form.deliveryCharge} onChange={e => set('deliveryCharge', e.target.value)} placeholder="0" />
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="assembly" checked={form.assemblyRequired} onChange={e => set('assemblyRequired', e.target.checked)} style={{ width: '18px', height: '18px' }} />
                <label htmlFor="assembly" style={{ fontSize: '14px', color: '#555', cursor: 'pointer' }}>Assembly Required</label>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" disabled={loading} style={{ background: '#d4a054', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : '✅ Add Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} style={{ background: '#fff', color: '#888', border: '1px solid #ddd', padding: '14px 24px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </VendorLayout>
  );
};

