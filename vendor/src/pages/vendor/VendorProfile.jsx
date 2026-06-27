import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { VendorLayout } from '../../layouts/VendorLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #e0d5c8', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#555', marginBottom: '6px' };

export const VendorProfile = () => {
  usePageTitle('Shop Profile');
  const [form, setForm] = useState({ shopName: '', shopDescription: '', bankDetails: { accountName: '', accountNumber: '', bankName: '' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/vendor/dashboard').then(({ data }) => {
      if (data.vendor) setForm({ shopName: data.vendor.shopName || '', shopDescription: data.vendor.shopDescription || '', bankDetails: data.vendor.bankDetails || { accountName: '', accountNumber: '', bankName: '' } });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setBank = (field, value) => setForm(prev => ({ ...prev, bankDetails: { ...prev.bankDetails, [field]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/vendor/profile', form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <VendorLayout><p>Loading...</p></VendorLayout>;

  return (
    <VendorLayout>
      <div style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSave}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Shop Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Shop Name</label>
                <input style={inputStyle} value={form.shopName} onChange={e => set('shopName', e.target.value)} placeholder="Your shop name" />
              </div>
              <div>
                <label style={labelStyle}>Shop Description</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} value={form.shopDescription} onChange={e => set('shopDescription', e.target.value)} placeholder="Describe your shop and products..." />
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <h3 style={{ margin: '0 0 20px', color: '#2c1a0e', fontSize: '16px', borderBottom: '1px solid #f0e8dc', paddingBottom: '12px' }}>Bank Details (for payouts)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Account Holder Name</label>
                <input style={inputStyle} value={form.bankDetails.accountName} onChange={e => setBank('accountName', e.target.value)} placeholder="Full name on account" />
              </div>
              <div>
                <label style={labelStyle}>Account Number / IBAN</label>
                <input style={inputStyle} value={form.bankDetails.accountNumber} onChange={e => setBank('accountNumber', e.target.value)} placeholder="PK00XXXX0000000000000000" />
              </div>
              <div>
                <label style={labelStyle}>Bank Name</label>
                <input style={inputStyle} value={form.bankDetails.bankName} onChange={e => setBank('bankName', e.target.value)} placeholder="e.g., HBL, MCB, Meezan Bank" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ background: '#d4a054', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '8px', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </VendorLayout>
  );
};

