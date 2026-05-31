import React, { useCallback, useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Clock,
  Database,
  Layers,
  RefreshCw,
  Search,
  User,
  Users,
} from 'lucide-react';
import './ValidasiAkhir.css';

const TEMA_LABEL = {
  EA: 'EA (System Development)',
  BI: 'BI (Business Intelligence)',
  ML: 'ML (Machine Learning)',
  SPK: 'SPK (Sistem Penunjang Keputusan)',
  ERP: 'ERP',
};

const formatDecision = (decision) => {
  const value = (decision || '').toLowerCase();

  if (value === 'setuju') return 'Setuju';
  if (value === 'revisi') return 'Revisi';
  if (value === 'tolak') return 'Tolak';

  return 'Menunggu';
};

function AdvisorStatus({ submission }) {
  const reviews = submission?.advisor_reviews || {};

  return (
    <div className="validasi-advisors">
      {['pembimbing1', 'pembimbing2'].map((key) => {
        const item = reviews[key];
        if (!item) return null;

        return (
          <div key={key} className="validasi-advisor">
            <div>
              <span>{item.label}</span>
              <strong>{item.nama || item.username || '-'}</strong>
            </div>
            <span className={`decision-chip decision-${item.status || 'menunggu'}`}>
              {formatDecision(item.decision)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ValidasiAkhir() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setAuthToken(token);
      const res = await api.get('/api/pengajuan');
      const pendingSubmissions = (res.data.data || []).filter((item) => {
        return (item.status || '').toLowerCase() !== 'validated';
      });
      setItems(pendingSubmissions);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data sinkronisasi.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const timer = window.setTimeout(() => {
        load();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [load, token]);

  const syncSubmission = async (id) => {
    try {
      setSyncingId(id);
      await api.post(`/api/admin/validate/${id}`);
      toast.success('Pengajuan berhasil disinkronkan ke database dan model ML.');
      await load();
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.pesan || err?.response?.data?.message;
      const blockers = err?.response?.data?.blockers;
      toast.error(blockers?.length ? blockers[0] : serverMsg || 'Gagal melakukan sinkronisasi.');
    } finally {
      setSyncingId(null);
    }
  };

  const readyCount = items.filter((item) => item.approval_status?.can_sync).length;
  const waitingCount = items.length - readyCount;

  return (
    <div className="validasi-page">
      <div className="validasi-card">
        <div className="validasi-header">
          <div>
            <h2>Sinkronisasi Pengajuan TA</h2>
            <p>Departemen dapat melihat seluruh pengajuan dan menyinkronkan judul yang sudah disetujui pembimbing.</p>
          </div>
          <div className="validasi-badge">
            <Database size={16} />
            Departemen
          </div>
        </div>

        <div className="validasi-stats">
          <div>
            <Clock size={18} />
            <span>Belum Sinkron</span>
            <strong>{items.length}</strong>
          </div>
          <div>
            <CheckCircle2 size={18} />
            <span>Siap Sinkron</span>
            <strong>{readyCount}</strong>
          </div>
          <div>
            <Database size={18} />
            <span>Menunggu Syarat</span>
            <strong>{waitingCount}</strong>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            Memuat data pengajuan...
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Database size={34} /></div>
            <h3>Tidak ada antrian sinkronisasi</h3>
            <p>Pengajuan yang sudah tersinkron tidak ditampilkan lagi di halaman ini.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="validasi-list">
            {items.map((item) => {
              const canSync = item.approval_status?.can_sync;
              const blockers = item.approval_status?.blockers || [];

              return (
                <div className="validasi-item" key={item.id}>
                  <div className="validasi-main">
                    <div className="validasi-top">
                      <div>
                        <h3>{item.judul || '-'}</h3>
                        <div className="validasi-meta">
                          <span><User size={13} /> {item.mahasiswa?.nama || item.student_id || '-'}</span>
                          <span><Layers size={13} /> {TEMA_LABEL[item.tema] || item.tema || '-'}</span>
                          <span><Search size={13} /> Skor {item.similarity_score !== null && item.similarity_score !== undefined ? `${item.similarity_score}%` : '-'}</span>
                        </div>
                      </div>
                      <span className={`sync-state ${canSync ? 'ready' : 'blocked'}`}>
                        {canSync ? 'Siap sinkron' : 'Belum lengkap'}
                      </span>
                    </div>

                    {item.abstract && <p className="validasi-abstract">{item.abstract}</p>}

                    <div className="validasi-section-title">
                      <Users size={15} />
                      Status Pembimbing
                    </div>
                    <AdvisorStatus submission={item} />

                    {!canSync && blockers.length > 0 && (
                      <div className="validasi-blockers">
                        {blockers.map((blocker) => (
                          <span key={blocker}>{blocker}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="validasi-action">
                    <button
                      type="button"
                      onClick={() => syncSubmission(item.id)}
                      disabled={!canSync || syncingId === item.id}
                    >
                      {syncingId === item.id ? (
                        <>
                          <RefreshCw size={15} />
                          Sinkron...
                        </>
                      ) : (
                        <>
                          <Database size={15} />
                          Sinkronkan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
