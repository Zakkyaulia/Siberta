import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Search, FileText, Zap, AlertCircle, ChevronDown,
  BookOpen, Calendar, User, TrendingUp, BarChart2, CheckCircle2, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import './CekTAPage.css';

function SimilarityGauge({ score, color }) {
  const colors = {
    danger:  { ring: '#ef4444', bg: '#fee2e2', text: '#dc2626' },
    warning: { ring: '#f59e0b', bg: '#fef3c7', text: '#b45309' },
    success: { ring: '#10b981', bg: '#d1fae5', text: '#065f46' },
  };
  const c = colors[color];
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="gauge-wrap" style={{ '--gauge-bg': c.bg, '--gauge-text': c.text }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="65" cy="65" r="52"
          fill="none"
          stroke={c.ring}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x="65" y="59" textAnchor="middle" fill={c.text} fontSize="22" fontWeight="800" fontFamily="Poppins, sans-serif">
          {score}%
        </text>
        <text x="65" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Poppins, sans-serif">
          Kemiripan
        </text>
      </svg>
    </div>
  );
}

function MatchCard({ match, delay }) {
  const [expanded, setExpanded] = useState(false);
  const getScoreColor = (s) => s >= 70 ? 'danger' : s >= 40 ? 'warning' : 'success';
  const color = getScoreColor(match.similarity);

  return (
    <div
      className={`match-card card fade-in`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="match-card-header" onClick={() => setExpanded(v => !v)}>
        <div className="match-rank">
          <span>#{match.rank}</span>
        </div>
        <div className="match-info">
          <p className="match-title">{match.judul}</p>
          <div className="match-meta">
            <span><User size={12} /> {match.nama}</span>
            <span><Hash size={12} /> {match.nim}</span>
            <span><Calendar size={12} /> {match.tahun}</span>
          </div>
        </div>
        <div className="match-score-wrap">
          <div className={`match-score match-score-${color}`}>
            {match.similarity}%
          </div>
          <div className={`match-progress-mini`}>
            <div
              className={`match-progress-fill match-fill-${color}`}
              style={{ width: `${match.similarity}%` }}
            />
          </div>
        </div>
        <ChevronDown size={16} className={`match-chevron ${expanded ? 'open' : ''}`} />
      </div>

      {expanded && (
        <div className="match-card-body fade-in">
          <div className="match-keywords">
            <span className="kw-label">Kata Kunci:</span>
            {match.keywords.map((kw, i) => (
              <span key={i} className="badge badge-sky kw-badge">{kw}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component to avoid JSX issue with Hash from lucide
function Hash({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
      <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
    </svg>
  );
}

export default function CekTAPage() {
  const [judulTA, setJudulTA] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Ambil token JWT dari context
  const { token } = useAuth();

  const handleCek = async () => {
    if (!judulTA.trim()) {
      toast.error('Masukkan judul Tugas Akhir terlebih dahulu!');
      return;
    }
    if (judulTA.trim().length < 15) {
      toast.error('Judul terlalu pendek. Minimal 15 karakter.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Panggil API Backend menggunakan token
      const response = await axios.post(
        'http://localhost:5000/api/ta/cek',
        { judul_baru: judulTA },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const backendData = response.data;
      const skor = backendData.skor_kemiripan_tertinggi;

      // Logika Penentuan Label & Warna
      let color, label, description;
      if (skor >= 70) {
        color = 'danger';
        label = 'Tinggi';
        description = 'Topik TA Anda memiliki kemiripan yang sangat tinggi dengan beberapa TA sebelumnya. Disarankan untuk merevisi atau mempersempit fokus penelitian.';
      } else if (skor >= 40) {
        color = 'warning';
        label = 'Sedang';
        description = 'Topik TA Anda memiliki kemiripan sedang dengan beberapa TA sebelumnya. Pastikan perbedaan yang signifikan dalam metodologi atau studi kasus.';
      } else {
        color = 'success';
        label = 'Rendah';
        description = 'Topik TA Anda relatif unik dan memiliki tingkat kemiripan yang rendah. Topik Anda berpotensi untuk dilanjutkan ke tahap berikutnya.';
      }

      // Format data array rekomendasi dari backend agar sesuai dengan UI MatchCard
      const formattedMatches = backendData.rekomendasi_mirip.map((item, index) => ({
        rank: index + 1,
        nim: 'Data Menyusul', // Backend belum mengirim ini
        nama: item.penulis,
        judul: item.judul,
        tahun: item.tahun,
        prodi: 'Sistem Informasi',
        similarity: item.skor,
        keywords: ['Sistem', 'Informasi'] // Dummy keywords sementara
      }));

      // Simpan ke state
      setResult({
        score: skor,
        label: label,
        color: color,
        description: description,
        matches: formattedMatches
      });

      setHasSearched(true);
      toast.success('Analisis kemiripan selesai!', { icon: '🔍' });

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.pesan || "Gagal menghubungi server backend.";
      toast.error(errorMsg);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJudulTA('');
    setResult(null);
    setHasSearched(false);
  };

  const colorMap = {
    danger:  { label: 'Kemiripan Tinggi', badgeClass: 'badge-red',   icon: AlertCircle,   color: '#dc2626' },
    warning: { label: 'Kemiripan Sedang', badgeClass: 'badge-amber', icon: TrendingUp,    color: '#b45309' },
    success: { label: 'Kemiripan Rendah', badgeClass: 'badge-green', icon: CheckCircle2,  color: '#065f46' },
  };

  return (
    <div className="cekta-page fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Cek Kemiripan Tugas Akhir</h1>
          <p className="page-subtitle">Analisis kemiripan topik TA menggunakan SBERT + Cosine Similarity</p>
        </div>
        <div className="header-badges">
          <span className="badge badge-sky"><Zap size={12} /> SBERT</span>
          <span className="badge badge-sky"><BarChart2 size={12} /> Cosine Similarity</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <Info size={16} />
        <p>Masukkan judul TA Anda untuk mengecek tingkat kemiripan dengan database Tugas Akhir mahasiswa Sistem Informasi Unand. Sistem menggunakan <strong>Sentence-BERT</strong> untuk pemahaman semantik dan <strong>Cosine Similarity</strong> untuk mengukur kemiripan.</p>
      </div>

      {/* Input Section */}
      <div className="input-section card">
        <div className="input-section-header">
          <div className="section-icon">
            <FileText size={17} />
          </div>
          <div>
            <h3>Input Judul Tugas Akhir</h3>
            <p>Masukkan judul TA yang akan dicek kemiripannya</p>
          </div>
        </div>

        <div className="textarea-wrap">
          <textarea
            id="judul-ta-input"
            className="input-field ta-textarea"
            placeholder="Contoh: Implementasi SBERT dan Cosine Similarity dalam Identifikasi Kemiripan Topik Tugas Akhir Mahasiswa Sistem Informasi Universitas Andalas"
            value={judulTA}
            onChange={e => setJudulTA(e.target.value)}
            rows={4}
          />
          <div className="textarea-footer">
            <span className={`char-count ${judulTA.length > 300 ? 'over' : ''}`}>
              {judulTA.length} / 300 karakter
            </span>
            {judulTA.length > 0 && (
              <button className="btn btn-ghost clear-btn" onClick={handleReset}>
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="action-row">
          <div className="action-tips">
            <span>💡 Tips: Semakin lengkap judul, semakin akurat hasil analisis</span>
          </div>
          <button
            id="cek-kemiripan-btn"
            className="btn btn-primary cek-btn"
            onClick={handleCek}
            disabled={loading || judulTA.trim().length < 5}
          >
            {loading ? (
              <><div className="spinner" /> Menganalisis...</>
            ) : (
              <><Search size={17} /> Cek Kemiripan</>
            )}
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="loading-section fade-in">
          <div className="loading-steps">
            {[
              { label: 'Memproses judul dengan SBERT...', done: true },
              { label: 'Membuat vector embedding...', done: true },
              { label: 'Menghitung Cosine Similarity...', active: true },
              { label: 'Menyiapkan hasil analisis...', pending: true },
            ].map((step, i) => (
              <div key={i} className={`loading-step ${step.done ? 'done' : step.active ? 'active' : 'pending'}`}>
                <div className="step-indicator">
                  {step.done ? '✓' : step.active ? <div className="mini-spinner" /> : '○'}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
          <div className="skeleton-cards">
            {[1,2,3].map(i => (
              <div key={i} className="skeleton-card">
                <div className="skeleton" style={{ height: 16, width: '70%', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 12, width: '40%' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && !loading && (
        <div className="results-section fade-in">
          {/* Summary Card */}
          <div className="result-summary card">
            <div className="result-summary-left">
              <SimilarityGauge score={result.score} color={result.color} />
            </div>
            <div className="result-summary-right">
              <div className="result-header-row">
                <h3>Hasil Analisis Kemiripan</h3>
                <span className={`badge ${colorMap[result.color].badgeClass}`}>
                  {result.label}
                </span>
              </div>
              <p className="result-description">{result.description}</p>

              <div className="result-stats-row">
                <div className="result-stat">
                  <span className="result-stat-val">{result.matches.length}</span>
                  <span className="result-stat-lbl">TA Mirip Ditemukan</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-val">{result.score}%</span>
                  <span className="result-stat-lbl">Skor Tertinggi</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-val">2,341</span>
                  <span className="result-stat-lbl">Total TA Diindex</span>
                </div>
              </div>

              <div className="result-bar-section">
                <div className="result-bar-label">
                  <span>Tingkat Kemiripan</span>
                  <span>{result.score}%</span>
                </div>
                <div className="result-bar-bg">
                  <div
                    className={`result-bar-fill result-fill-${result.color}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
                <div className="result-bar-scale">
                  <span>0%</span>
                  <span className="scale-low">Rendah</span>
                  <span className="scale-mid">Sedang</span>
                  <span className="scale-high">Tinggi</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Query Display */}
          <div className="query-display card">
            <div className="query-label">
              <Search size={14} />
              Judul yang dianalisis:
            </div>
            <p className="query-text">"{judulTA}"</p>
          </div>

          {/* Match List */}
          <div className="match-list-section">
            <div className="match-list-header">
              <h3>
                <BookOpen size={17} />
                Daftar TA dengan Topik Mirip
              </h3>
              <span className="badge badge-sky">{result.matches.length} hasil</span>
            </div>

            <div className="match-list">
              {result.matches.map((match, i) => (
                <MatchCard key={i} match={match} delay={i * 0.1} />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="result-actions">
            <button className="btn btn-ghost" onClick={handleReset} id="cek-ulang-btn">
              🔄 Cek Judul Lain
            </button>
            <button className="btn btn-primary" id="export-result-btn">
              📄 Ekspor Hasil (PDF)
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasSearched && !loading && (
        <div className="empty-state fade-in">
          <div className="empty-icon">
            <Search size={36} strokeWidth={1.5} />
          </div>
          <h3>Siap Menganalisis Judul TA Anda</h3>
          <p>
            Masukkan judul Tugas Akhir di kolom di atas, lalu klik <strong>"Cek Kemiripan"</strong>
            <br />untuk melihat tingkat kemiripan dengan database TA mahasiswa Sistem Informasi Unand.
          </p>
        </div>
      )}
    </div>
  );
}