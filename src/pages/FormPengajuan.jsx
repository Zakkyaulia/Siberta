import React from 'react';
import toast from 'react-hot-toast';

export default function FormPengajuan() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Pengajuan dikirim ke dosen pembimbing (simulasi)');
  };

  return (
    <div className="page-card">
      <h2>Form Pengajuan Judul</h2>
      <form onSubmit={handleSubmit}>
        <label>Judul</label>
        <input required placeholder="Masukkan judul" />
        <label>Ringkasan (opsional)</label>
        <textarea placeholder="Ringkasan singkat" />
        <label>File pendukung (opsional)</label>
        <input type="file" />
        <div style={{marginTop:12}}>
          <button type="submit">Ajukan</button>
        </div>
      </form>
    </div>
  );
}
