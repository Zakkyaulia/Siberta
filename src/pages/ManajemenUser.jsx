import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ManajemenUser() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ nama:'', username:'', password:'', role:'mahasiswa' });

  useEffect(()=>{
    const load = async () => {
      try { setAuthToken(token); const res = await api.get('/api/admin/users'); setUsers(res.data.data || []); }
      catch (err) { console.error(err); toast.error('Gagal memuat user'); }
    };
    load();
  }, [token]);

  const create = async () => {
    try { await api.post('/api/admin/users', form); toast.success('User dibuat'); setForm({ nama:'', username:'', password:'', role:'mahasiswa' }); }
    catch (err) { console.error(err); toast.error('Gagal membuat user'); }
  };

  return (
    <div className="page-card">
      <h2>Manajemen User</h2>
      <div style={{display:'grid', gap:8, maxWidth:480}}>
        <input placeholder="Nama" value={form.nama} onChange={e=>setForm({...form, nama:e.target.value})} />
        <input placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        <input placeholder="Password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} type="password" />
        <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option><option value="admin">Admin</option></select>
        <button onClick={create}>Buat User</button>
      </div>

      <h3 style={{marginTop:16}}>Daftar User</h3>
      <ul>
        {users.map(u=> <li key={u.id}>{u.nama} — {u.username} — {u.role}</li>)}
      </ul>
    </div>
  );
}

