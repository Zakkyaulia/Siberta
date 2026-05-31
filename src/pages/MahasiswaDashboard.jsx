import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  BookOpen,
  Send,
  History,
  User,
} from 'lucide-react';
import './MahasiswaDashboard.css';

export default function MahasiswaDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Status Pengajuan',
      value: 'Draft',
      desc: 'Judul belum masuk tahap review',
      icon: FileText,
      type: 'blue',
    },
  ];

  return (
    <div className="mhs-page">
      <div className="mhs-hero">
        <div>
          <span className="mhs-badge">Dashboard Mahasiswa</span>
          <h2>Selamat Datang</h2>
          <p>
            Pantau status pengajuan judul, cek progres, dan kelola data
            pengajuan agar prosesnya berjalan lebih lancar.
          </p>
        </div>

        <div className="mhs-hero-icon">
          <BookOpen size={48} />
        </div>
      </div>

      <div className="mhs-stats-grid">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div className="mhs-stat-card" key={index}>
              <div className={`mhs-stat-icon ${item.type}`}>
                <Icon size={22} />
              </div>

              <div>
                <p>{item.title}</p>
                <h3>{item.value}</h3>
                <span>{item.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mhs-content-grid">
        <div className="mhs-main-card">
          <div className="mhs-section-header">
            <div>
              <h3>Ringkasan Pengajuan</h3>
              <p>Status terakhir dari pengajuan judul tugas akhir.</p>
            </div>

            <span className="status-badge status-draft">
              Draft
            </span>
          </div>

          <div className="submission-box">
            <div className="submission-icon">
              <FileText size={24} />
            </div>

            <div className="submission-info">
              <h4>Belum ada pengajuan aktif yang dikirim</h4>
              <p>
                Pengajuan masih dapat dilengkapi terlebih dahulu sebelum masuk ke
                proses review oleh dosen.
              </p>
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Progress Pengajuan</span>
              <strong>25%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '25%' }} />
            </div>

            <div className="progress-steps">
              <div className="step done">
                <span></span>
                Isi Data
              </div>

              <div className="step active">
                <span></span>
                Draft
              </div>

              <div className="step">
                <span></span>
                Review
              </div>

              <div className="step">
                <span></span>
                Selesai
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard/cek-ta')}
            >
              <Send size={16} />
              Cek & Ajukan Judul
            </button>

            <button
              type="button"
              className="secondary"
              onClick={() => navigate('/dashboard/riwayat')}
            >
              <History size={16} />
              Lihat Riwayat
            </button>
          </div>
        </div>
        <div className="mhs-side-card profile-mini-card">
          <div className="profile-mini-icon">
            <User size={26} />
          </div>

          <h3>Lengkapi Profil</h3>
          <p>
            Pastikan data profil mahasiswa sudah lengkap agar proses pengajuan
            lebih mudah diverifikasi.
          </p>

          <button
            type="button"
            onClick={() => navigate('/dashboard/profil')}
          >
            <CheckCircle2 size={16} />
            Cek Profil
          </button>
        </div>
      </div>
    </div>
  );
}
