import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ValidasiAkhir() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setAuthToken(token);
        const res = await api.get('/api/pengajuan');
        // filter submissions ready for admin validation
        const ready = (res.data.data || []).filter(s => s.status === 'setuju');
        setItems(ready);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat data validasi');
      }
    };
    load();
  }, [token]);

  const validate = async (id) => {
    try {
      await api.post(`/api/admin/validate/${id}`);
      toast.success('Pengajuan divalidasi');
      setItems(items.filter(i=>i.id!==id));
    } catch (err) {
      console.error(err);
      toast.error('Gagal memvalidasi');
    }
  };

  return (
    <div className="page-card">
      <h2>Validasi Akhir (Admin)</h2>
      {items.length === 0 && <p>Tidak ada pengajuan untuk divalidasi.</p>}
      <ul>
        {items.map(it=> (
          <li key={it.id} style={{marginBottom:12}}>
            <strong>{it.judul}</strong>
            <div>Mahasiswa: {it.student_id}</div>
            <div>Status: {it.status}</div>
            <div style={{marginTop:6}}>
              <button onClick={()=>validate(it.id)}>Validasi</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

