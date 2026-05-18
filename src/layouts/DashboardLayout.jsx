import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Search, LogOut, Cpu, ChevronRight,
  Menu, X, Bell, GraduationCap, FilePlus, 
  Clock, Inbox, BookOpen, ShieldCheck, Database, Users, RefreshCw
} from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // KONFIGURASI MENU BERDASARKAN ROLE
  const menuConfig = {
    mahasiswa: [
      { to: '/dashboard/profil', icon: User, label: 'Profil Saya', desc: 'Data akademik' },
      { to: '/dashboard/cek-ta', icon: Search, label: 'Cek Kemiripan', desc: 'Analisis AI SBERT' },
      { to: '/dashboard/form-pengajuan', icon: FilePlus, label: 'Ajukan Judul', desc: 'Formulir TA' },
      { to: '/dashboard/riwayat', icon: Clock, label: 'Riwayat Status', desc: 'Pantau persetujuan' },
    ],
    dosen: [
      { to: '/dashboard/profil', icon: User, label: 'Profil Dosen', desc: 'Informasi pengajar' },
      { to: '/dashboard/daftar-masuk', icon: Inbox, label: 'Daftar Masuk', desc: 'Review judul MHS' },
      { to: '/dashboard/log-bimbingan', icon: BookOpen, label: 'Log Bimbingan', desc: 'Catatan konsultasi' },
    ],
    admin: [
      { to: '/dashboard/profil', icon: User, label: 'Dashboard Admin', desc: 'Ringkasan sistem' },
      { to: '/dashboard/validasi-akhir', icon: ShieldCheck, label: 'Validasi Akhir', desc: 'Persetujuan Prodi' },
      { to: '/dashboard/master-data', icon: Database, label: 'Master Data TA', desc: 'Basis data resmi' },
      { to: '/dashboard/manajemen-user', icon: Users, label: 'Manajemen User', desc: 'Kelola akun' },
      { to: '/dashboard/sync-ml', icon: RefreshCw, label: 'Sync Model ML', desc: 'Latih ulang AI' },
    ]
  };

  const roleKey = (user?.role || '').toString().toLowerCase();
  const activeMenu = menuConfig[roleKey] || [];

  const handleLogout = () => {
    toast.success('Berhasil logout. Sampai jumpa! 👋');
    setTimeout(() => { logout(); navigate('/login'); }, 800);
  };

  const namaUser = user?.nama || 'Pengguna';
  const inisial = namaUser.charAt(0).toUpperCase();

  return (
    <div className="dashboard-root">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon"><Cpu size={22} strokeWidth={1.5} /></div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-name">SiBerTA</span>
              <span className="sidebar-brand-sub">{user?.role?.toUpperCase()} MODE</span>
            </div>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
        </div>

        <div className="sidebar-user-card">
          <div className="sidebar-avatar" style={{ backgroundColor: '#0ea5e9', color: 'white' }}>
            {inisial}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{namaUser}</span>
            <span className="sidebar-user-nim" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Navigasi Utama</span>
          {activeMenu.map(({ to, icon: Icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-icon"><Icon size={19} /></div>
              <div className="nav-item-text">
                <span className="nav-label">{label}</span>
                <span className="nav-desc">{desc}</span>
              </div>
              <ChevronRight size={15} className="nav-chevron" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-divider" />
        <button className="nav-item logout-item" onClick={handleLogout}>
          <div className="nav-item-icon"><LogOut size={19} /></div>
          <div className="nav-item-text">
            <span className="nav-label">Keluar</span>
            <span className="nav-desc">Sesi akan berakhir</span>
          </div>
        </button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="topbar-menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <div className="topbar-title-area">
            <div className="topbar-breadcrumb">
              <span>SiBerTA</span>
              <ChevronRight size={13} />
              <span className="topbar-page-name" style={{ textTransform: 'capitalize' }}>{user?.role} Area</span>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="topbar-icon-btn"><Bell size={18} /><span className="notif-dot" /></button>
            <div className="topbar-avatar" style={{ backgroundColor: '#0ea5e9', color: 'white' }}>{inisial}</div>
          </div>
        </header>

        {import.meta.env.DEV && (
          <div style={{padding:12, background:'#fff7ed', borderTop:'1px solid #fde68a'}}>
            <strong>DEBUG:</strong> user = {JSON.stringify(user)}
          </div>
        )}

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}