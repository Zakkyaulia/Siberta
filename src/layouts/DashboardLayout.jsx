import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Search, LogOut, Cpu, ChevronRight,
  Menu, X, Bell, GraduationCap
} from 'lucide-react';
import './DashboardLayout.css';

const ROLE_MENUS = {
  mahasiswa: [
    { to: '/dashboard/mahasiswa', icon: User, label: 'Dashboard', desc: 'Ringkasan pengajuan & notifikasi' },
    { to: '/dashboard/cek-ta', icon: Search, label: 'Cek Kemiripan', desc: 'Deteksi kemiripan topik (SBERT)' },
    { to: '/dashboard/form-pengajuan', icon: GraduationCap, label: 'Form Pengajuan', desc: 'Ajukan judul ke dosen pembimbing' },
    { to: '/dashboard/riwayat', icon: LogOut, label: 'Riwayat Status', desc: 'Lihat riwayat pengajuan' },
  ],
  dosen: [
    { to: '/dashboard/dosen', icon: User, label: 'Dashboard Dosen', desc: 'Ringkasan tugas bimbingan' },
    { to: '/dashboard/daftar-masuk', icon: Search, label: 'Daftar Masuk', desc: 'Pengajuan mahasiswa masuk' },
    { to: '/dashboard/log-bimbingan', icon: LogOut, label: 'Log Bimbingan', desc: 'Catatan bimbingan mahasiswa' },
  ],
  departemen: [
    { to: '/dashboard/admin', icon: User, label: 'Dashboard Admin', desc: 'Ringkasan administrasi' },
    { to: '/dashboard/validasi', icon: Search, label: 'Validasi Akhir', desc: 'Validasi final pengajuan' },
    { to: '/dashboard/master-data', icon: GraduationCap, label: 'Master Data TA', desc: 'Kelola basis data judul TA' },
    { to: '/dashboard/manajemen-user', icon: User, label: 'Manajemen User', desc: 'Tambah / edit data user' },
    { to: '/dashboard/sync-ml', icon: Cpu, label: 'Sinkronisasi ML', desc: 'Sinkronisasi SQL -> model (.pkl)' },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    toast.success('Berhasil logout. Sampai jumpa! 👋');
    setTimeout(() => { logout(); navigate('/login'); }, 800);
  };

  // PENTING: Proteksi jika data user masih loading/kosong
  // Fallback (cadangan) agar aplikasi tidak crash
  const namaUser = user?.nama || 'Mahasiswa';
  // Ambil inisial untuk avatar cadangan jika tidak ada gambar
  const inisial = namaUser.charAt(0).toUpperCase(); 
  const nimUser = user?.username || 'Tidak ada NIM'; // Asumsi username dipakai sebagai NIM

  return (
    <div className="dashboard-root">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Cpu size={22} strokeWidth={1.5} />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">SiBerTA</span>
              <span className="sidebar-brand-sub">Unand · Sistem Informasi</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User Mini Card */}
        <div className="sidebar-user-card">
          {/* PERBAIKAN: Gunakan inisial jika avatar tidak ada dari backend */}
          <div className="sidebar-avatar" style={{ backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {user?.avatar || inisial}
          </div>
          <div className="sidebar-user-info">
            {/* PERBAIKAN: Pakai optional chaining dan ambil nama aman */}
            <span className="sidebar-user-name">{namaUser.split(' ').slice(0, 2).join(' ')}</span>
            <span className="sidebar-user-nim">{nimUser}</span>
          </div>
          <div className="sidebar-user-status" title="Status aktif">
            <div className="status-dot" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu Utama</span>
          {(() => {
            const role = (user?.role || 'mahasiswa').toLowerCase();
            const menu = ROLE_MENUS[role] || ROLE_MENUS.mahasiswa;
            return menu.map(({ to, icon: Icon, label, desc }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-item-icon">
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div className="nav-item-text">
                  <span className="nav-label">{label}</span>
                  <span className="nav-desc">{desc}</span>
                </div>
                <ChevronRight size={15} className="nav-chevron" />
              </NavLink>
            ));
          })()}
        </nav>

        <div className="sidebar-divider" />

        {/* Logout */}
        <button className="nav-item logout-item" onClick={handleLogout} id="logout-btn">
          <div className="nav-item-icon">
            <LogOut size={19} strokeWidth={2} />
          </div>
          <div className="nav-item-text">
            <span className="nav-label">Logout</span>
            <span className="nav-desc">Keluar dari sistem</span>
          </div>
        </button>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <GraduationCap size={13} />
          <span>FTI Unand · v1.0.0</span>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="topbar-title-area">
            <div className="topbar-breadcrumb">
              <span>SiBerTA</span>
              <ChevronRight size={13} />
              <span className="topbar-page-name">Dashboard</span>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="topbar-icon-btn" title="Notifikasi">
              <Bell size={18} />
              <span className="notif-dot" />
            </button>
            <div className="topbar-avatar" title={namaUser} style={{ backgroundColor: '#0ea5e9', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
               {/* PERBAIKAN: Gunakan inisial untuk topbar avatar */}
              {user?.avatar || inisial}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}