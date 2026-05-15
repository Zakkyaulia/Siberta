import React from 'react';
import toast from 'react-hot-toast';

export default function SyncML() {
  const runSync = () => {
    toast.promise(
      new Promise((res) => setTimeout(() => res(), 1200)),
      { loading: 'Menjalankan sinkronisasi...', success: 'Sinkronisasi selesai (simulasi)', error: 'Sinkronisasi gagal' }
    );
  };

  return (
    <div className="page-card">
      <h2>Sinkronisasi Model ML</h2>
      <p>Trigger sinkronisasi SQL → model (.pkl) (simulasi).</p>
      <button onClick={runSync}>Jalankan Sinkronisasi</button>
    </div>
  );
}
