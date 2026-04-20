import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import ProfilPage from './pages/ProfilPage';
import CekTAPage from './pages/CekTAPage';

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
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
