import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api, { setAuthToken } from '../services/api';
import './FormPengajuan.css';

export default function FormPengajuan() {
  const { token } = useAuth();

  const [judul, setJudul] = useState('');
  const [abstract, setAbstract] = useState('');
  const [file, setFile] = useState(null);
  const [dosen, setDosen] = useState([]);
  const [pembimbing1, setPembimbing1] = useState('');
  const [pembimbing2, setPembimbing2] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul.trim()) {
      return toast.error('Judul wajib diisi');
    }

    setLoading(true);

    try {
      setAuthToken(token);

      const payloadBase = {
        judul,
        abstract,
        ringkasan: abstract,
        pembimbing1_id: pembimbing1 || undefined,
        pembimbing2_id: pembimbing2 || undefined,
      };

      if (file) {
        const formData = new FormData();

        Object.entries(payloadBase).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value);
          }
        });

        formData.append('file_pendukung', file);

        await api.post('/api/pengajuan', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await api.post('/api/pengajuan', payloadBase);
      }

      toast.success('Pengajuan berhasil dikirim');

      setJudul('');
      setAbstract('');
      setFile(null);
      setPembimbing1('');
      setPembimbing2('');

      const fileInput = document.getElementById('file_pendukung');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error(err);

      const serverMsg =
        err?.response?.data?.pesan ||
        err?.response?.data?.message;

      toast.error(serverMsg || 'Gagal mengirim pengajuan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pickDosenFromResponse = (payload) => {
      const list = Array.isArray(payload?.data) ? payload.data : [];

      return list.filter(
        (u) => (u?.role || '').toLowerCase() === 'dosen'
      );
    };

    const applyDosenList = (list) => {
      setDosen(list);

      if (list.length > 0) {
        setPembimbing1(list[0].id);
        setPembimbing2(list.length > 1 ? list[1].id : '');
      }
    };

    const loadDosen = async () => {
      setAuthToken(token);

      const endpoints = [
        '/api/auth/dosen',
        '/api/dosen',
        '/api/users/dosen',
        '/api/admin/users',
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await api.get(endpoint);
          const list = pickDosenFromResponse(res.data);

          if (list.length > 0) {
            applyDosenList(list);
            return;
          }
        } catch (err) {
          console.warn(
            `Gagal ambil dosen dari ${endpoint}`,
            err?.response?.status || err?.message
          );
        }
      }

      const fallbackDosen = [
        {
          id: '2',
          nama: 'Dr. Dosen Pembimbing',
          username: 'dosen1',
          role: 'dosen',
        },
        {
          id: '3',
          nama: 'Dr. Dosen Penguji',
          username: 'dosen2',
          role: 'dosen',
        },
      ];

      applyDosenList(fallbackDosen);

      toast(
        'Data dosen backend belum tersedia. Sementara gunakan data dosen default.',
        {
          icon: 'ℹ️',
        }
      );
    };

    if (token) {
      loadDosen();
    }
  }, [token]);

  return (
    <div className="pengajuan-page">
      <div className="pengajuan-card">
        <div className="pengajuan-header">
          <div>
            <h2>Form Pengajuan Judul</h2>
            <p>
              Silakan lengkapi data pengajuan judul tugas akhir pada form
              berikut.
            </p>
          </div>
        </div>

        <form className="pengajuan-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="judul">
              Judul <span>*</span>
            </label>
            <input
              id="judul"
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul tugas akhir"
              required
            />
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
            <small>Bagian ini opsional, tetapi dapat membantu dosen memahami usulan judul.</small>
          </div>

          <div className="form-group">
            <label htmlFor="file_pendukung">File Pendukung</label>
            <div className="file-box">
              <input
                id="file_pendukung"
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <small>
              Opsional. Lampirkan proposal, referensi, atau dokumen pendukung
              lainnya jika ada.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pembimbing1">Pembimbing 1</label>
              <select
                id="pembimbing1"
                value={pembimbing1}
                onChange={(e) => setPembimbing1(e.target.value)}
              >
                <option value="">-- Pilih Pembimbing --</option>
                {dosen.map((d) => (
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
                <option value="">-- Pilih Pembimbing Opsional --</option>
                {dosen.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama} ({d.username})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-action">
            <button type="submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Ajukan Judul'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}