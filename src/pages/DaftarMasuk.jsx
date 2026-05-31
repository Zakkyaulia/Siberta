import React, { useCallback, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Download,
  FileText,
  Layers,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import './DaftarMasuk.css';

const TEMA_LABEL = {
  EA: 'EA (System Development)',
  BI: 'BI (Business Intelligence)',
  ML: 'ML (Machine Learning)',
  SPK: 'SPK (Sistem Penunjang Keputusan)',
  ERP: 'ERP',
};

const formatDecision = (decision) => {
  const value = (decision || '').toLowerCase();

  if (value === 'setuju') return 'Setuju';
  if (value === 'revisi') return 'Revisi';
  if (value === 'tolak') return 'Tolak';

  return 'Menunggu';
};

const getAllFiles = (submission) => {
  const legacy = submission?.legacy_file
    ? [{ ...submission.legacy_file, is_legacy: true }]
    : [];

  return legacy;
};

function AdvisorReviewList({ submission }) {
  const reviews = submission?.advisor_reviews || {};
  const currentPosition = submission?.current_user_position;

  return (
    <div className="advisor-review-list">
      {['pembimbing1', 'pembimbing2'].map((key) => {
        const item = reviews[key];
        if (!item) return null;

        const isCurrent = currentPosition === item.label;

        return (
          <div key={key} className={`advisor-review-item ${isCurrent ? 'current' : ''}`}>
            <div>
              <span>{item.label}{isCurrent ? ' (Anda)' : ''}</span>
              <strong>{item.nama || item.username || '-'}</strong>
            </div>
            <span className={`decision-chip decision-${item.status || 'menunggu'}`}>
              {formatDecision(item.decision)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewModal({ open, onClose, submission, onSubmitted, onDownloadFile }) {
  const [decision, setDecision] = useState('setuju');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

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

  const isApprove = decision === 'setuju';
  const files = getAllFiles(submission);

  const handleDecisionChange = (event) => {
    const value = event.target.value;
    setDecision(value);

    if (value === 'setuju') {
      setComment('');
    }
  };

  const submit = async () => {
    if (!isApprove && !comment.trim()) {
      toast.error('Catatan wajib diisi untuk keputusan revisi atau tolak.');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/api/reviews/${submission.id}`, {
        decision,
        comment: isApprove ? null : comment,
      });

      toast.success('Keputusan tersimpan.');

      if (onSubmitted) {
        await onSubmitted(false);
      }

      onClose();
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      toast.error(serverMsg || 'Gagal menyimpan keputusan.');
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

          <button type="button" className="review-close" onClick={onClose}>
            x
          </button>
        </div>

        <div className="review-info review-info-grid">
          <div>
            <span>Mahasiswa</span>
            <strong>{submission.mahasiswa?.nama || submission.student_id || '-'}</strong>
          </div>
          <div>
            <span>Posisi Anda</span>
            <strong>{submission.current_user_position || '-'}</strong>
          </div>
          <div>
            <span>Tema TA</span>
            <strong>{TEMA_LABEL[submission.tema] || submission.tema || '-'}</strong>
          </div>
          <div>
            <span>Skor Kemiripan</span>
            <strong>{submission.similarity_score !== null && submission.similarity_score !== undefined ? `${submission.similarity_score}%` : '-'}</strong>
          </div>
        </div>

        <div className="review-section">
          <div className="review-section-title">
            <Users size={16} />
            Pembimbing
          </div>
          <AdvisorReviewList submission={submission} />
        </div>

        <div className="review-section">
          <div className="review-section-title">
            <FileText size={16} />
            File Pendukung
          </div>
          {files.length === 0 ? (
            <p className="review-muted">Tidak ada file pendukung.</p>
          ) : (
            <div className="review-file-list">
              {files.map((file, index) => (
                <button
                  type="button"
                  key={`${file.filename}-${index}`}
                  onClick={() => onDownloadFile(file, submission.id)}
                >
                  <Download size={14} />
                  {file.filename || `File ${index + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="review-form-group">
          <label htmlFor="decision">Keputusan</label>
          <select
            id="decision"
            value={decision}
            onChange={handleDecisionChange}
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
            placeholder={isApprove ? 'Catatan tidak diperlukan untuk keputusan setuju' : 'Tuliskan catatan atau arahan untuk mahasiswa'}
            rows="5"
            disabled={isApprove}
          />
          {isApprove && <small>Field catatan nonaktif karena keputusan disetujui.</small>}
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
    if (value === 'diajukan' || value === 'menunggu_pembimbing') return 'status-diajukan';
    if (value === 'disetujui' || value === 'setuju') return 'status-disetujui';
    if (value === 'validated') return 'status-disetujui';
    if (value === 'ditolak' || value === 'tolak') return 'status-ditolak';
    if (value === 'revisi') return 'status-revisi';

    return 'status-default';
  };

  const formatStatusLabel = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'menunggu_pembimbing') return 'Menunggu Pembimbing';
    if (value === 'setuju') return 'Disetujui';
    if (value === 'validated') return 'Tersinkron';
    if (value === 'ditolak') return 'Ditolak';
    if (value === 'revisi') return 'Revisi';
    if (value === 'diajukan') return 'Diajukan';

    return status || 'Tidak diketahui';
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

  const load = useCallback(async (showErrorToast = true) => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/pengajuan');
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);

      if (showErrorToast) {
        toast.error('Gagal memuat daftar masuk.');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const timer = window.setTimeout(() => {
        load();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [load, token]);

  const downloadFile = async (file, submissionId) => {
    try {
      const endpoint = `/api/pengajuan/${submissionId}/file-pendukung/download`;
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.filename || 'file-pendukung');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengunduh file.');
    }
  };

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
            <p>Tinjau pengajuan judul sesuai posisi pembimbing Anda.</p>
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
            <div className="empty-icon"><FileText size={34} /></div>
            <h3>Tidak ada pengajuan</h3>
            <p>Pengajuan mahasiswa akan muncul setelah mereka mengirimkan judul kepada Anda.</p>
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
                        <span><UserCheck size={13} /> Mahasiswa: {item.mahasiswa?.nama || item.student_id || '-'}</span>
                        <span><Layers size={13} /> Tema: {TEMA_LABEL[item.tema] || item.tema || '-'}</span>
                        <span><Search size={13} /> Skor: {item.similarity_score !== null && item.similarity_score !== undefined ? `${item.similarity_score}%` : '-'}</span>
                        <span>Tanggal: {formatTanggal(item.created_at)}</span>
                      </div>
                    </div>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {formatStatusLabel(item.status)}
                    </span>
                  </div>

                  {item.abstract && (
                    <p className="daftar-ringkasan">
                      {item.abstract}
                    </p>
                  )}

                  <AdvisorReviewList submission={item} />

                  <div className="daftar-actions">
                    <button type="button" onClick={() => openReview(item)}>
                      Tinjau Pengajuan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ReviewModal
          key={selected?.id || 'empty-review'}
          open={modalOpen}
          onClose={closeReview}
          submission={selected}
          onSubmitted={load}
          onDownloadFile={downloadFile}
        />
      </div>
    </div>
  );
}
