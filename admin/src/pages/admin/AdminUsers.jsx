import React, { useEffect, useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import { AdminLayout } from '../../layouts/AdminLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const AdminUsers = () => {
  usePageTitle('Manage Users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [acting, setActing] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleBlock = async (id, isActive) => {
    setActing(id);
    try {
      await api.put(`/admin/users/${id}/block`);
      toast.success(isActive ? 'User blocked' : 'User unblocked');
      fetchUsers();
    } catch { toast.error('Action failed'); }
    finally { setActing(null); }
  };

  const filtered = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1100px' }}>
        <div style={{ marginBottom: '20px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search users by name or email..." style={{ width: '100%', maxWidth: '400px', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} />
        </div>

        {loading ? <p>Loading users...</p> : (
          <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e9ecef' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1a1f2e' }}>{u.name}</td>
                    <td style={{ padding: '14px 16px', color: '#555' }}>{u.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: u.role === 'admin' ? '#ede9fe' : u.role === 'vendor' ? '#fef9c3' : '#f0f9ff', color: u.role === 'admin' ? '#5b21b6' : u.role === 'vendor' ? '#854d0e' : '#1e40af', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#888', fontSize: '13px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: u.isActive !== false ? '#dcfce7' : '#fee2e2', color: u.isActive !== false ? '#166534' : '#991b1b', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
                        {u.isActive !== false ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.role !== 'admin' && (
                        <button onClick={() => toggleBlock(u._id, u.isActive !== false)} disabled={acting === u._id} style={{ background: u.isActive !== false ? '#fee2e2' : '#dcfce7', color: u.isActive !== false ? '#991b1b' : '#166534', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                          {acting === u._id ? '...' : u.isActive !== false ? '🚫 Block' : '✅ Unblock'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#aaa', padding: '40px' }}>No users found</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

