import React, { useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './SyncML.css';

export default function SyncML() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    try {
      setAuthToken(token);
      setLoading(true);

      await api.post('/api/admin/sync-ml');

      toast.success('Sinkronisasi model ML dimulai');
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      toast.error(serverMsg || 'Gagal memulai sinkronisasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sync-page">
      <div className="sync-card">
        <div className="sync-header">
          <div>
            <h2>Sinkronisasi Model ML</h2>
            <p>
              Gunakan fitur ini untuk mengekspor data TA dan memulai proses
              pelatihan ulang model SBERT pada backend ML.
            </p>
          </div>

          <div className="sync-badge">
            Admin Tools
          </div>
        </div>

        <div className="sync-content">
          <div className="sync-icon-box">
            <div className="sync-icon">🤖</div>
          </div>

          <div className="sync-info">
            <h3>Proses Sinkronisasi</h3>
            <p>
              Sistem akan mengambil data tugas akhir dari database, menyiapkan
              data ke format yang dibutuhkan, lalu menjalankan proses pembaruan
              model rekomendasi.
            </p>

            <div className="sync-steps">
              <div className="sync-step">
                <span>1</span>
                <p>Ekspor data TA dari database</p>
              </div>

              <div className="sync-step">
                <span>2</span>
                <p>Konversi data ke format model</p>
              </div>

              <div className="sync-step">
                <span>3</span>
                <p>Latih ulang model SBERT</p>
              </div>
            </div>

            <div className="sync-note">
              <strong>Catatan:</strong> proses ini berjalan pada backend/ML.
              Pastikan service backend dan environment ML sudah aktif sebelum
              menjalankan sinkronisasi.
            </div>

            <button
              type="button"
              className="sync-button"
              onClick={sync}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Memulai Sinkronisasi...
                </>
              ) : (
                'Mulai Sinkronisasi'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}