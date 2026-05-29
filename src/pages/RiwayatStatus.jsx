import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import './RiwayatStatus.css';

function EditPengajuanModal({ open, onClose, submission, dosen, onSaved }) {
  const [judul, setJudul] = useState('');
  const [abstract, setAbstract] = useState('');
  const [pembimbing1, setPembimbing1] = useState('');
  const [pembimbing2, setPembimbing2] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (submission) {
      setJudul(submission.judul || '');
      setAbstract(submission.abstract || '');
      setPembimbing1(submission.pembimbing1_id || '');
      setPembimbing2(submission.pembimbing2_id || '');
    }
  }, [submission]);

  useEffect(() => {
    if (!open) {
      setSaving(false);
    }
  }, [open]);

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

    setSaving(true);

    try {
      await api.put(`/api/pengajuan/${submission.id}`, {
        judul,
        abstract,
        pembimbing1_id: pembimbing1 || null,
        pembimbing2_id: pembimbing2 || null,
      });

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
            <p>Perbarui data judul kapan saja sesuai kebutuhan.</p>
          </div>
          <button type="button" className="riwayat-modal-close" onClick={onClose}>
            ×
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
                <option value="">-- Pilih Pembimbing --</option>
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
                <option value="">-- Pilih Pembimbing Opsional --</option>
                {dosen.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.username})
                  </option>
                ))}
              </select>
            </div>
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
    if (value === 'diajukan') return 'status-diajukan';
    if (value === 'disetujui' || value === 'setuju') return 'status-disetujui';
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
    if (value === 'ditolak' || value === 'tolak') return 'Ditolak';
    if (value === 'draft') return 'Draft';
    if (value === 'diajukan') return 'Diajukan';
    if (value === 'revisi') return 'Revisi';

    return status || 'Tidak diketahui';
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
        await Swal.fire({
          icon: 'error',
          title: 'Gagal memuat riwayat',
          text: 'Coba muat ulang halaman atau periksa koneksi backend.',
          confirmButtonText: 'Tutup',
        });
      } finally {
        setLoading(false);
      }
    };

    const loadDosen = async () => {
      const pickDosenFromResponse = (payload) => {
        const list = Array.isArray(payload?.data) ? payload.data : [];

        return list.filter(
          (u) => (u?.role || '').toLowerCase() === 'dosen'
        );
      };

      const endpoints = [
        '/api/auth/dosen',
        '/api/dosen',
        '/api/users/dosen',
        '/api/admin/users',
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          const list = pickDosenFromResponse(res.data);

          if (list.length > 0) {
            setDosen(list);
            return;
          }
        } catch (err) {
          console.warn(
            `Gagal ambil dosen dari ${endpoint}`,
            err?.response?.status || err?.message
          );
        }
      }

      setDosen([]);
    };

    if (token) {
      load();
      loadDosen();
    }
  }, [token]);

  const canModify = () => true;

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

      const res = await api.get('/api/pengajuan');
      setItems(res.data.data || []);
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
                      {formatStatusLabel(it.status)}
                    </span>
                  </div>

                  {it.ringkasan && (
                    <p className="riwayat-ringkasan">
                      {it.ringkasan}
                    </p>
                  )}

                  {!it.ringkasan && it.abstract && (
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

                  <div className="riwayat-meta">
                    <span className="riwayat-date">📅 {formatTanggal(it.created_at)}</span>
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
        open={modalOpen}
        onClose={closeEdit}
        submission={selected}
        dosen={dosen}
        onSaved={async () => {
          setAuthToken(token);
          const res = await api.get('/api/pengajuan');
          setItems(res.data.data || []);
        }}
      />
    </div>
  );
}