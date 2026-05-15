import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
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

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return !isLoggedIn ? children : <Navigate to="/dashboard/profil" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(14, 165, 233, 0.15)',
              border: '1px solid #e0f2fe',
              fontFamily: "'Poppins', sans-serif",
              fontSize: '14px',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}
          >
            <Route index element={<Navigate to="profil" replace />} />
            <Route path="profil" element={<ProfilPage />} />
            <Route path="cek-ta" element={<CekTAPage />} />
            <Route path="mahasiswa" element={<MahasiswaDashboard />} />
            <Route path="form-pengajuan" element={<FormPengajuan />} />
            <Route path="riwayat" element={<RiwayatStatus />} />
            <Route path="sbert" element={<SBERTSim />} />

            {/* Dosen routes */}
            <Route path="dosen" element={<DosenDashboard />} />
            <Route path="daftar-masuk" element={<DaftarMasuk />} />
            <Route path="log-bimbingan" element={<LogBimbingan />} />

            {/* Departemen / Admin routes */}
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="validasi" element={<ValidasiAkhir />} />
            <Route path="master-data" element={<MasterDataTA />} />
            <Route path="manajemen-user" element={<ManajemenUser />} />
            <Route path="sync-ml" element={<SyncML />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
