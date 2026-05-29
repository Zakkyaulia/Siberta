import React from 'react';
import {
  FileText,
  Bell,
  Lightbulb,
  CheckCircle2,
  Clock,
  BookOpen,
  Send,
  History,
  User,
  ArrowRight,
} from 'lucide-react';
import './MahasiswaDashboard.css';

export default function MahasiswaDashboard() {
  const stats = [
    {
      title: 'Status Pengajuan',
      value: 'Draft',
      desc: 'Judul belum masuk tahap review',
      icon: FileText,
      type: 'blue',
    },
    {
      title: 'Notifikasi',
      value: '2',
      desc: 'Informasi perlu diperiksa',
      icon: Bell,
      type: 'yellow',
    },
    {
      title: 'Saran Judul',
      value: '5',
      desc: 'Rekomendasi topik tersedia',
      icon: Lightbulb,
      type: 'green',
    },
  ];

  const activities = [
    {
      title: 'Pengajuan judul masih berstatus draft',
      desc: 'Lengkapi data pengajuan sebelum dikirim untuk ditinjau dosen.',
      time: 'Hari ini',
      icon: Clock,
    },
    {
      title: 'Lengkapi ringkasan judul',
      desc: 'Ringkasan membantu dosen memahami arah penelitian yang diajukan.',
      time: 'Perlu tindakan',
      icon: FileText,
    },
  ];

  const suggestions = [
    'Sistem Informasi Booking Jadwal Foto Berbasis Web',
    'Analisis Kemiripan Topik Tugas Akhir Menggunakan SBERT',
    'Sistem Rekomendasi Judul Tugas Akhir Berbasis Machine Learning',
  ];

  return (
    <div className="mhs-page">
      <div className="mhs-hero">
        <div>
          <span className="mhs-badge">Dashboard Mahasiswa</span>
          <h2>Selamat Datang</h2>
          <p>
            Pantau status pengajuan judul, lihat notifikasi, dan cek saran topik
            tugas akhir yang dapat membantu proses pengajuan.
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
            <button type="button">
              <Send size={16} />
              Ajukan Judul
            </button>

            <button type="button" className="secondary">
              <History size={16} />
              Lihat Riwayat
            </button>
          </div>
        </div>

        <div className="mhs-side-card">
          <div className="mhs-section-header">
            <div>
              <h3>Notifikasi</h3>
              <p>Informasi terbaru untuk mahasiswa.</p>
            </div>
          </div>

          <div className="activity-list">
            {activities.map((item, index) => {
              const Icon = item.icon;

              return (
                <div className="activity-item" key={index}>
                  <div className="activity-icon">
                    <Icon size={16} />
                  </div>

                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                    <span>{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mhs-bottom-grid">
        <div className="mhs-main-card">
          <div className="mhs-section-header">
            <div>
              <h3>Saran Judul</h3>
              <p>Beberapa contoh topik yang dapat dijadikan inspirasi.</p>
            </div>
          </div>

          <div className="suggestion-list">
            {suggestions.map((title, index) => (
              <div className="suggestion-item" key={index}>
                <div className="suggestion-number">
                  {index + 1}
                </div>

                <div>
                  <h4>{title}</h4>
                  <p>Topik dapat disesuaikan kembali dengan studi kasus penelitian.</p>
                </div>

                <ArrowRight size={18} />
              </div>
            ))}
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

          <button type="button">
            <CheckCircle2 size={16} />
            Cek Profil
          </button>
        </div>
      </div>
    </div>
  );
}