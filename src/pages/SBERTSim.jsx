import React from 'react';
import toast from 'react-hot-toast';

export default function SBERTSim() {
  const simulate = () => {
    toast.promise(
      new Promise((res) => setTimeout(() => res(), 900)),
      {
        loading: 'Menjalankan simulasi SBERT...',
        success: 'Simulasi selesai — hasil siap (dummy)',
        error: 'Terjadi kesalahan simulasi',
      }
    );
  };

  return (
    <div className="page-card">
      <h2>Simulasi Judul (SBERT)</h2>
      <p>Masukkan contoh judul untuk mendapatkan skor kemiripan (simulasi).</p>
      <div style={{marginTop:12}}>
        <input placeholder="Contoh: Analisis ..." style={{width:'60%'}} />
        <button onClick={simulate} style={{marginLeft:8}}>Simulasikan</button>
      </div>
    </div>
  );
}
