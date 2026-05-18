import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { setAuthToken } from '../services/api';

export default function FormPengajuan() {
  const { token } = useAuth();
  const [judul, setJudul] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState(null);
  const [dosen, setDosen] = useState([]);
  const [pembimbing1, setPembimbing1] = useState('');
  const [pembimbing2, setPembimbing2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!judul.trim()) return toast.error('Judul wajib diisi');
    setLoading(true);
    try {
      setAuthToken(token);
      const formData = new FormData();
      formData.append('judul', judul);
      formData.append('abstract', abstract);
      // pembimbing selected by user
      if (pembimbing1) formData.append('pembimbing1_id', pembimbing1);
      if (pembimbing2) formData.append('pembimbing2_id', pembimbing2);
      if (file) formData.append('file_pendukung', file);

      const res = await api.post('/api/pengajuan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Pengajuan berhasil dikirim');
      setJudul(''); setAbstract(''); setFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.pesan || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const loadDosen = async () => {
      try {
        setAuthToken(token);
        const res = await api.get('/api/admin/users');
        const list = (res.data.data || []).filter(u => u.role === 'dosen');
        setDosen(list);
        if (list.length > 0) {
          setPembimbing1(list[0].id);
          if (list.length > 1) setPembimbing2(list[1].id);
        }
      } catch (err) { console.error(err); }
    };
    if (token) loadDosen();
  }, [token]);

  return (
    <div className="page-card">
      <h2>Form Pengajuan Judul</h2>
      <form onSubmit={handleSubmit}>
        <label>Judul</label>
        <input value={judul} onChange={e => setJudul(e.target.value)} required placeholder="Masukkan judul" />
        <label>Ringkasan (opsional)</label>
        <textarea value={abstract} onChange={e => setAbstract(e.target.value)} placeholder="Ringkasan singkat" />
        <label>File pendukung (opsional)</label>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <label>Pembimbing 1</label>
        <select value={pembimbing1} onChange={e=>setPembimbing1(e.target.value)}>
          <option value="">-- Pilih Pembimbing --</option>
          {dosen.map(d => <option key={d.id} value={d.id}>{d.nama} ({d.username})</option>)}
        </select>
        <label>Pembimbing 2</label>
        <select value={pembimbing2} onChange={e=>setPembimbing2(e.target.value)}>
          <option value="">-- Pilih Pembimbing (opsional) --</option>
          {dosen.map(d => <option key={d.id} value={d.id}>{d.nama} ({d.username})</option>)}
        </select>
        <div style={{marginTop:12}}>
          <button type="submit" disabled={loading}>{loading ? 'Mengirim...' : 'Ajukan'}</button>
        </div>
      </form>
    </div>
  );
}
