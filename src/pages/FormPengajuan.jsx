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

      const payloadBase = {
        judul,
        abstract,
        ringkasan: abstract,
        pembimbing1_id: pembimbing1 || undefined,
        pembimbing2_id: pembimbing2 || undefined,
      };

      if (file) {
        const formData = new FormData();
        Object.entries(payloadBase).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') formData.append(key, value);
        });
        formData.append('file_pendukung', file);

        await api.post('/api/pengajuan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/api/pengajuan', payloadBase);
      }

      toast.success('Pengajuan berhasil dikirim');
      setJudul('');
      setAbstract('');
      setFile(null);
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.pesan || err?.response?.data?.message;
      toast.error(serverMsg || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    const pickDosenFromResponse = (payload) => {
      const list = Array.isArray(payload?.data) ? payload.data : [];
      return list.filter(u => (u?.role || '').toLowerCase() === 'dosen');
    };

    const applyDosenList = (list) => {
      setDosen(list);
      if (list.length > 0) {
        setPembimbing1(list[0].id);
        setPembimbing2(list.length > 1 ? list[1].id : '');
      }
    };

    const loadDosen = async () => {
      setAuthToken(token);

      const endpoints = ['/api/auth/dosen', '/api/dosen', '/api/users/dosen', '/api/admin/users'];
      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          const list = pickDosenFromResponse(res.data);
          if (list.length > 0) {
            applyDosenList(list);
            return;
          }
        } catch (err) {
          console.warn(`Gagal ambil dosen dari ${endpoint}`, err?.response?.status || err?.message);
        }
      }

      const fallbackDosen = [
        { id: '2', nama: 'Dr. Dosen Pembimbing', username: 'dosen1', role: 'dosen' }
      ];
      applyDosenList(fallbackDosen);
      toast('Data dosen backend belum tersedia. Sementara gunakan data dosen default.', { icon: 'i' });
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
