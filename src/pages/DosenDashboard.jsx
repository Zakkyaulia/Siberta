import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  CalendarDays,
} from 'lucide-react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './DosenDashboard.css';

export default function DosenDashboard() {
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

  const getAdvisorKey = (submission) => {
    const position = submission?.current_user_position;
    if (position === 'Pembimbing 1') return 'pembimbing1';
    if (position === 'Pembimbing 2') return 'pembimbing2';
    return null;
  };

  const needsReview = (submission) => {
    const key = getAdvisorKey(submission);
    const review = key ? submission?.advisor_reviews?.[key] : null;
    if (review?.decision) return false;

    const status = (submission?.status || '').toLowerCase();
    return status === 'diajukan' || status === 'menunggu_pembimbing' || status === 'revisi';
  };

  const pendingCount = useMemo(() => submissions.filter(needsReview).length, [submissions]);

  const approvedCount = useMemo(() => submissions.filter((item) => {
    const status = (item?.status || '').toLowerCase();
    return status === 'disetujui' || status === 'setuju' || status === 'validated';
  }).length, [submissions]);

  const uniqueStudents = useMemo(() => {
    const ids = new Set();
    submissions.forEach((item) => {
      const id = item?.student_id || item?.mahasiswa?.id;
      if (id) ids.add(id);
    });
    return ids.size;
  }, [submissions]);

  const stats = useMemo(() => ([
    {
      title: 'Perlu Ditinjau',
      value: String(pendingCount),
      desc: 'Pengajuan judul menunggu review',
      icon: ClipboardList,
      type: 'blue',
    },
    {
      title: 'Mahasiswa Bimbingan',
      value: String(uniqueStudents),
      desc: 'Mahasiswa aktif dibimbing',
      icon: Users,
      type: 'green',
    },
    {
      title: 'Disetujui',
      value: String(approvedCount),
      desc: 'Judul sudah disetujui',
      icon: CheckCircle2,
      type: 'purple',
    },
  ]), [pendingCount, uniqueStudents, approvedCount]);

  const latestSubmissions = useMemo(() => {
    return [...submissions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);
  }, [submissions]);

  const schedules = useMemo(() => {
    if (pendingCount > 0) {
      return [
        {
          title: 'Review pengajuan judul',
          time: 'Hari ini',
          desc: `Ada ${pendingCount} pengajuan menunggu keputusan.`,
        },
      ];
    }

    return [
      {
        title: 'Tidak ada agenda mendesak',
        time: 'Minggu ini',
        desc: 'Belum ada pengajuan yang menunggu keputusan Anda.',
      },
    ];
  }, [pendingCount]);

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

  const formatDate = (dateValue) => {
    if (!dateValue) return '-';
    return new Date(dateValue).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
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
            {loading && (
              <div className="submission-item">
                <div className="submission-number">-</div>
                <div className="submission-content">
                  <div className="submission-top">
                    <div>
                      <h4>Memuat data pengajuan...</h4>
                      <p>Silakan tunggu sebentar.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="submission-item">
                <div className="submission-number">!</div>
                <div className="submission-content">
                  <div className="submission-top">
                    <div>
                      <h4>Gagal memuat pengajuan</h4>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && latestSubmissions.length === 0 && (
              <div className="submission-item">
                <div className="submission-number">0</div>
                <div className="submission-content">
                  <div className="submission-top">
                    <div>
                      <h4>Belum ada pengajuan</h4>
                      <p>Pengajuan mahasiswa akan tampil di sini.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!loading && !error && latestSubmissions.map((item, index) => (
              <div className="submission-item" key={item.id || index}>
                <div className="submission-number">
                  {index + 1}
                </div>

                <div className="submission-content">
                  <div className="submission-top">
                    <div>
                      <h4>{item.judul || '-'}</h4>
                      <p>
                        {item.mahasiswa?.nama || item.mahasiswa?.username || item.student_id || '-'} • {formatDate(item.created_at)}
                      </p>
                    </div>

                    <span className={`status-badge ${getStatusClass(item.status)}`}>
                      {item.status || '-'}
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

    </div>
  );
}