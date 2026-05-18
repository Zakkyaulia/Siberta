import React, { useEffect, useRef, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function ReviewModal({ open, onClose, submission, onSubmitted }) {
  const [decision, setDecision] = useState('setuju');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) { setDecision('setuju'); setComment(''); }
  }, [open]);

  if (!open || !submission) return null;

  const submit = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/reviews/${submission.id}`, { decision, comment });
      toast.success('Keputusan tersimpan');
      onSubmitted();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menyimpan keputusan');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>Review: {submission.judul}</h3>
        <div>
          <label>Keputusan</label>
          <select value={decision} onChange={e=>setDecision(e.target.value)}>
            <option value="setuju">Setuju</option>
            <option value="revisi">Revisi</option>
            <option value="tolak">Tolak</option>
          </select>
        </div>
        <div>
          <label>Catatan untuk mahasiswa</label>
          <textarea value={comment} onChange={e=>setComment(e.target.value)} />
        </div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button onClick={onClose}>Batal</button>
          <button onClick={submit} disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
        </div>
      </div>
    </div>
  );
}

export default function DaftarMasuk() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const hasLoadedRef = useRef(false);

  const load = async (showErrorToast = true) => {
    try {
      setAuthToken(token);
      const res = await api.get('/api/pengajuan');
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      if (showErrorToast) toast.error('Gagal memuat daftar masuk');
    }
  };

  useEffect(() => {
    if (!token || hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    load();
  }, [token]);

  const openReview = (it) => { setSelected(it); setModalOpen(true); };

  return (
    <div className="page-card">
      <h2>Daftar Masuk (Untuk Dosen)</h2>
      {items.length === 0 && <p>Tidak ada pengajuan saat ini.</p>}
      <ul>
        {items.map(it => (
          <li key={it.id} style={{marginBottom:12}}>
            <strong>{it.judul}</strong>
            <div>Mahasiswa: {it.student_id}</div>
            <div>Status: {it.status}</div>
            <div style={{marginTop:6}}>
              <button onClick={()=>openReview(it)}>Tinjau</button>
            </div>
          </li>
        ))}
      </ul>

      <ReviewModal open={modalOpen} onClose={()=>setModalOpen(false)} submission={selected} onSubmitted={load} />
    </div>
  );
}

