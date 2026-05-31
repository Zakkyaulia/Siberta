import React, { useCallback, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Database,
  Eye,
  FileText,
  Layers,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import './MasterDataTA.css';

const PAGE_SIZE = 10;

const TEMA_LABEL = {
  EA: 'EA (System Development)',
  BI: 'BI (Business Intelligence)',
  ML: 'ML (Machine Learning)',
  SPK: 'SPK (Sistem Penunjang Keputusan)',
  ERP: 'ERP',
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

function DetailModal({ item, onClose }) {
  if (!item) return null;

  const submission = item.origin_submission;

  return (
    <div className="master-modal-backdrop" onClick={onClose}>
      <div className="master-modal" onClick={(event) => event.stopPropagation()}>
        <div className="master-modal-header">
          <div>
            <h3>Detail Arsip TA</h3>
            <p>{item.judul || item.title || '-'}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Tutup detail">
            <X size={18} />
          </button>
        </div>

        <div className="master-detail-grid">
          <div>
            <span>Mahasiswa</span>
            <strong>{item.penulis || submission?.mahasiswa?.nama || '-'}</strong>
          </div>
          <div>
            <span>Tahun</span>
            <strong>{item.tahun || '-'}</strong>
          </div>
          <div>
            <span>Tema TA</span>
            <strong>{TEMA_LABEL[item.tema] || item.tema || '-'}</strong>
          </div>
          <div>
            <span>Skor Kemiripan</span>
            <strong>{item.similarity_score !== null && item.similarity_score !== undefined ? `${item.similarity_score}%` : '-'}</strong>
          </div>
        </div>

        <div className="master-detail-section">
          <h4>
            <FileText size={16} />
            Informasi Pengajuan Asal
          </h4>

          {!submission && (
            <p className="master-muted">Data ini tidak memiliki referensi pengajuan asal.</p>
          )}

          {submission && (
            <>
              <div className="master-detail-grid">
                <div>
                  <span>ID Pengajuan</span>
                  <strong>#{submission.id}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{submission.status || '-'}</strong>
                </div>
                <div>
                  <span>Pembimbing 1</span>
                  <strong>{submission.pembimbing1?.nama || '-'}</strong>
                </div>
                <div>
                  <span>Pembimbing 2</span>
                  <strong>{submission.pembimbing2?.nama || 'Tidak dipilih'}</strong>
                </div>
              </div>

              {submission.abstract && (
                <div className="master-abstract">
                  <span>Ringkasan</span>
                  <p>{submission.abstract}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MasterDataTA() {
  const { token } = useAuth();

  const [titles, setTitles] = useState([]);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTitles = useCallback(async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/admin/master-titles');
      setTitles(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat arsip TA tersinkron.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const timer = window.setTimeout(() => {
        loadTitles();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [loadTitles, token]);

  const filteredTitles = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    if (!keyword) return titles;

    return titles.filter((item) => {
      const haystack = [
        item.judul,
        item.title,
        item.penulis,
        item.tahun,
        item.tema,
        TEMA_LABEL[item.tema],
        item.similarity_score,
        item.origin_submission?.mahasiswa?.nama,
        item.origin_submission?.pembimbing1?.nama,
        item.origin_submission?.pembimbing2?.nama,
      ]
        .filter((value) => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [query, titles]);

  const totalPages = Math.max(1, Math.ceil(filteredTitles.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * PAGE_SIZE;
  const pageItems = filteredTitles.slice(pageStart, pageStart + PAGE_SIZE);
  const from = filteredTitles.length === 0 ? 0 : pageStart + 1;
  const to = Math.min(pageStart + PAGE_SIZE, filteredTitles.length);

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  return (
    <div className="master-page">
      <div className="master-card">
        <div className="master-header">
          <div>
            <h2>Arsip TA Tersinkron</h2>
            <p>Data tugas akhir resmi yang sudah disetujui pembimbing dan disinkronkan oleh departemen.</p>
          </div>

          <div className="master-count">
            {titles.length} Data TA
          </div>
        </div>

        <div className="master-toolbar">
          <div className="master-search">
            <Search size={18} />
            <input
              id="searchTitle"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari judul, mahasiswa, tema, tahun, atau pembimbing"
            />
          </div>

          <div className="master-range">
            {from}-{to} dari {filteredTitles.length} data
          </div>
        </div>

        <div className="master-content">
          {loading && (
            <div className="loading-state">
              Memuat arsip TA...
            </div>
          )}

          {!loading && filteredTitles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon"><Database size={34} /></div>
              <h3>Data tidak ditemukan</h3>
              <p>Coba gunakan kata kunci lain untuk mencari arsip tugas akhir.</p>
            </div>
          )}

          {!loading && filteredTitles.length > 0 && (
            <>
              <div className="master-list">
                {pageItems.map((item, index) => (
                  <button
                    type="button"
                    className="master-item"
                    key={item.id}
                    onClick={() => setSelected(item)}
                  >
                    <div className="master-number">
                      {pageStart + index + 1}
                    </div>

                    <div className="master-title">
                      <h3>{item.judul || item.title}</h3>
                      <div className="master-meta">
                        <span><User size={13} /> {item.penulis || '-'}</span>
                        <span><Layers size={13} /> {TEMA_LABEL[item.tema] || item.tema || '-'}</span>
                        <span><Search size={13} /> {item.similarity_score !== null && item.similarity_score !== undefined ? `${item.similarity_score}%` : '-'}</span>
                        <span><Users size={13} /> {item.origin_submission ? 'Ada detail pengajuan' : 'Tanpa detail pengajuan'}</span>
                      </div>
                      <p>Disinkronkan pada {formatTanggal(item.created_at)}</p>
                    </div>

                    <div className="master-open">
                      <Eye size={16} />
                    </div>
                  </button>
                ))}
              </div>

              <div className="master-pagination">
                <button type="button" onClick={() => goToPage(1)} disabled={safePage === 1}>
                  <ChevronsLeft size={16} />
                </button>
                <button type="button" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}>
                  <ChevronLeft size={16} />
                </button>

                <span>Halaman {safePage} dari {totalPages}</span>

                <button type="button" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages}>
                  <ChevronRight size={16} />
                </button>
                <button type="button" onClick={() => goToPage(totalPages)} disabled={safePage === totalPages}>
                  <ChevronsRight size={16} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
