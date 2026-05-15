import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User, BookOpen, Mail, Hash, Award, GraduationCap,
  MapPin, Phone, Calendar, CheckCircle2, Edit2
} from 'lucide-react';
import './ProfilPage.css';

const INFO_FIELDS = [
  { icon: Hash,          label: 'NIM',                  key: 'nim' },
  { icon: BookOpen,      label: 'Program Studi',         key: 'prodi' },
  { icon: GraduationCap, label: 'Angkatan',              key: 'angkatan' },
  { icon: Mail,          label: 'Email Institusi',       key: 'email' },
  { icon: Award,         label: 'Dosen Pembimbing',      key: 'pembimbing' },
  { icon: CheckCircle2,  label: 'Status Akademik',       key: 'status' },
];

const STATS = [
  { label: 'Semester', value: '6', sub: 'Berjalan' },
  { label: 'SKS Lulus', value: '112', sub: 'dari 144 SKS' },
  { label: 'IPK', value: '3.72', sub: 'Cumlaude Track' },
  { label: 'Status TA', value: 'Proposal', sub: 'Disetujui' },
];

export default function ProfilPage() {
  const { user } = useAuth();
  const role = (user?.role || 'mahasiswa').toLowerCase();
  const isMahasiswa = role === 'mahasiswa';
  const isDosen = role === 'dosen';
  const isAdmin = role === 'departemen' || role === 'admin';

  // Konten untuk Dosen dan Admin
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
              <div className="profil-avatar">{user?.avatar || user?.nama?.charAt(0).toUpperCase()}</div>
              <div className="profil-avatar-badge">
                <CheckCircle2 size={14} />
              </div>
            </div>
            <div className="profil-hero-info">
              <h2 className="profil-name">{user?.nama}</h2>
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
              <p className="profil-nim">ID: {user?.username}</p>
            </div>
            <button className="btn btn-ghost profil-edit-btn">
              <Edit2 size={15} />
              Edit Profil
            </button>
          </div>
        </div>

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
                <div className="info-field-icon"><User size={15} /></div>
                <div className="info-field-content">
                  <span className="info-field-label">Nama Lengkap</span>
                  <span className="info-field-value">{user?.nama}</span>
                </div>
              </div>
              <div className="info-field">
                <div className="info-field-icon"><Mail size={15} /></div>
                <div className="info-field-content">
                  <span className="info-field-label">Email</span>
                  <span className="info-field-value">{user?.email || '-'}</span>
                </div>
              </div>
              <div className="info-field">
                <div className="info-field-icon"><CheckCircle2 size={15} /></div>
                <div className="info-field-content">
                  <span className="info-field-label">Role</span>
                  <span className="info-field-value">{isDosen ? 'Dosen Pembimbing' : 'Administrator'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Konten untuk Mahasiswa (original)
  return (
    <div className="profil-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Profil Mahasiswa</h1>
          <p className="page-subtitle">Informasi data diri dan akademik Anda</p>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="profil-hero card">
        <div className="profil-hero-bg" />
        <div className="profil-hero-content">
          <div className="profil-avatar-wrap">
            <div className="profil-avatar">{user.avatar}</div>
            <div className="profil-avatar-badge">
              <CheckCircle2 size={14} />
            </div>
          </div>

          <div className="profil-hero-info">
            <h2 className="profil-name">{user.nama}</h2>
            <div className="profil-meta">
              <span className="badge badge-sky">
                <GraduationCap size={12} />
                {user.prodi}
              </span>
              <span className="badge badge-green">
                <CheckCircle2 size={12} />
                {user.status}
              </span>
            </div>
            <p className="profil-nim">NIM: {user.nim}</p>
          </div>

          <button className="btn btn-ghost profil-edit-btn" id="edit-profil-btn">
            <Edit2 size={15} />
            Edit Profil
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        {STATS.map((s, i) => (
          <div
            className="stat-card card"
            key={i}
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Info Grid */}
      <div className="info-grid">
        <div className="info-section card">
          <div className="section-header">
            <div className="section-icon">
              <User size={17} />
            </div>
            <h3>Data Akademik</h3>
          </div>

          <div className="info-fields">
            {INFO_FIELDS.map(({ icon: Icon, label, key }, i) => (
              <div className="info-field" key={i}>
                <div className="info-field-icon">
                  <Icon size={15} />
                </div>
                <div className="info-field-content">
                  <span className="info-field-label">{label}</span>
                  <span className={`info-field-value ${key === 'status' ? 'status-active' : ''}`}>
                    {user[key]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TA Info Card */}
        <div className="ta-card card">
          <div className="section-header">
            <div className="section-icon">
              <BookOpen size={17} />
            </div>
            <h3>Informasi Tugas Akhir</h3>
          </div>

          <div className="ta-proposal">
            <div className="ta-proposal-header">
              <span className="badge badge-sky">Topik Proposal</span>
              <span className="ta-year">2024</span>
            </div>
            <p className="ta-title">
              "Implementasi SBERT dan Cosine Similarity dalam Identifikasi Kemiripan
              Topik Tugas Akhir Mahasiswa Sistem Informasi Universitas Andalas"
            </p>
            <div className="ta-details">
              <div className="ta-detail-item">
                <Award size={14} />
                <span>Dr. Ir. Ahmad Syafii, M.T.</span>
              </div>
              <div className="ta-detail-item">
                <Calendar size={14} />
                <span>Mulai: Februari 2024</span>
              </div>
              <div className="ta-detail-item">
                <MapPin size={14} />
                <span>Lab AI & Data Science</span>
              </div>
            </div>

            <div className="ta-progress-section">
              <div className="ta-progress-header">
                <span>Progress TA</span>
                <span className="ta-progress-pct">45%</span>
              </div>
              <div className="ta-progress-bar-bg">
                <div className="ta-progress-bar-fill" style={{ width: '45%' }} />
              </div>
              <div className="ta-milestones">
                {['Proposal', 'Bab I-III', 'Penelitian', 'Bab IV-V', 'Sidang'].map((m, i) => (
                  <div key={i} className={`milestone ${i < 2 ? 'done' : i === 2 ? 'active' : ''}`}>
                    <div className="milestone-dot" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
