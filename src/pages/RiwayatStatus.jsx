import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './RiwayatStatus.css';

export default function RiwayatStatus() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusClass = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'draft') return 'status-draft';
    if (value === 'diajukan') return 'status-diajukan';
    if (value === 'disetujui') return 'status-disetujui';
    if (value === 'ditolak') return 'status-ditolak';
    if (value === 'revisi') return 'status-revisi';

    return 'status-default';
  };

  const formatTanggal = (dateString) => {
    if (!dateString) return '-';

    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setAuthToken(token);

        const res = await api.get('/api/pengajuan');
        setItems(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat riwayat');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      load();
    }
  }, [token]);

  return (
    <div className="riwayat-page">
      <div className="riwayat-card">
        <div className="riwayat-header">
          <div>
            <h2>Riwayat Status Pengajuan</h2>
            <p>Pantau perkembangan status judul yang telah diajukan.</p>
          </div>

          <div className="riwayat-count">
            {items.length} Pengajuan
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            Memuat data riwayat...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>Belum ada pengajuan</h3>
            <p>Data pengajuan judul akan muncul di halaman ini setelah kamu mengirimkan pengajuan.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="riwayat-list">
            {items.map((it, index) => (
              <div className="riwayat-item" key={it.id}>
                <div className="riwayat-number">
                  {index + 1}
                </div>

                <div className="riwayat-content">
                  <div className="riwayat-top">
                    <h3>{it.judul}</h3>
                    <span className={`status-badge ${getStatusClass(it.status)}`}>
                      {it.status || 'Tidak diketahui'}
                    </span>
                  </div>

                  {it.ringkasan && (
                    <p className="riwayat-ringkasan">
                      {it.ringkasan}
                    </p>
                  )}

                  <div className="riwayat-meta">
                    <span>📅 {formatTanggal(it.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}