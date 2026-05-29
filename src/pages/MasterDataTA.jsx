import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './MasterDataTA.css';

export default function MasterDataTA() {
  const { token } = useAuth();

  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTitles = async () => {
    try {
      setLoading(true);
      setAuthToken(token);

      const res = await api.get('/api/admin/master-titles');
      setTitles(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat master titles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadTitles();
    }
  }, [token]);

  const create = async (e) => {
    e.preventDefault();

    if (!newTitle.trim()) {
      toast.error('Judul tidak boleh kosong');
      return;
    }

    try {
      setSaving(true);
      setAuthToken(token);

      await api.post('/api/admin/master-titles', {
        title: newTitle,
      });

      toast.success('Judul master ditambahkan');
      setNewTitle('');
      loadTitles();
    } catch (err) {
      console.error(err);
      toast.error('Gagal menambahkan judul');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="master-page">
      <div className="master-card">
        <div className="master-header">
          <div>
            <h2>Master Data TA</h2>
            <p>Kelola daftar judul atau topik tugas akhir yang tersedia.</p>
          </div>

          <div className="master-count">
            {titles.length} Judul
          </div>
        </div>

        <form className="master-form" onSubmit={create}>
          <div className="master-input-group">
            <label htmlFor="newTitle">Judul Baru</label>
            <input
              id="newTitle"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Masukkan judul tugas akhir baru"
            />
          </div>

          <button type="submit" disabled={saving}>
            {saving ? 'Menambahkan...' : 'Tambah'}
          </button>
        </form>

        <div className="master-content">
          {loading && (
            <div className="loading-state">
              Memuat data judul...
            </div>
          )}

          {!loading && titles.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3>Belum ada judul</h3>
              <p>Judul tugas akhir yang ditambahkan akan tampil di bagian ini.</p>
            </div>
          )}

          {!loading && titles.length > 0 && (
            <div className="master-list">
              {titles.map((t, index) => (
                <div className="master-item" key={t.id}>
                  <div className="master-number">
                    {index + 1}
                  </div>

                  <div className="master-title">
                    <h3>{t.title}</h3>

                    {t.created_at && (
                      <p>
                        Ditambahkan pada{' '}
                        {new Date(t.created_at).toLocaleString('id-ID', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}