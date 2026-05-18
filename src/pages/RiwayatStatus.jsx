import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RiwayatStatus() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setAuthToken(token);
        const res = await api.get('/api/pengajuan');
        setItems(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat riwayat');
      }
    };
    load();
  }, [token]);

  return (
    <div className="page-card">
      <h2>Riwayat Status Pengajuan</h2>
      {items.length === 0 && <p>Belum ada pengajuan.</p>}
      <ul>
        {items.map(it => (
          <li key={it.id} style={{marginBottom:12}}>
            <strong>{it.judul}</strong>
            <div>Status: {it.status}</div>
            <div>Tanggal: {new Date(it.created_at).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

