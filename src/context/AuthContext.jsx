import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user] = useState({
    nama: 'Muhammad Rizky Fauzan',
    nim: '2110953014',
    prodi: 'Sistem Informasi',
    angkatan: '2021',
    email: 'rizky.fauzan@student.unand.ac.id',
    pembimbing: 'Dr. Ir. Ahmad Syafii, M.T.',
    status: 'Aktif',
    avatar: 'RF',
  });

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
