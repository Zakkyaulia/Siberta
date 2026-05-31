import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  BookOpen,
  Send,
  History,
  User,
} from 'lucide-react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MahasiswaDashboard.css';

export default function MahasiswaDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!token) return;

      setLoading(true);
      setError('');

      try {
        setAuthToken(token);
        const res = await api.get('/api/pengajuan');
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setSubmissions(list);
      } catch (err) {
        console.error(err);
        const serverMsg = err?.response?.data?.pesan || err?.response?.data?.message;
        setError(serverMsg || 'Gagal memuat data pengajuan.');
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, [token]);

  const latestSubmission = useMemo(() => {
    if (submissions.length === 0) return null;
    return [...submissions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      [0];
  }, [submissions]);

  const statusMeta = useMemo(() => {
    if (loading) {
      return {
        label: 'Memuat',
        desc: 'Sedang mengambil data pengajuan.',
        className: 'status-draft',
        stepIndex: 0,
        percent: 0,
      };
    }

    if (error) {
      return {
        label: 'Error',
        desc: error,
        className: 'status-ditolak',
        stepIndex: 0,
        percent: 0,
      };
    }

    if (!latestSubmission) {
      return {
        label: 'Belum Ada',
        desc: 'Belum ada pengajuan yang dikirim.',
        className: 'status-draft',
        stepIndex: 0,
        percent: 0,
      };
    }

    const statusValue = (latestSubmission.status || '').toLowerCase();

    if (statusValue === 'draft') {
      return {
        label: 'Draft',
        desc: 'Judul belum masuk tahap review',
        className: 'status-draft',
        stepIndex: 1,
        percent: 25,
      };
    }

    if (statusValue === 'diajukan' || statusValue === 'menunggu_pembimbing') {
      return {
        label: 'Diajukan',
        desc: 'Menunggu review dosen pembimbing',
        className: 'status-diajukan',
        stepIndex: 2,
        percent: 60,
      };
    }

    if (statusValue === 'revisi') {
      return {
        label: 'Revisi',
        desc: 'Perlu perbaikan dari mahasiswa',
        className: 'status-revisi',
        stepIndex: 2,
        percent: 60,
      };
    }

    if (statusValue === 'ditolak' || statusValue === 'tolak') {
      return {
        label: 'Ditolak',
        desc: 'Pengajuan ditolak oleh pembimbing',
        className: 'status-ditolak',
        stepIndex: 2,
        percent: 60,
      };
    }

    if (statusValue === 'disetujui' || statusValue === 'setuju' || statusValue === 'validated') {
      return {
        label: 'Disetujui',
        desc: 'Pengajuan disetujui pembimbing',
        className: 'status-disetujui',
        stepIndex: 3,
        percent: 100,
      };
    }

    return {
      label: latestSubmission.status || 'Menunggu',
      desc: 'Status pengajuan sedang diproses.',
      className: 'status-diajukan',
      stepIndex: 2,
      percent: 60,
    };
  }, [latestSubmission, loading, error]);

  const stats = useMemo(() => ([
    {
      title: 'Status Pengajuan',
      value: statusMeta.label,
      desc: statusMeta.desc,
      icon: FileText,
      type: statusMeta.className === 'status-ditolak' ? 'yellow' : 'blue',
    },
  ]), [statusMeta]);

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const steps = ['Isi Data', 'Draft', 'Review', 'Selesai'];

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

            <span className={`status-badge ${statusMeta.className}`}>
              {statusMeta.label}
            </span>
          </div>

          <div className="submission-box">
            <div className="submission-icon">
              <FileText size={24} />
            </div>

            <div className="submission-info">
              {loading && (
                <>
                  <h4>Memuat pengajuan...</h4>
                  <p>Sedang mengambil data pengajuan terbaru.</p>
                </>
              )}
              {!loading && error && (
                <>
                  <h4>Gagal memuat pengajuan</h4>
                  <p>{error}</p>
                </>
              )}
              {!loading && !error && !latestSubmission && (
                <>
                  <h4>Belum ada pengajuan aktif yang dikirim</h4>
                  <p>
                    Pengajuan masih dapat dilengkapi terlebih dahulu sebelum masuk ke
                    proses review oleh dosen.
                  </p>
                </>
              )}
              {!loading && !error && latestSubmission && (
                <>
                  <h4>{latestSubmission.judul || 'Judul belum diisi'}</h4>
                  <p>
                    Diajukan pada {formatDate(latestSubmission.created_at)} • Status: {statusMeta.label}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="progress-section">
            <div className="progress-header">
              <span>Progress Pengajuan</span>
              <strong>{statusMeta.percent}%</strong>
            </div>

            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${statusMeta.percent}%` }} />
            </div>

            <div className="progress-steps">
              {steps.map((step, index) => {
                const className = index < statusMeta.stepIndex
                  ? 'step done'
                  : index === statusMeta.stepIndex
                    ? 'step active'
                    : 'step';

                return (
                  <div className={className} key={step}>
                    <span></span>
                    {step}
                  </div>
                );
              })}
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
