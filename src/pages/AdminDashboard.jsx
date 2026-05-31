import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Database,
  ShieldCheck,
  UserCog,
  Activity,
  Layers,
  CheckCircle2,
  ArrowRight,
  Info,
} from 'lucide-react';
import './AdminDashboard.css';
import api, { setAuthToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [totalPengguna, setTotalPengguna] = useState('-');
  const [totalDataTA, setTotalDataTA] = useState('-');

  useEffect(() => {
    const loadDashboardStats = async () => {
      setAuthToken(token);

      try {
        const resUsers = await api.get('/api/admin/users');
        const totalUsers = Array.isArray(resUsers.data?.data) ? resUsers.data.data.length : 0;
        setTotalPengguna(totalUsers);
      } catch (error) {
        console.error(error);
        setTotalPengguna('-');
      }

      try {
        const resTA = await api.get('/api/admin/master-titles');
        const totalTA = Array.isArray(resTA.data?.data) ? resTA.data.data.length : 0;
        setTotalDataTA(totalTA);
      } catch (error) {
        console.error(error);
        setTotalDataTA('-');
      }
    };

    if (token) loadDashboardStats();
  }, [token]);

  const adminMenus = [
    {
      title: 'Manajemen User',
      desc: 'Kelola akun mahasiswa, dosen, dan administrator sistem.',
      icon: Users,
      path: '/dashboard/manajemen-user',
    },
    {
      title: 'Arsip TA',
      desc: 'Kelola daftar judul, tema, dan data tugas akhir.',
      icon: Database,
      path: '/dashboard/master-data',
    },
    {
      title: 'Validasi Akhir',
      desc: 'Lakukan validasi akhir terhadap pengajuan tugas akhir.',
      icon: ShieldCheck,
      path: '/dashboard/validasi',
    },
  
  ];

  const stats = [
    {
      label: 'Total Data TA',
      value: totalDataTA,
      desc: 'Jumlah data tugas akhir tersimpan',
      icon: Layers,
    },
    {
      label: 'Total Pengguna',
      value: totalPengguna,
      desc: 'Jumlah seluruh pengguna terdaftar',
      icon: UserCog,
    },
    {
      label: 'Status Sistem',
      value: 'Aktif',
      desc: 'Dashboard siap digunakan',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="admin-page">
      <section className="admin-hero">
        <div className="admin-hero-content">
          <div className="admin-badge">
            <LayoutDashboard size={15} />
            <span>Dashboard Administrator</span>
          </div>

          <h2>Dashboard Admin</h2>

          <p>
            Pusat administrasi untuk mengelola pengguna, master data tugas akhir,
            validasi pengajuan, dan sinkronisasi data sistem.
          </p>
        </div>

        <div className="admin-hero-icon">
          <LayoutDashboard size={46} strokeWidth={1.7} />
        </div>
      </section>

      <section className="admin-stats">
        {stats.map((item, index) => {
          const Icon = item.icon;

          return (
            <div className="admin-stat-card" key={index}>
              <div className="admin-stat-icon">
                <Icon size={22} />
              </div>

              <div className="admin-stat-content">
                <p>{item.label}</p>
                <h3>{item.value}</h3>
                <span>{item.desc}</span>
              </div>
            </div>
          );
        })}
      </section>

      <section className="admin-section">
        <div className="admin-section-header">
          <div>
            <h3>Menu Administrasi</h3>
            <p>Pilih fitur yang ingin dikelola pada sistem.</p>
          </div>
        </div>

        <div className="admin-menu-grid">
          {adminMenus.map((menu, index) => {
            const Icon = menu.icon;

            return (
              <button
                type="button"
                className="admin-menu-card"
                key={index}
                onClick={() => navigate(menu.path)}
              >
                <div className="admin-menu-top">
                  <div className="admin-menu-icon">
                    <Icon size={23} />
                  </div>

                  <ArrowRight size={18} className="admin-menu-arrow" />
                </div>

                <div className="admin-menu-content">
                  <h4>{menu.title}</h4>
                  <p>{menu.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="admin-info-card">
        <div className="admin-info-icon">
          <Info size={20} />
        </div>

        <div>
          <h3>Informasi Dashboard</h3>
          <p>
            Halaman ini digunakan sebagai pusat akses administrator. Admin dapat
            mengelola akun, memperbarui master data TA, melakukan validasi akhir,
            dan menjalankan sinkronisasi data untuk model ML.
          </p>
        </div>
      </section>

      <section className="admin-activity-card">
        <div className="admin-activity-header">
          <div className="admin-activity-icon">
            <Activity size={20} />
          </div>

          <div>
            <h3>Ringkasan Aktivitas</h3>
            <p>Beberapa aktivitas administratif yang perlu dipantau.</p>
          </div>
        </div>

        <div className="admin-activity-list">
          <div className="admin-activity-item">
            <span className="activity-dot" />
            <div>
              <h4>Periksa pengajuan yang menunggu validasi</h4>
              <p>Pastikan pengajuan yang sudah disetujui dosen diproses oleh admin.</p>
            </div>
          </div>

          <div className="admin-activity-item">
            <span className="activity-dot" />
            <div>
              <h4>Perbarui master data tugas akhir</h4>
              <p>Data TA yang lengkap akan membantu proses pengecekan kemiripan.</p>
            </div>
          </div>

          <div className="admin-activity-item">
            <span className="activity-dot" />
            <div>
              <h4>Jalankan sinkronisasi model secara berkala</h4>
              <p>Sinkronisasi membantu model menggunakan data terbaru dari sistem.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}