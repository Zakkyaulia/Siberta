import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  User, Search, LogOut, Cpu, ChevronRight,
  Menu, X, Bell, GraduationCap
} from 'lucide-react';
import './DashboardLayout.css';

const MENU = [
  { to: '/dashboard/profil',  icon: User,   label: 'Profil Mahasiswa', desc: 'Data diri & informasi akademik' },
  { to: '/dashboard/cek-ta',  icon: Search, label: 'Cek Kemiripan TA',  desc: 'Deteksi kemiripan topik' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    toast.success('Berhasil logout. Sampai jumpa! 👋');
    setTimeout(() => { logout(); navigate('/login'); }, 800);
  };

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
          <div className="sidebar-avatar">{user.avatar}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user.nama.split(' ').slice(0, 2).join(' ')}</span>
            <span className="sidebar-user-nim">{user.nim}</span>
          </div>
          <div className="sidebar-user-status" title="Status aktif">
            <div className="status-dot" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <span className="nav-section-label">Menu Utama</span>
          {MENU.map(({ to, icon: Icon, label, desc }) => (
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
          ))}
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
            <div className="topbar-avatar" title={user.nama}>
              {user.avatar}
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
