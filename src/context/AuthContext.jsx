import { createContext, useState, useContext } from 'react';
import axios from 'axios';

// 1. Inisialisasi Context
export const AuthContext = createContext();

// 2. Buat Provider untuk membungkus aplikasi
export const AuthProvider = ({ children }) => {
    // Mencegah data user hilang saat di-refresh dengan membacanya dari localStorage
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    const isLoggedIn = !!token;
    
    // Fungsi untuk login
    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            
            const { token: newToken, user: userData } = response.data;
            
            // Simpan token DAN data user ke Local Storage
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData)); // <-- INI YANG BARU
            
            setToken(newToken);
            setUser(userData);
            
            return { success: true };
        } catch (error) {
            console.error("Login gagal", error);
            return { 
                success: false, 
                message: error.response?.data?.pesan || "Terjadi kesalahan server" 
            };
        }
    };

    // Fungsi untuk logout
    const logout = () => {
        // Hapus token DAN data user dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // <-- INI YANG BARU
        
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Custom Hook useAuth
export const useAuth = () => {
    return useContext(AuthContext);
};