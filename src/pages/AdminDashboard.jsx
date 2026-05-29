import React from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const adminMenus = [
    {
      title: 'Manajemen User',
      desc: 'Kelola akun mahasiswa, dosen, dan admin.',
      icon: '👥',
    },
    {
      title: 'Master Data TA',
      desc: 'Kelola daftar judul atau topik tugas akhir.',
      icon: '📚',
    },
    {
      title: 'Daftar Masuk',
      desc: 'Lihat pengajuan judul yang masuk dari mahasiswa.',
      icon: '📥',
    },
    {
      title: 'Sinkronisasi ML',
      desc: 'Sinkronkan data TA untuk kebutuhan model rekomendasi.',
      icon: '🤖',
    },
  ];

  const stats = [
    {
      label: 'Total Modul',
      value: '4',
      desc: 'Fitur admin aktif',
    },
    {
      label: 'Role Sistem',
      value: '3',
      desc: 'Admin, dosen, mahasiswa',
    },
    {
      label: 'Status',
      value: 'Aktif',
      desc: 'Dashboard siap digunakan',
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-content">
          <span className="admin-badge">Dashboard Administrator</span>
          <h2>Dashboard Admin</h2>
          <p>
            Ringkasan administrasi departemen untuk mengelola user, data tugas akhir,
            pengajuan judul, dan sinkronisasi model ML.
          </p>
        </div>

        <div className="admin-hero-icon">
          🛠️
        </div>
      </div>

      <div className="admin-stats">
        {stats.map((item, index) => (
          <div className="admin-stat-card" key={index}>
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            <span>{item.desc}</span>
          </div>
        ))}
      </div>

      <div className="admin-section">
        <div className="admin-section-header">
          <div>
            <h3>Menu Administrasi</h3>
            <p>Pilih fitur administrasi yang ingin dikelola.</p>
          </div>
        </div>

        <div className="admin-menu-grid">
          {adminMenus.map((menu, index) => (
            <div className="admin-menu-card" key={index}>
              <div className="admin-menu-icon">
                {menu.icon}
              </div>

              <div>
                <h4>{menu.title}</h4>
                <p>{menu.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-info-card">
        <div className="admin-info-icon">
          ℹ️
        </div>

        <div>
          <h3>Informasi Dashboard</h3>
          <p>
            Halaman ini digunakan sebagai pusat akses fitur administrator. Admin dapat
            mengelola data pengguna, memperbarui master data TA, memantau pengajuan,
            serta menjalankan proses sinkronisasi model ML.
          </p>
        </div>
      </div>
    </div>
  );
}