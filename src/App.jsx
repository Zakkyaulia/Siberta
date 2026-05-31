import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

// Halaman Umum
import ProfilPage from './pages/ProfilPage';

// Halaman Mahasiswa
import MahasiswaDashboard from './pages/MahasiswaDashboard';
import CekTAPage from './pages/CekTAPage';
import RiwayatStatus from './pages/RiwayatStatus';
import SBERTSim from './pages/SBERTSim';

// Halaman Dosen
import DosenDashboard from './pages/DosenDashboard';
import DaftarMasuk from './pages/DaftarMasuk';
import LogBimbingan from './pages/LogBimbingan';

// Halaman Admin
import AdminDashboard from './pages/AdminDashboard';
import ValidasiAkhir from './pages/ValidasiAkhir';
import MasterDataTA from './pages/MasterDataTA';
import ManajemenUser from './pages/ManajemenUser';

function getDashboardPathByRole(role) {
  const normalizedRole = (role || 'mahasiswa').toString().toLowerCase();

  if (normalizedRole === 'dosen') {
    return '/dashboard/dosen';
  }

  if (normalizedRole === 'departemen' || normalizedRole === 'admin') {
    return '/dashboard/admin';
  }

  return '/dashboard/mahasiswa';
}

// Pelindung rute umum
function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    const userRole = (user?.role || '').toString().toLowerCase();

    const allowed = allowedRoles.map((role) =>
      role.toString().toLowerCase()
    );

    if (!allowed.includes(userRole)) {
      return <Navigate to={getDashboardPathByRole(userRole)} replace />;
    }
  }

  return children || <Outlet />;
}

// Mencegah user yang sudah login balik ke halaman login
function PublicRoute({ children }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return children;
  }

  return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
}

// Redirect default /dashboard berdasarkan role
function DashboardIndex() {
  const { user } = useAuth();

  return <Navigate to={getDashboardPathByRole(user?.role)} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />

        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardIndex />} />

            {/* Profil bisa diakses semua role */}
            <Route path="profil" element={<ProfilPage />} />

            {/* SBERT Simulasi, bisa diakses umum kalau memang dibutuhkan */}
            <Route path="sbert" element={<SBERTSim />} />

            {/* Rute Khusus Mahasiswa */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['mahasiswa']} />
              }
            >
              <Route path="mahasiswa" element={<MahasiswaDashboard />} />
              <Route path="cek-ta" element={<CekTAPage />} />
              <Route path="form-pengajuan" element={<Navigate to="/dashboard/cek-ta" replace />} />
              <Route path="riwayat" element={<RiwayatStatus />} />
            </Route>

            {/* Rute Khusus Dosen */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['dosen']} />
              }
            >
              <Route path="dosen" element={<DosenDashboard />} />
              <Route path="daftar-masuk" element={<DaftarMasuk />} />
              <Route path="log-bimbingan" element={<LogBimbingan />} />
            </Route>

            {/* Rute Khusus Admin / Departemen */}
            <Route
              element={
                <ProtectedRoute allowedRoles={['departemen', 'admin']} />
              }
            >
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="validasi" element={<ValidasiAkhir />} />
              <Route path="master-data" element={<MasterDataTA />} />
              <Route path="manajemen-user" element={<ManajemenUser />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
