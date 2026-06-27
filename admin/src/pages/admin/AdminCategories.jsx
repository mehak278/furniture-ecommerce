import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };

export const AdminCategories = () => {
  usePageTitle('Categories');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', parentCategory: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories || []);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      await api.post('/categories', form);
      toast.success('Category added!');
      setForm({ name: '', parentCategory: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    setDeleting(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const parentCats = categories.filter(c => !c.parentCategory);

  return (
    <AdminLayout>
      <div style={{ maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'start' }}>
        {/* Add Form */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a1f2e', fontSize: '16px' }}>Add Category</h3>
          <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Category Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Sofas, Beds, Chairs" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>Parent Category (optional)</label>
              <select style={inputStyle} value={form.parentCategory} onChange={e => setForm(p => ({ ...p, parentCategory: e.target.value }))}>
                <option value="">— Top Level —</option>
                {parentCats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={saving} style={{ background: '#4f9cf9', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Adding...' : '➕ Add Category'}
            </button>
          </form>
        </div>

        {/* Category List */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a1f2e', fontSize: '16px' }}>All Categories ({categories.length})</h3>
          {loading ? <p>Loading...</p> : categories.length === 0 ? (
            <p style={{ color: '#aaa', textAlign: 'center', padding: '24px 0' }}>No categories yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {parentCats.map(parent => (
                <div key={parent._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8f9fa', borderRadius: '8px', borderLeft: '3px solid #4f9cf9' }}>
                    <span style={{ fontWeight: 700, color: '#1a1f2e', fontSize: '14px' }}>📂 {parent.name}</span>
                    <button onClick={() => handleDelete(parent._id)} disabled={deleting === parent._id} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
                      {deleting === parent._id ? '...' : 'Delete'}
                    </button>
                  </div>
                  {categories.filter(c => c.parentCategory?._id === parent._id || c.parentCategory === parent._id).map(child => (
                    <div key={child._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px 8px 32px', borderLeft: '2px solid #e2e8f0', marginLeft: '14px' }}>
                      <span style={{ color: '#555', fontSize: '13px' }}>└ {child.name}</span>
                      <button onClick={() => handleDelete(child._id)} disabled={deleting === child._id} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '3px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>
                        {deleting === child._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

