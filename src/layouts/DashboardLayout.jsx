import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
   User,
  Search,
  LogOut,
  Cpu,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  Clock,
  Inbox,
  BookOpen,
  ShieldCheck,
  Database,
  Users,
} from 'lucide-react';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // allow closing sidebar with Escape key for accessibility
  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // KONFIGURASI MENU BERDASARKAN ROLE
const menuConfig = {
  mahasiswa: [
    {
      to: '/dashboard/mahasiswa',
      icon: LayoutDashboard,
      label: 'Dashboard',
      desc: 'Ringkasan aktivitas',
    },
    {
      to: '/dashboard/profil',
      icon: User,
      label: 'Profil Saya',
      desc: 'Data akademik',
    },
    {
      to: '/dashboard/cek-ta',
      icon: Search,
      label: 'Cek & Ajukan TA',
      desc: 'Analisis dan kirim judul',
    },
    {
      to: '/dashboard/riwayat',
      icon: Clock,
      label: 'Riwayat Status',
      desc: 'Pantau persetujuan',
    },
  ],

  dosen: [
    {
      to: '/dashboard/dosen',
      icon: LayoutDashboard,
      label: 'Dashboard',
      desc: 'Ringkasan dosen',
    },
    {
      to: '/dashboard/profil',
      icon: User,
      label: 'Profil Dosen',
      desc: 'Informasi pengajar',
    },
    {
      to: '/dashboard/daftar-masuk',
      icon: Inbox,
      label: 'Daftar Masuk',
      desc: 'Review judul MHS',
    },
    {
      to: '/dashboard/log-bimbingan',
      icon: BookOpen,
      label: 'Log Bimbingan',
      desc: 'Catatan konsultasi',
    },
  ],

  admin: [
    {
      to: '/dashboard/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      desc: 'Ringkasan sistem',
    },
    {
      to: '/dashboard/profil',
      icon: User,
      label: 'Profil Admin',
      desc: 'Informasi admin',
    },
    {
      to: '/dashboard/validasi',
      icon: ShieldCheck,
      label: 'Validasi Akhir',
      desc: 'Persetujuan Prodi',
    },
    {
      to: '/dashboard/master-data',
      icon: Database,
      label: 'Arsip TA Tersinkron',
      desc: 'Data TA resmi',
    },
    {
      to: '/dashboard/manajemen-user',
      icon: Users,
      label: 'Manajemen User',
      desc: 'Kelola akun',
    },
  ],

  departemen: [
    {
      to: '/dashboard/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      desc: 'Ringkasan sistem',
    },
    {
      to: '/dashboard/profil',
      icon: User,
      label: 'Profil Admin',
      desc: 'Informasi admin',
    },
    {
      to: '/dashboard/validasi',
      icon: ShieldCheck,
      label: 'Validasi Akhir',
      desc: 'Persetujuan Prodi',
    },
    {
      to: '/dashboard/master-data',
      icon: Database,
      label: 'Arsip TA Tersinkron',
      desc: 'Data TA resmi',
    },
    {
      to: '/dashboard/manajemen-user',
      icon: Users,
      label: 'Manajemen User',
      desc: 'Kelola akun',
    },
  ],
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
      {sidebarOpen && isMobile && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

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
          {activeMenu.map(({ to, icon, label, desc }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="nav-item-icon">{React.createElement(icon, { size: 19 })}</div>
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
            {/* <button className="topbar-icon-btn"><Bell size={18} /><span className="notif-dot" /></button> */}
            <div className="topbar-avatar" style={{ backgroundColor: '#0ea5e9', color: 'white' }}>{inisial}</div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
