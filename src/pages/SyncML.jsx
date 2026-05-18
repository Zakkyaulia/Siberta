import React, { useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function SyncML() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    try {
      setAuthToken(token);
      setLoading(true);
      await api.post('/api/admin/sync-ml');
      toast.success('Sinkronisasi dimulai');
    } catch (err) { console.error(err); toast.error('Gagal memulai sinkronisasi'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-card">
      <h2>Sinkronisasi Model ML</h2>
      <p>Gunakan fitur ini untuk mengekspor DB TA ke format .pkl dan latih ulang model SBERT (proses di backend/ML).</p>
      <button onClick={sync} disabled={loading}>{loading ? 'Memulai...' : 'Mulai Sinkronisasi'}</button>
    </div>
  );
}

