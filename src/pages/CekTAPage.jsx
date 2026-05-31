import React, { useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  Layers,
  Search,
  Send,
  TrendingUp,
  Upload,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './CekTAPage.css';

const TEMA_OPTIONS = [
  { value: 'EA', label: 'EA', desc: 'System Development' },
  { value: 'BI', label: 'BI', desc: 'Business Intelligence' },
  { value: 'ML', label: 'ML', desc: 'Machine Learning' },
  { value: 'SPK', label: 'SPK', desc: 'Sistem Penunjang Keputusan' },
  { value: 'ERP', label: 'ERP', desc: 'Enterprise Resource Planning' },
];

const normalizeTitle = (value) => value.trim().replace(/\s+/g, ' ').toLowerCase();

function getScoreMeta(score, statusCode) {
  if (statusCode === 'MERAH' || score >= 85) {
    return {
      color: 'danger',
      label: 'Kemiripan Tinggi',
      description: 'Judul memiliki kemiripan tinggi dengan data TA sebelumnya. Revisi fokus, metode, atau studi kasus sebelum diajukan.',
    };
  }

  if (statusCode === 'KUNING' || score >= 70) {
    return {
      color: 'warning',
      label: 'Kemiripan Sedang',
      description: 'Judul masih berpotensi diajukan, tetapi pastikan kebaruan kontribusi dan batas penelitian terlihat jelas.',
    };
  }

  return {
    color: 'success',
    label: 'Kemiripan Rendah',
    description: 'Judul relatif unik terhadap data TA yang tersedia dan dapat dilanjutkan ke tahap pengajuan.',
  };
}

function SimilarityGauge({ score, color }) {
  const colors = {
    danger: { ring: '#ef4444', bg: '#fee2e2', text: '#dc2626' },
    warning: { ring: '#f59e0b', bg: '#fef3c7', text: '#b45309' },
    success: { ring: '#10b981', bg: '#d1fae5', text: '#065f46' },
  };
  const c = colors[color] || colors.success;
  const safeScore = Math.min(100, Math.max(0, Number(score) || 0));
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="gauge-wrap" style={{ '--gauge-bg': c.bg, '--gauge-text': c.text }}>
      <svg width="130" height="130" viewBox="0 0 130 130" aria-label={`Skor kemiripan ${safeScore}%`}>
        <circle cx="65" cy="65" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="65"
          cy="65"
          r="52"
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
          {safeScore}%
        </text>
        <text x="65" y="75" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="Poppins, sans-serif">
          Kemiripan
        </text>
      </svg>
    </div>
  );
}

function MatchCard({ match, delay }) {
  const getScoreColor = (score) => {
    if (score >= 85) return 'danger';
    if (score >= 70) return 'warning';
    return 'success';
  };
  const color = getScoreColor(match.similarity);

  return (
    <div className="match-card card fade-in" style={{ animationDelay: `${delay}s` }}>
      <div className="match-card-header">
        <div className="match-rank">
          <span>#{match.rank}</span>
        </div>
        <div className="match-info">
          <p className="match-title">{match.judul}</p>
          <div className="match-meta">
            <span><User size={12} /> {match.nama || '-'}</span>
          </div>
        </div>
        <div className="match-score-wrap">
          <div className={`match-score match-score-${color}`}>
            {match.similarity}%
          </div>
          <div className="match-progress-mini">
            <div className={`match-progress-fill match-fill-${color}`} style={{ width: `${match.similarity}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CekTAPage() {
  const { token } = useAuth();

  const [mode, setMode] = useState('check');
  const [judulTA, setJudulTA] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tema, setTema] = useState('');
  const [file, setFile] = useState(null);
  const [dosen, setDosen] = useState([]);
  const [pembimbing1, setPembimbing1] = useState('');
  const [pembimbing2, setPembimbing2] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const titleChangedAfterCheck = useMemo(() => {
    if (!result?.checkedTitle) return false;
    return normalizeTitle(result.checkedTitle) !== normalizeTitle(judulTA);
  }, [judulTA, result]);

  const selectedTema = TEMA_OPTIONS.find((item) => item.value === tema);
  const canSubmit = mode === 'submit' && result && !titleChangedAfterCheck;

  useEffect(() => {
    const loadDosen = async () => {
      try {
        setAuthToken(token);
        const res = await api.get('/api/auth/dosen');
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setDosen(list.filter((item) => (item?.role || '').toLowerCase() === 'dosen'));
      } catch (err) {
        console.error(err);
        toast.error('Gagal memuat daftar dosen pembimbing');
      }
    };

    loadDosen();
  }, [token]);

  const resetResultIfTitleChanges = (value) => {
    setJudulTA(value);

    if (result && normalizeTitle(value) !== normalizeTitle(result.checkedTitle)) {
      setHasSearched(false);
    }
  };

  const handleCek = async () => {
    if (!judulTA.trim()) {
      toast.error('Masukkan judul Tugas Akhir terlebih dahulu.');
      return;
    }

    if (judulTA.trim().length < 15) {
      toast.error('Judul terlalu pendek. Minimal 15 karakter.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      setAuthToken(token);
      const res = await api.post('/api/ta/cek', { judul_baru: judulTA });
      const backendData = res.data || {};
      const skor = Number(
        backendData.skor_kemiripan_tertinggi ||
        backendData.max_score ||
        backendData.similarity_score ||
        0
      );
      const meta = getScoreMeta(skor, backendData.status_kode);
      const rekomendasi = Array.isArray(backendData.rekomendasi_mirip)
        ? backendData.rekomendasi_mirip
        : [];

      const formattedMatches = rekomendasi.map((item, index) => ({
        rank: index + 1,
        nama: item.penulis,
        judul: item.judul,
        similarity: item.skor,
      }));

      setResult({
        score: skor,
        label: meta.label,
        color: meta.color,
        description: meta.description,
        matches: formattedMatches,
        checkedTitle: judulTA,
        checkedAt: new Date().toISOString(),
      });

      setHasSearched(true);
      toast.success('Analisis kemiripan selesai.');
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.pesan ||
        error.response?.data?.message ||
        'ML Service tidak tersedia. Pastikan Python service sudah berjalan.';
      toast.error(errorMsg);
      setHasSearched(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setJudulTA('');
    setAbstract('');
    setTema('');
    setFile(null);
    setPembimbing1('');
    setPembimbing2('');
    setResult(null);
    setHasSearched(false);

    const fileInput = document.getElementById('file_pendukung');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!canSubmit) {
      toast.error('Cek kemiripan judul terlebih dahulu sebelum mengajukan.');
      return;
    }

    if (!tema) {
      toast.error('Pilih tema TA terlebih dahulu.');
      return;
    }

    if (!pembimbing1) {
      toast.error('Pilih pembimbing 1 terlebih dahulu.');
      return;
    }

    if (pembimbing2 && String(pembimbing1) === String(pembimbing2)) {
      toast.error('Pembimbing 1 dan pembimbing 2 tidak boleh sama.');
      return;
    }

    const payload = {
      judul: judulTA,
      abstract,
      tema,
      pembimbing1_id: pembimbing1,
      pembimbing2_id: pembimbing2 || undefined,
      similarity_score: result.score,
      similarity_checked_title: result.checkedTitle,
    };

    setSubmitting(true);

    try {
      setAuthToken(token);

      if (file) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });
        formData.append('file_pendukung', file);

        await api.post('/api/pengajuan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/api/pengajuan', payload);
      }

      toast.success('Pengajuan berhasil dikirim ke dosen pembimbing.');
      resetForm();
      setMode('check');
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.pesan || err?.response?.data?.message;
      toast.error(serverMsg || 'Gagal mengirim pengajuan.');
    } finally {
      setSubmitting(false);
    }
  };

  const colorMap = {
    danger: { badgeClass: 'badge-red', icon: AlertCircle },
    warning: { badgeClass: 'badge-amber', icon: TrendingUp },
    success: { badgeClass: 'badge-green', icon: CheckCircle2 },
  };

  return (
    <div className="cekta-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cek & Ajukan Judul TA</h1>
          <p className="page-subtitle">Cek kemiripan dahulu, lalu lanjutkan menjadi pengajuan bila judul sudah siap.</p>
        </div>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Mode pengajuan">
        <button
          type="button"
          className={`mode-option ${mode === 'check' ? 'active' : ''}`}
          onClick={() => setMode('check')}
        >
          <Search size={17} />
          <span>Cek saja</span>
        </button>
        <button
          type="button"
          className={`mode-option ${mode === 'submit' ? 'active' : ''}`}
          onClick={() => setMode('submit')}
        >
          <Send size={17} />
          <span>Cek lalu ajukan</span>
        </button>
      </div>

      <div className="info-banner">
        <Info size={16} />
        <p>
          Pengajuan judul membutuhkan skor kemiripan dari pengecekan SBERT. Skor yang muncul di halaman ini akan ikut tersimpan agar dosen pembimbing dapat menilai keunikan judul.
        </p>
      </div>

      <div className="input-section card">
        <div className="input-section-header">
          <div className="section-icon">
            <FileText size={17} />
          </div>
          <div>
            <h3>Judul Tugas Akhir</h3>
            <p>Masukkan judul yang akan dicek terhadap data TA Sistem Informasi Unand.</p>
          </div>
        </div>

        <div className="textarea-wrap">
          <textarea
            id="judul-ta-input"
            className="input-field ta-textarea"
            placeholder="Contoh: Implementasi SBERT dan Cosine Similarity dalam Identifikasi Kemiripan Topik Tugas Akhir Mahasiswa Sistem Informasi Universitas Andalas"
            value={judulTA}
            onChange={(e) => resetResultIfTitleChanges(e.target.value)}
            rows={4}
          />
          <div className="textarea-footer">
            <span className={`char-count ${judulTA.length > 300 ? 'over' : ''}`}>
              {judulTA.length} / 300 karakter
            </span>
            {judulTA.length > 0 && (
              <button className="btn btn-ghost clear-btn" onClick={resetForm} type="button">
                Hapus
              </button>
            )}
          </div>
        </div>

        <div className="action-row">
          <div className="action-tips">
            <span>Judul yang lebih spesifik memberi hasil analisis yang lebih akurat.</span>
          </div>
          <button
            id="cek-kemiripan-btn"
            className="btn btn-primary cek-btn"
            onClick={handleCek}
            disabled={loading || judulTA.trim().length < 5}
            type="button"
          >
            {loading ? (
              <><div className="spinner" /> Menganalisis...</>
            ) : (
              <><Search size={17} /> Cek Kemiripan</>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="loading-section fade-in">
          <div className="loading-steps">
            {[
              { label: 'Membersihkan judul...', done: true },
              { label: 'Membuat embedding SBERT...', done: true },
              { label: 'Menghitung cosine similarity...', active: true },
              { label: 'Menyiapkan rekomendasi terdekat...', pending: true },
            ].map((step) => (
              <div key={step.label} className={`loading-step ${step.done ? 'done' : step.active ? 'active' : 'pending'}`}>
                <div className="step-indicator">
                  {step.done ? 'OK' : step.active ? <div className="mini-spinner" /> : '-'}
                </div>
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="results-section fade-in">
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
                  <span className="result-stat-lbl">TA Mirip</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-val">{result.score}%</span>
                  <span className="result-stat-lbl">Skor Tertinggi</span>
                </div>
                <div className="result-stat">
                  <span className="result-stat-val">{mode === 'submit' ? 'Siap' : 'Cek'}</span>
                  <span className="result-stat-lbl">Mode Saat Ini</span>
                </div>
              </div>

              <div className="result-bar-section">
                <div className="result-bar-label">
                  <span>Tingkat Kemiripan</span>
                  <span>{result.score}%</span>
                </div>
                <div className="result-bar-bg">
                  <div className={`result-bar-fill result-fill-${result.color}`} style={{ width: `${result.score}%` }} />
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

          {titleChangedAfterCheck && (
            <div className="result-warning">
              <AlertCircle size={16} />
              Judul berubah setelah pengecekan. Cek ulang agar skor yang disimpan sesuai dengan judul terbaru.
            </div>
          )}

          <div className="query-display card">
            <div className="query-label">
              <Search size={14} />
              Judul yang dianalisis:
            </div>
            <p className="query-text">"{result.checkedTitle}"</p>
          </div>

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
                <MatchCard key={`${match.judul}-${i}`} match={match} delay={i * 0.1} />
              ))}
            </div>
          </div>

          {mode === 'check' && (
            <div className="result-actions">
              <button className="btn btn-ghost" onClick={resetForm} id="cek-ulang-btn" type="button">
                Cek Judul Lain
              </button>
              <button className="btn btn-primary" onClick={() => setMode('submit')} type="button">
                <Send size={16} />
                Lanjut Ajukan
              </button>
            </div>
          )}
        </div>
      )}

      {mode === 'submit' && (
        <form className="submission-panel card fade-in" onSubmit={handleSubmit}>
          <div className="submission-panel-header">
            <div className="section-icon">
              <ClipboardCheck size={17} />
            </div>
            <div>
              <h3>Data Pengajuan</h3>
              <p>Lengkapi data ini setelah judul dicek. Skor akan tersimpan bersama pengajuan.</p>
            </div>
            {result && !titleChangedAfterCheck && (
              <span className={`score-pill score-pill-${result.color}`}>
                Skor {result.score}%
              </span>
            )}
          </div>

          {!result && (
            <div className="submit-locked">
              <Search size={18} />
              Cek kemiripan judul terlebih dahulu untuk membuka tombol pengajuan.
            </div>
          )}

          <div className="form-group">
            <label>Tema TA <span>*</span></label>
            <div className="theme-grid">
              {TEMA_OPTIONS.map((option) => (
                <label key={option.value} className={`theme-option ${tema === option.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="tema"
                    value={option.value}
                    checked={tema === option.value}
                    onChange={(event) => setTema(event.target.value)}
                  />
                  <span className="theme-code">{option.label}</span>
                  <span className="theme-desc">{option.desc}</span>
                </label>
              ))}
            </div>
            {selectedTema && <small>Dipilih: {selectedTema.label} ({selectedTema.desc})</small>}
          </div>

          <div className="form-group">
            <label htmlFor="abstract">Ringkasan</label>
            <textarea
              id="abstract"
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Tuliskan ringkasan singkat mengenai judul yang diajukan"
              rows="5"
            />
            <small>Opsional, tetapi membantu dosen memahami ruang lingkup usulan.</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pembimbing1">Pembimbing 1 <span>*</span></label>
              <select
                id="pembimbing1"
                value={pembimbing1}
                onChange={(e) => setPembimbing1(e.target.value)}
              >
                <option value="">Pilih pembimbing 1</option>
                {dosen
                  .filter((d) => String(d.id) !== String(pembimbing2))
                  .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.username})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pembimbing2">Pembimbing 2</label>
              <select
                id="pembimbing2"
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

          <div className="form-group">
            <label htmlFor="file_pendukung">File Pendukung</label>
            <div className="file-box">
              <Upload size={18} />
              <input
                id="file_pendukung"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <small>{file ? `File dipilih: ${file.name}` : 'Opsional. Lampirkan proposal, referensi, atau dokumen pendukung.'}</small>
          </div>

          <div className="submission-summary">
            <div>
              <Layers size={16} />
              <span>Tema</span>
              <strong>{selectedTema ? `${selectedTema.label} (${selectedTema.desc})` : '-'}</strong>
            </div>
            <div>
              <Search size={16} />
              <span>Skor Kemiripan</span>
              <strong>{result && !titleChangedAfterCheck ? `${result.score}%` : 'Belum valid'}</strong>
            </div>
          </div>

          <div className="form-action">
            <button type="submit" disabled={submitting || !canSubmit}>
              {submitting ? 'Mengirim...' : 'Ajukan Judul'}
            </button>
          </div>
        </form>
      )}

      {!hasSearched && !loading && !result && mode === 'check' && (
        <div className="empty-state fade-in">
          <div className="empty-icon">
            <Search size={36} strokeWidth={1.5} />
          </div>
          <h3>Siap Menganalisis Judul TA</h3>
          <p>Masukkan judul, lalu cek kemiripan untuk melihat skor dan daftar TA yang paling mendekati.</p>
        </div>
      )}
    </div>
  );
}
