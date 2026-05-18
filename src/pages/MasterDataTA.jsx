import React, { useEffect, useState } from 'react';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MasterDataTA() {
  const { token } = useAuth();
  const [titles, setTitles] = useState([]);
  const [newTitle, setNewTitle] = useState('');

  useEffect(()=>{
    const load = async () => {
      try {
        setAuthToken(token);
        const res = await api.get('/api/admin/master-titles');
        setTitles(res.data.data || []);
      } catch (err) { console.error(err); toast.error('Gagal memuat master titles'); }
    };
    load();
  }, [token]);

  const create = async () => {
    try {
      await api.post('/api/admin/master-titles', { title: newTitle });
      toast.success('Judul master ditambahkan');
      setNewTitle('');
    } catch (err) { console.error(err); toast.error('Gagal menambahkan'); }
  };

  return (
    <div className="page-card">
      <h2>Master Data TA</h2>
      <div>
        <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Judul baru" />
        <button onClick={create}>Tambah</button>
      </div>
      <ul>
        {titles.map(t=> <li key={t.id}>{t.title}</li>)}
      </ul>
    </div>
  );
}

