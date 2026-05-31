import React, { useCallback, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import {
  Download,
  FileText,
  Layers,
  Search,
  Upload,
  Users,
} from 'lucide-react';
import './RiwayatStatus.css';

const TEMA_OPTIONS = [
  { value: 'EA', label: 'EA (System Development)' },
  { value: 'BI', label: 'BI (Business Intelligence)' },
  { value: 'ML', label: 'ML (Machine Learning)' },
  { value: 'SPK', label: 'SPK (Sistem Penunjang Keputusan)' },
  { value: 'ERP', label: 'ERP' },
];

const TEMA_LABEL = TEMA_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

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

function AdvisorStatus({ submission }) {
  const reviews = submission?.advisor_reviews || {};

  return (
    <div className="riwayat-advisors">
      {['pembimbing1', 'pembimbing2'].map((key) => {
        const item = reviews[key];
        if (!item) return null;

        return (
          <div key={key} className="riwayat-advisor">
            <div>
              <span>{item.label}</span>
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

function FileList({ submission, onDownloadFile }) {
  const files = getAllFiles(submission);

  if (files.length === 0) {
    return (
      <div className="riwayat-file-empty">
        <FileText size={15} />
        Tidak ada file pendukung.
      </div>
    );
  }

  return (
    <div className="riwayat-file-list">
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
  );
}

function EditPengajuanModal({ open, onClose, submission, dosen, onSaved, onDownloadFile }) {
  const [judul, setJudul] = useState(() => submission?.judul || '');
  const [abstract, setAbstract] = useState(() => submission?.abstract || '');
  const [tema, setTema] = useState(() => submission?.tema || '');
  const [pembimbing1, setPembimbing1] = useState(() => submission?.pembimbing1_id || '');
  const [pembimbing2, setPembimbing2] = useState(() => submission?.pembimbing2_id || '');
  const [newFile, setNewFile] = useState(null);
  const [saving, setSaving] = useState(false);

  if (!open || !submission) return null;

  const submit = async (event) => {
    event.preventDefault();

    if (!judul.trim()) {
      await Swal.fire({
        icon: 'warning',
        title: 'Judul wajib diisi',
        text: 'Lengkapi judul sebelum menyimpan perubahan.',
        confirmButtonText: 'Mengerti',
      });
      return;
    }

    if (!tema) {
      await Swal.fire({
        icon: 'warning',
        title: 'Tema wajib dipilih',
        text: 'Pilih salah satu tema TA sebelum menyimpan perubahan.',
        confirmButtonText: 'Mengerti',
      });
      return;
    }

    if (pembimbing2 && String(pembimbing1) === String(pembimbing2)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Pembimbing tidak valid',
        text: 'Pembimbing 1 dan pembimbing 2 tidak boleh sama.',
        confirmButtonText: 'Mengerti',
      });
      return;
    }

    setSaving(true);

    try {
      await api.put(`/api/pengajuan/${submission.id}`, {
        judul,
        abstract,
        tema,
        pembimbing1_id: pembimbing1 || null,
        pembimbing2_id: pembimbing2 || null,
      });

      if (newFile) {
        const formData = new FormData();
        formData.append('file_pendukung', newFile);
        await api.post(`/api/pengajuan/${submission.id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      await Swal.fire({
        icon: 'success',
        title: 'Pengajuan diperbarui',
        text: 'Perubahan berhasil disimpan.',
        confirmButtonText: 'OK',
      });

      if (onSaved) {
        await onSaved();
      }
      onClose();
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      await Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui pengajuan',
        text: serverMsg || 'Terjadi kesalahan saat menyimpan perubahan.',
        confirmButtonText: 'Tutup',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="riwayat-modal-backdrop" onClick={onClose}>
      <div className="riwayat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="riwayat-modal-header">
          <div>
            <h3>Edit Pengajuan</h3>
            <p>Perbarui data pengajuan dan lihat file pendukung yang sudah diunggah.</p>
          </div>
          <button type="button" className="riwayat-modal-close" onClick={onClose}>
            x
          </button>
        </div>

        <form className="riwayat-modal-form" onSubmit={submit}>
          <div className="riwayat-form-group">
            <label htmlFor="edit-judul">Judul</label>
            <input
              id="edit-judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul tugas akhir"
              required
            />
          </div>

          <div className="riwayat-form-group">
            <label htmlFor="edit-tema">Tema TA</label>
            <select
              id="edit-tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            >
              <option value="">Pilih tema TA</option>
              {TEMA_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="riwayat-form-group">
            <label htmlFor="edit-abstract">Ringkasan</label>
            <textarea
              id="edit-abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Tuliskan ringkasan singkat"
              rows="4"
            />
          </div>

          <div className="riwayat-form-row">
            <div className="riwayat-form-group">
              <label htmlFor="edit-pembimbing1">Pembimbing 1</label>
              <select
                id="edit-pembimbing1"
                value={pembimbing1}
                onChange={(e) => setPembimbing1(e.target.value)}
              >
                <option value="">Pilih pembimbing</option>
                {dosen.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="riwayat-form-group">
              <label htmlFor="edit-pembimbing2">Pembimbing 2</label>
              <select
                id="edit-pembimbing2"
                value={pembimbing2}
                onChange={(e) => setPembimbing2(e.target.value)}
              >
                <option value="">Opsional</option>
                {dosen.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="riwayat-form-group">
            <label>File Pendukung Saat Ini</label>
            <FileList submission={submission} onDownloadFile={onDownloadFile} />
          </div>

          <div className="riwayat-form-group">
            <label htmlFor="edit-file">Ganti atau Tambah File</label>
            <div className="riwayat-file-input">
              <Upload size={16} />
              <input
                id="edit-file"
                type="file"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
              />
            </div>
            <small>{newFile ? `File baru: ${newFile.name}` : 'Opsional. File baru akan ditambahkan ke pengajuan ini.'}</small>
          </div>

          <div className="riwayat-modal-actions">
            <button type="button" className="riwayat-btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="riwayat-btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RiwayatStatus() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dosen, setDosen] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

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

  const formatStatusLabel = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'disetujui' || value === 'setuju') return 'Disetujui';
    if (value === 'validated') return 'Tersinkron';
    if (value === 'ditolak' || value === 'tolak') return 'Ditolak';
    if (value === 'draft') return 'Draft';
    if (value === 'diajukan') return 'Diajukan';
    if (value === 'menunggu_pembimbing') return 'Menunggu Pembimbing';
    if (value === 'revisi') return 'Revisi';

    return status || 'Tidak diketahui';
  };

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/pengajuan');
      setItems(res.data.data || []);
    } catch (err) {
      console.error(err);
      await Swal.fire({
        icon: 'error',
        title: 'Gagal memuat riwayat',
        text: 'Coba muat ulang halaman atau periksa koneksi backend.',
        confirmButtonText: 'Tutup',
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadDosen = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/dosen');
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setDosen(list.filter((u) => (u?.role || '').toLowerCase() === 'dosen'));
    } catch (err) {
      console.warn('Gagal ambil dosen', err?.response?.status || err?.message);
      setDosen([]);
    }
  }, []);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      const timer = window.setTimeout(() => {
        loadItems();
        loadDosen();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [loadDosen, loadItems, token]);

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
      await Swal.fire({
        icon: 'error',
        title: 'Gagal mengunduh file',
        text: 'File tidak dapat diunduh saat ini.',
        confirmButtonText: 'Tutup',
      });
    }
  };

  const canModify = (status) => {
    const value = (status || '').toLowerCase();
    return value === 'draft' || value === 'revisi';
  };

  const openEdit = (item) => {
    setSelected(item);
    setModalOpen(true);
  };

  const closeEdit = () => {
    setModalOpen(false);
    setSelected(null);
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus pengajuan ini?',
      text: 'Tindakan ini tidak dapat dibatalkan.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setAuthToken(token);
      await api.delete(`/api/pengajuan/${item.id}`);
      await Swal.fire({
        icon: 'success',
        title: 'Pengajuan dihapus',
        text: 'Data pengajuan sudah dihapus.',
        confirmButtonText: 'OK',
      });

      await loadItems();
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      await Swal.fire({
        icon: 'error',
        title: 'Gagal menghapus pengajuan',
        text: serverMsg || 'Terjadi kesalahan saat menghapus data.',
        confirmButtonText: 'Tutup',
      });
    }
  };

  return (
    <div className="riwayat-page">
      <div className="riwayat-card">
        <div className="riwayat-header">
          <div>
            <h2>Riwayat Status Pengajuan</h2>
            <p>Pantau status judul, keputusan pembimbing, skor kemiripan, dan file pendukung.</p>
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
            <div className="empty-icon"><FileText size={34} /></div>
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
                      {formatStatusLabel(it.status)}
                    </span>
                  </div>

                  <div className="riwayat-detail-grid">
                    <div>
                      <Layers size={14} />
                      <span>Tema</span>
                      <strong>{TEMA_LABEL[it.tema] || it.tema || '-'}</strong>
                    </div>
                    <div>
                      <Search size={14} />
                      <span>Skor Kemiripan</span>
                      <strong>{it.similarity_score !== null && it.similarity_score !== undefined ? `${it.similarity_score}%` : '-'}</strong>
                    </div>
                  </div>

                  {it.abstract && (
                    <p className="riwayat-ringkasan">
                      {it.abstract}
                    </p>
                  )}

                  {it.last_review_comment && (
                    <div className="riwayat-catatan">
                      <span className="riwayat-catatan-label">Catatan Dosen</span>
                      <p>{it.last_review_comment}</p>
                    </div>
                  )}

                  <div className="riwayat-section-label">
                    <Users size={14} />
                    Status Pembimbing
                  </div>
                  <AdvisorStatus submission={it} />

                  <div className="riwayat-section-label">
                    <FileText size={14} />
                    File Pendukung
                  </div>
                  <FileList submission={it} onDownloadFile={downloadFile} />

                  <div className="riwayat-meta">
                    <span className="riwayat-date">{formatTanggal(it.created_at)}</span>
                  </div>

                  <div className="riwayat-actions">
                    <button
                      type="button"
                      className="riwayat-btn riwayat-btn-edit"
                      onClick={() => openEdit(it)}
                      disabled={!canModify(it.status)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="riwayat-btn riwayat-btn-delete"
                      onClick={() => handleDelete(it)}
                      disabled={!canModify(it.status)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditPengajuanModal
        key={selected?.id || 'empty-edit'}
        open={modalOpen}
        onClose={closeEdit}
        submission={selected}
        dosen={dosen}
        onDownloadFile={downloadFile}
        onSaved={loadItems}
      />
    </div>
  );
}
