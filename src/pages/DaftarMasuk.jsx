import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './DaftarMasuk.css';

function ReviewModal({ open, onClose, submission, onSubmitted }) {
  const [decision, setDecision] = useState('setuju');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDecision('setuju');
      setComment('');
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open, onClose]);

  if (!open || !submission) {
    return null;
  }

  const submit = async () => {
    setLoading(true);

    try {
      await api.post(`/api/reviews/${submission.id}`, {
        decision,
        comment,
      });

      toast.success('Keputusan tersimpan');

      if (onSubmitted) {
        await onSubmitted(false);
      }

      onClose();
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      toast.error(serverMsg || 'Gagal menyimpan keputusan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-backdrop" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <div>
            <h3>Review Pengajuan</h3>
            <p>{submission.judul || '-'}</p>
          </div>

          <button
            type="button"
            className="review-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="review-info">
          <div>
            <span>Mahasiswa</span>
            <strong>{submission.mahasiswa?.nama || submission.student_id || '-'}</strong>
          </div>

          <div>
            <span>Status Saat Ini</span>
            <strong>{submission.status || '-'}</strong>
          </div>
        </div>

        <div className="review-form-group">
          <label htmlFor="decision">Keputusan</label>
          <select
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          >
            <option value="setuju">Setuju</option>
            <option value="revisi">Revisi</option>
            <option value="tolak">Tolak</option>
          </select>
        </div>

        <div className="review-form-group">
          <label htmlFor="comment">Catatan untuk mahasiswa</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tuliskan catatan atau arahan untuk mahasiswa"
            rows="5"
          />
        </div>

        <div className="review-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </button>

          <button
            type="button"
            className="btn-save"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'Menyimpan...' : 'Simpan Keputusan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DaftarMasuk() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const getStatusClass = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'draft') return 'status-draft';
    if (value === 'diajukan') return 'status-diajukan';
    if (value === 'disetujui') return 'status-disetujui';
    if (value === 'setuju') return 'status-disetujui';
    if (value === 'ditolak') return 'status-ditolak';
    if (value === 'tolak') return 'status-ditolak';
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

  const load = async (showErrorToast = true) => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/pengajuan');
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);

      if (showErrorToast) {
        toast.error('Gagal memuat daftar masuk');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      load();
    }
  }, [token]);

  const openReview = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeReview = () => {
    setModalOpen(false);
    setSelected(null);
  };

  return (
    <div className="daftar-page">
      <div className="daftar-card">
        <div className="daftar-header">
          <div>
            <h2>Daftar Masuk</h2>
            <p>Kelola dan tinjau pengajuan judul dari mahasiswa.</p>
          </div>

          <div className="daftar-count">
            {items.length} Pengajuan
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            Memuat daftar pengajuan...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📥</div>
            <h3>Tidak ada pengajuan</h3>
            <p>
              Pengajuan mahasiswa akan muncul di halaman ini setelah mereka
              mengirimkan judul.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="daftar-list">
            {items.map((item, index) => (
              <div className="daftar-item" key={item.id}>
                <div className="daftar-number">
                  {index + 1}
                </div>

                <div className="daftar-content">
                  <div className="daftar-top">
                    <div>
                      <h3>{item.judul || '-'}</h3>

                      <div className="daftar-meta">
                        <span>Mahasiswa: {item.mahasiswa?.nama || item.student_id || '-'}</span>
                        <span>Tanggal: {formatTanggal(item.created_at)}</span>
                      </div>
                    </div>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status || 'Tidak diketahui'}
                    </span>
                  </div>

                  {item.ringkasan && (
                    <p className="daftar-ringkasan">
                      {item.ringkasan}
                    </p>
                  )}

                  <div className="daftar-actions">
                    <button
                      type="button"
                      onClick={() => openReview(item)}
                    >
                      Tinjau Pengajuan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ReviewModal
          open={modalOpen}
          onClose={closeReview}
          submission={selected}
          onSubmitted={load}
        />
      </div>
    </div>
  );
}