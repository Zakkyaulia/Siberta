import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  BookOpen,
  Mail,
  Hash,
  Award,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Edit2,
} from 'lucide-react';
import './ProfilPage.css';

const INFO_FIELDS = [
  {
    icon: Hash,
    label: 'NIM',
    key: 'nim',
  },
  {
    icon: BookOpen,
    label: 'Program Studi',
    key: 'prodi',
  },
  {
    icon: GraduationCap,
    label: 'Angkatan',
    key: 'angkatan',
  },
  {
    icon: Mail,
    label: 'Email Institusi',
    key: 'email',
  },
  {
    icon: Award,
    label: 'Dosen Pembimbing',
    key: 'pembimbing',
  },
  {
    icon: CheckCircle2,
    label: 'Status Akademik',
    key: 'status',
  },
];

const STATS = [
  {
    label: 'Semester',
    value: '6',
    sub: 'Berjalan',
  },
  {
    label: 'SKS Lulus',
    value: '112',
    sub: 'dari 144 SKS',
  },
  {
    label: 'IPK',
    value: '3.72',
    sub: 'Cumlaude Track',
  },
  {
    label: 'Status TA',
    value: 'Proposal',
    sub: 'Disetujui',
  },
];

export default function ProfilPage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [approvedSubmission, setApprovedSubmission] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const role = (user?.role || 'mahasiswa').toLowerCase();

  const isMahasiswa = role === 'mahasiswa';
  const isDosen = role === 'dosen';
  const isAdmin = role === 'departemen' || role === 'admin';

  const emptyForm = useMemo(() => ({
    nama: user?.nama || '',
    username: user?.username || '',
    email: user?.email || '',
    nim: user?.nim || '',
    prodi: user?.prodi || '',
    angkatan: user?.angkatan || '',
    pembimbing: user?.pembimbing || '',
    status: user?.status || '',
    password: '',
  }), [user]);

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isMahasiswa) return;

    const loadApprovedProposal = async () => {
      try {
        setSubmissionLoading(true);
        const response = await api.get('/api/pengajuan');
        const submissions = response.data?.data || [];
        const approved = submissions
          .filter((item) => {
            const status = (item.status || '').toLowerCase();
            return status === 'setuju' || status === 'disetujui';
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setApprovedSubmission(approved[0] || null);
      } catch (err) {
        console.error('Gagal memuat pengajuan:', err);
        setApprovedSubmission(null);
      } finally {
        setSubmissionLoading(false);
      }
    };

    loadApprovedProposal();
  }, [isMahasiswa]);

  const getInitial = (fallback = 'U') => {
    return user?.avatar || user?.nama?.charAt(0)?.toUpperCase() || fallback;
  };

  const openEdit = () => {
    setFormData(emptyForm);
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const baseFields = ['nama', 'username', 'email'];
    const mahasiswaFields = ['nim', 'prodi', 'angkatan', 'pembimbing', 'status'];
    const fields = isMahasiswa ? [...baseFields, ...mahasiswaFields] : baseFields;

    const payload = {};
    fields.forEach((field) => {
      const currentValue = user?.[field] || '';
      if (formData[field] !== currentValue) {
        payload[field] = formData[field];
      }
    });

    if (formData.password.trim()) {
      payload.password = formData.password.trim();
    }

    if (Object.keys(payload).length === 0) {
      setError('Tidak ada perubahan yang disimpan.');
      return;
    }

    try {
      setIsSaving(true);
      const response = await api.put('/api/auth/me', payload);
      updateUser(response.data.user);
      setSuccess('Profil berhasil diperbarui.');
      setIsEditing(false);
    } catch (err) {
      const message = err.message === 'Network Error'
        ? 'Tidak dapat terhubung ke server backend.'
        : (err.response?.data?.pesan || 'Gagal menyimpan perubahan profil.');
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditCard = () => {
    if (!isEditing) return null;

    return (
      <div className="profil-edit card">
        <div className="section-header">
          <div className="section-icon">
            <Edit2 size={17} />
          </div>
          <h3>Edit Profil</h3>
        </div>

        {error && (
          <div className="profil-alert profil-alert-error">{error}</div>
        )}

        {success && (
          <div className="profil-alert profil-alert-success">{success}</div>
        )}

        <form className="profil-edit-form" onSubmit={handleSubmit}>
          <div className="profil-form-row">
            <div className="profil-form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                placeholder="Masukkan nama lengkap"
              />
            </div>

            <div className="profil-form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Masukkan username"
              />
            </div>
          </div>

          <div className="profil-form-row">
            <div className="profil-form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Masukkan email"
              />
            </div>

            <div className="profil-form-group">
              <label>Password Baru</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Kosongkan jika tidak diubah"
              />
            </div>
          </div>

          {isMahasiswa && (
            <>
              <div className="profil-form-row">
                <div className="profil-form-group">
                  <label>NIM</label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    placeholder="Masukkan NIM"
                  />
                </div>

                <div className="profil-form-group">
                  <label>Program Studi</label>
                  <input
                    type="text"
                    name="prodi"
                    value={formData.prodi}
                    onChange={handleChange}
                    placeholder="Contoh: Sistem Informasi"
                  />
                </div>
              </div>

              <div className="profil-form-row">
                <div className="profil-form-group">
                  <label>Angkatan</label>
                  <input
                    type="text"
                    name="angkatan"
                    value={formData.angkatan}
                    onChange={handleChange}
                    placeholder="Contoh: 2022"
                  />
                </div>

                <div className="profil-form-group">
                  <label>Dosen Pembimbing</label>
                  <input
                    type="text"
                    name="pembimbing"
                    value={formData.pembimbing}
                    onChange={handleChange}
                    placeholder="Nama dosen pembimbing"
                  />
                </div>
              </div>

              <div className="profil-form-row">
                <div className="profil-form-group">
                  <label>Status Akademik</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="">Pilih status</option>
                    <option value="Aktif">Aktif</option>
                    <option value="Tidak Aktif">Tidak Aktif</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="profil-form-actions">
            <button type="button" className="btn-secondary" onClick={closeEdit}>
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (isDosen || isAdmin) {
    const roleTitle = isDosen ? 'Dosen' : 'Administrator Departemen';

    const roleSubtitle = isDosen
      ? 'Informasi data diri dan data pembimbing'
      : 'Informasi data diri dan akses administratif';

    return (
      <div className="profil-page fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">Profil {roleTitle}</h1>
            <p className="page-subtitle">{roleSubtitle}</p>
          </div>
        </div>

        <div className="profil-hero card">
          <div className="profil-hero-bg" />

          <div className="profil-hero-content">
            <div className="profil-avatar-wrap">
              <div className="profil-avatar">
                {getInitial(isDosen ? 'D' : 'A')}
              </div>

              <div className="profil-avatar-badge">
                <CheckCircle2 size={14} />
              </div>
            </div>

            <div className="profil-hero-info">
              <h2 className="profil-name">
                {user?.nama || roleTitle}
              </h2>

              <div className="profil-meta">
                <span className="badge badge-sky">
                  <GraduationCap size={12} />
                  {isDosen ? 'Dosen' : 'Admin'}
                </span>

                <span className="badge badge-green">
                  <CheckCircle2 size={12} />
                  Aktif
                </span>
              </div>

              <p className="profil-nim">
                ID: {user?.username || '-'}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-ghost profil-edit-btn"
              onClick={openEdit}
            >
              <Edit2 size={15} />
              Edit Profil
            </button>
          </div>
        </div>

        {renderEditCard()}

        <div className="info-grid">
          <div className="info-section card">
            <div className="section-header">
              <div className="section-icon">
                <User size={17} />
              </div>

              <h3>Informasi {roleTitle}</h3>
            </div>

            <div className="info-fields">
              <div className="info-field">
                <div className="info-field-icon">
                  <User size={15} />
                </div>

                <div className="info-field-content">
                  <span className="info-field-label">Nama Lengkap</span>
                  <span className="info-field-value">
                    {user?.nama || '-'}
                  </span>
                </div>
              </div>

              <div className="info-field">
                <div className="info-field-icon">
                  <Mail size={15} />
                </div>

                <div className="info-field-content">
                  <span className="info-field-label">Email</span>
                  <span className="info-field-value">
                    {user?.email || '-'}
                  </span>
                </div>
              </div>

              <div className="info-field">
                <div className="info-field-icon">
                  <CheckCircle2 size={15} />
                </div>

                <div className="info-field-content">
                  <span className="info-field-label">Role</span>
                  <span className="info-field-value status-active">
                    {isDosen ? 'Dosen Pembimbing' : 'Administrator'}
                  </span>
                </div>
              </div>

              <div className="info-field">
                <div className="info-field-icon">
                  <Hash size={15} />
                </div>

                <div className="info-field-content">
                  <span className="info-field-label">Username</span>
                  <span className="info-field-value">
                    {user?.username || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profil-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Mahasiswa</h1>
          <p className="page-subtitle">
            Informasi data diri dan akademik Anda
          </p>
        </div>
      </div>

      <div className="profil-hero card">
        <div className="profil-hero-bg" />

        <div className="profil-hero-content">
          <div className="profil-avatar-wrap">
            <div className="profil-avatar">
              {getInitial('M')}
            </div>

            <div className="profil-avatar-badge">
              <CheckCircle2 size={14} />
            </div>
          </div>

          <div className="profil-hero-info">
            <h2 className="profil-name">
              {user?.nama || 'Mahasiswa'}
            </h2>

            <div className="profil-meta">
              <span className="badge badge-sky">
                <GraduationCap size={12} />
                {user?.prodi || 'Program Studi'}
              </span>

              <span className="badge badge-green">
                <CheckCircle2 size={12} />
                {user?.status || 'Aktif'}
              </span>
            </div>

            <p className="profil-nim">
              NIM: {user?.nim || '-'}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost profil-edit-btn"
            id="edit-profil-btn"
            onClick={openEdit}
          >
            <Edit2 size={15} />
            Edit Profil
          </button>
        </div>
      </div>

      {renderEditCard()}

      {/* <div className="stats-grid">
        {STATS.map((stat, index) => (
          <div
            className="stat-card card"
            key={index}
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div> */}

      <div className="info-grid">
        <div className="info-section card">
          <div className="section-header">
            <div className="section-icon">
              <User size={17} />
            </div>

            <h3>Data Akademik</h3>
          </div>

          <div className="info-fields">
            {INFO_FIELDS.map(({ icon: Icon, label, key }, index) => (
              <div className="info-field" key={index}>
                <div className="info-field-icon">
                  <Icon size={15} />
                </div>

                <div className="info-field-content">
                  <span className="info-field-label">
                    {label}
                  </span>

                  <span
                    className={`info-field-value ${
                      key === 'status' ? 'status-active' : ''
                    }`}
                  >
                    {user?.[key] || '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ta-card card">
          <div className="section-header">
            <div className="section-icon">
              <BookOpen size={17} />
            </div>

            <h3>Informasi Tugas Akhir</h3>
          </div>

          <div className="ta-proposal">
            <div className="ta-proposal-header">
              <span className="badge badge-sky">
                Topik Proposal
              </span>

              <span className="ta-year">
                {approvedSubmission?.created_at
                  ? new Date(approvedSubmission.created_at).getFullYear()
                  : '-'}
              </span>
            </div>

            <p className="ta-title">
              {submissionLoading && 'Memuat judul proposal...'}
              {!submissionLoading && approvedSubmission?.judul && (
                `"${approvedSubmission.judul}"`
              )}
              {!submissionLoading && !approvedSubmission?.judul && (
                'Belum ada judul proposal yang disetujui pembimbing.'
              )}
            </p>
            {approvedSubmission?.judul && (
              <>
                <div className="ta-details">
                  <div className="ta-detail-item">
                    <Award size={14} />
                    <span>
                      {user?.pembimbing || 'Dosen pembimbing belum diatur'}
                    </span>
                  </div>

                  <div className="ta-detail-item">
                    <Calendar size={14} />
                    <span>
                      Mulai: {approvedSubmission.created_at
                        ? new Date(approvedSubmission.created_at).toLocaleDateString('id-ID', {
                          month: 'long',
                          year: 'numeric',
                        })
                        : '-'}
                    </span>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}