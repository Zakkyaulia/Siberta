import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './ManajemenUser.css';

export default function ManajemenUser() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    nama: '',
    username: '',
    password: '',
    role: 'mahasiswa',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadUsers();
    }
  }, [token]);

  const create = async (e) => {
    e.preventDefault();

    if (!form.nama.trim()) {
      toast.error('Nama wajib diisi');
      return;
    }

    if (!form.username.trim()) {
      toast.error('Username wajib diisi');
      return;
    }

    if (!form.password.trim()) {
      toast.error('Password wajib diisi');
      return;
    }

    try {
      setSaving(true);
      setAuthToken(token);

      await api.post('/api/admin/users', form);

      toast.success('User berhasil dibuat');

      setForm({
        nama: '',
        username: '',
        password: '',
        role: 'mahasiswa',
      });

      loadUsers();
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      toast.error(serverMsg || 'Gagal membuat user');
    } finally {
      setSaving(false);
    }
  };

  const getRoleClass = (role) => {
    const value = (role || '').toLowerCase();

    if (value === 'admin') return 'role-admin';
    if (value === 'dosen') return 'role-dosen';
    if (value === 'mahasiswa') return 'role-mahasiswa';

    return 'role-default';
  };

  return (
    <div className="user-page">
      <div className="user-card">
        <div className="user-header">
          <div>
            <h2>Manajemen User</h2>
            <p>Kelola akun pengguna berdasarkan nama, username, password, dan role.</p>
          </div>

          <div className="user-count">
            {users.length} User
          </div>
        </div>

        <div className="user-layout">
          <form className="user-form-card" onSubmit={create}>
            <div className="form-title">
              <h3>Tambah User</h3>
              <p>Masukkan data akun pengguna baru.</p>
            </div>

            <div className="user-form-group">
              <label htmlFor="nama">Nama</label>
              <input
                id="nama"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={form.nama}
                onChange={(e) =>
                  setForm({ ...form, nama: e.target.value })
                }
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Masukkan username"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div className="user-form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <button type="submit" disabled={saving}>
              {saving ? 'Membuat User...' : 'Buat User'}
            </button>
          </form>

          <div className="user-list-card">
            <div className="list-title">
              <h3>Daftar User</h3>
              <p>Daftar akun yang sudah terdaftar di sistem.</p>
            </div>

            {loading && (
              <div className="loading-state">
                Memuat data user...
              </div>
            )}

            {!loading && users.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">👤</div>
                <h3>Belum ada user</h3>
                <p>User yang dibuat akan tampil pada bagian ini.</p>
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="user-list">
                {users.map((u, index) => (
                  <div className="user-item" key={u.id}>
                    <div className="user-number">
                      {index + 1}
                    </div>

                    <div className="user-info">
                      <h4>{u.nama}</h4>
                      <p>@{u.username}</p>
                    </div>

                    <span className={`role-badge ${getRoleClass(u.role)}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}