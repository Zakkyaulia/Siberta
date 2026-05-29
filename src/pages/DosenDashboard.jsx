import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  MessageSquareText,
  FileText,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import './DosenDashboard.css';

export default function DosenDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: 'Perlu Ditinjau',
      value: '2',
      desc: 'Pengajuan judul menunggu review',
      icon: ClipboardList,
      type: 'blue',
    },
    {
      title: 'Mahasiswa Bimbingan',
      value: '8',
      desc: 'Mahasiswa aktif dibimbing',
      icon: Users,
      type: 'green',
    },
    {
      title: 'Disetujui',
      value: '5',
      desc: 'Judul sudah disetujui',
      icon: CheckCircle2,
      type: 'purple',
    },
  ];

  const submissions = [
    {
      title: 'Sistem Informasi Booking Jadwal Foto Berbasis Web',
      student: 'Mahasiswa 1',
      status: 'Draft',
      date: '29 Mei 2026',
    },
    {
      title: 'Analisis Kemiripan Topik Tugas Akhir Menggunakan SBERT',
      student: 'Mahasiswa 2',
      status: 'Diajukan',
      date: '29 Mei 2026',
    },
    {
      title: 'Sistem Rekomendasi Judul Tugas Akhir Berbasis Machine Learning',
      student: 'Mahasiswa 3',
      status: 'Revisi',
      date: '28 Mei 2026',
    },
  ];

  const schedules = [
    {
      title: 'Review pengajuan judul',
      time: 'Hari ini',
      desc: 'Cek pengajuan yang masih menunggu keputusan.',
    },
  ];

  const getStatusClass = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'draft') return 'status-draft';
    if (value === 'diajukan') return 'status-diajukan';
    if (value === 'disetujui') return 'status-disetujui';
    if (value === 'revisi') return 'status-revisi';
    if (value === 'ditolak') return 'status-ditolak';

    return 'status-default';
  };

  const goToDaftarMasuk = () => {
    navigate('/dashboard/daftar-masuk');
  };


  return (
    <div className="dosen-page">
      <div className="dosen-hero">
        <div>
          <span className="dosen-badge">Dashboard Dosen</span>
          <h2>Selamat Datang di Area Dosen</h2>
          <p>
            Pantau pengajuan judul mahasiswa, kelola proses review, dan lihat
            ringkasan aktivitas bimbingan dalam satu halaman.
          </p>
        </div>

        <div className="dosen-hero-icon">
          <BookOpen size={48} />
        </div>
      </div>

      <div className="dosen-stats-grid">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div className="dosen-stat-card" key={index}>
              <div className={`dosen-stat-icon ${item.type}`}>
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

      <div className="dosen-content-grid">
        <div className="dosen-main-card">
          <div className="dosen-section-header">
            <div>
              <h3>Pengajuan Terbaru</h3>
              <p>Daftar pengajuan judul yang perlu dipantau oleh dosen.</p>
            </div>

            <button
              type="button"
              className="header-action"
              onClick={goToDaftarMasuk}
            >
              Lihat Semua
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="submission-list">
            {submissions.map((item, index) => (
              <div className="submission-item" key={index}>
                <div className="submission-number">
                  {index + 1}
                </div>

                <div className="submission-content">
                  <div className="submission-top">
                    <div>
                      <h4>{item.title}</h4>
                      <p>
                        {item.student} • {item.date}
                      </p>
                    </div>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="review-button"
                  onClick={goToDaftarMasuk}
                >
                  Tinjau
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="dosen-side-card">
          <div className="dosen-section-header">
            <div>
              <h3>Agenda Dosen</h3>
              <p>Ringkasan aktivitas yang perlu diperhatikan.</p>
            </div>
          </div>

          <div className="agenda-list">
            {schedules.map((item, index) => (
              <div className="agenda-item" key={index}>
                <div className="agenda-icon">
                  {index === 0 ? <Clock size={16} /> : <CalendarDays size={16} />}
                </div>

                <div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                  <span>{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dosen-bottom-grid">
        <div className="quick-card">
          <div className="quick-icon">
            <ClipboardList size={24} />
          </div>

          <div>
            <h3>Daftar Masuk</h3>
            <p>
              Tinjau pengajuan judul mahasiswa dan berikan keputusan berupa
              setuju, revisi, atau tolak.
            </p>
          </div>

          <button
            type="button"
            onClick={goToDaftarMasuk}
          >
            Buka Daftar Masuk
          </button>
        </div>

        <div className="quick-card">
          <div className="quick-icon">
            <FileText size={24} />
          </div>

          <div>
            <h3>Dokumen Review</h3>
            <p>
              Periksa ringkasan dan file pendukung dari pengajuan mahasiswa.
            </p>
          </div>

          <button
            type="button"
            className="secondary"
            onClick={goToDaftarMasuk}
          >
            Lihat Dokumen
          </button>
        </div>
      </div>
    </div>
  );
}