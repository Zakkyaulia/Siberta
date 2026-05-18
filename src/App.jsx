import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';

// Halaman-Halaman
import ProfilPage from './pages/ProfilPage';
import CekTAPage from './pages/CekTAPage';
import MahasiswaDashboard from './pages/MahasiswaDashboard';
import FormPengajuan from './pages/FormPengajuan';
import RiwayatStatus from './pages/RiwayatStatus';
import SBERTSim from './pages/SBERTSim';
import DosenDashboard from './pages/DosenDashboard';
import DaftarMasuk from './pages/DaftarMasuk';
import LogBimbingan from './pages/LogBimbingan';
import AdminDashboard from './pages/AdminDashboard';
import ValidasiAkhir from './pages/ValidasiAkhir';
import MasterDataTA from './pages/MasterDataTA';
import ManajemenUser from './pages/ManajemenUser';
import SyncML from './pages/SyncML';

// 1. Pelindung Rute Umum (Cek Login)
function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  // Jika rute butuh role spesifik dan user tidak memilikinya, arahkan ke /dashboard
  if (allowedRoles) {
    const userRole = (user?.role || '').toString().toLowerCase();
    const allowed = allowedRoles.map(r => r.toString().toLowerCase());
    if (!allowed.includes(userRole)) return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}

// 2. Pelindung Rute Publik (Mencegah user yang sudah login balik ke login)
function PublicRoute({ children }) {
  const { isLoggedIn, user } = useAuth();
  if (!isLoggedIn) return children;
  
  // Jika sudah login, redirect ke dashboard sesuai role
  const role = (user?.role || 'mahasiswa').toLowerCase();
  if (role === 'dosen') return <Navigate to="/dashboard/dosen" replace />;
  if (role === 'departemen' || role === 'admin') return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/dashboard/mahasiswa" replace />;
}

// Redirect ke halaman dashboard yang sesuai berdasarkan role
function DashboardIndex() {
  const { user } = useAuth();
  const role = (user?.role || 'mahasiswa').toLowerCase();

  if (role === 'dosen') return <Navigate to="daftar-masuk" replace />;
  if (role === 'departemen' || role === 'admin') return <Navigate to="admin" replace />;
  // Default mahasiswa
  return <Navigate to="mahasiswa" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route
              index
              element={<DashboardIndex />}
            />
            <Route path="profil" element={<ProfilPage />} />

            {/* Landing redirect depending on role */}
            

            {/* --- RUTE KHUSUS MAHASISWA --- */}
            <Route path="mahasiswa" element={<MahasiswaDashboard />} />
            <Route path="sbert" element={<SBERTSim />} />
            <Route element={<ProtectedRoute allowedRoles={['mahasiswa']} />}>
              <Route path="cek-ta" element={<CekTAPage />} />
              <Route path="form-pengajuan" element={<FormPengajuan />} />
              <Route path="riwayat" element={<RiwayatStatus />} />
            </Route>

            {/* --- RUTE KHUSUS DOSEN --- */}
            <Route element={<ProtectedRoute allowedRoles={['dosen']} />}>
              <Route path="dosen" element={<DosenDashboard />} />
              <Route path="daftar-masuk" element={<DaftarMasuk />} />
              <Route path="log-bimbingan" element={<LogBimbingan />} />
            </Route>

            {/* --- RUTE KHUSUS ADMIN/DEPARTEMEN --- */}
            <Route element={<ProtectedRoute allowedRoles={['departemen','admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="validasi" element={<ValidasiAkhir />} />
              <Route path="master-data" element={<MasterDataTA />} />
              <Route path="manajemen-user" element={<ManajemenUser />} />
              <Route path="sync-ml" element={<SyncML />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;