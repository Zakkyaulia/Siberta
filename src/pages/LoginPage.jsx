import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Eye,
  EyeOff,
  BookOpen,
  Cpu,
  Lock,
  User,
} from 'lucide-react';
import './LoginPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};

    if (!form.username.trim()) {
      nextErrors.username = 'Username wajib diisi';
    }

    if (!form.password) {
      nextErrors.password = 'Password wajib diisi';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const getDashboardPathByRole = (role) => {
    const normalizedRole = (role || 'mahasiswa').toString().toLowerCase();

    if (normalizedRole === 'dosen') {
      return '/dashboard/dosen';
    }

    if (normalizedRole === 'departemen' || normalizedRole === 'admin') {
      return '/dashboard/admin';
    }

    return '/dashboard/mahasiswa';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    const result = await login(form.username, form.password);

    if (result.success) {
      toast.success('Login berhasil');

      const role = result?.user?.role || result?.data?.role;
      navigate(getDashboardPathByRole(role));
    } else {
      toast.error(result.message || 'Login gagal. Silakan coba lagi.');
      setErrors({
        general: result.message || 'Kredensial tidak valid',
      });
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="gradient-orb orb-one" />
        <div className="gradient-orb orb-two" />
        <div className="gradient-orb orb-three" />
        <div className="grid-overlay" />
      </div>

      <div className="login-container fade-in">
        <div className="login-left">
          <div className="brand-center">
            <div className="brand-logo">
              <div className="brand-icon-wrap">
                <Cpu size={32} strokeWidth={1.6} />
              </div>
            </div>

            <div className="brand-text">
              <h1>SiBerTA</h1>
              <p className="brand-tagline">
                Sistem Identifikasi Kemiripan Topik Tugas Akhir
              </p>
            </div>
          </div>

          <div className="brand-footer">
            <BookOpen size={14} />
            <span>Universitas Andalas · Sistem Informasi · 2026</span>
          </div>
        </div>

        <div className="login-right">
          <div className="login-header">
            <h2>Masuk ke Sistem</h2>
            <p>Masukkan kredensial Anda untuk mengakses SiBerTA</p>
          </div>

          {errors.general && (
            <div className="error-banner">
              {errors.general}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="login-form"
            noValidate
          >
            <div className="login-form-group">
              <label htmlFor="username">Username</label>

              <div className={`login-input-wrap ${errors.username ? 'is-error' : ''}`}>
                <User size={17} className="login-input-icon" />

                <input
                  id="username"
                  type="text"
                  className="login-input"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      username: '',
                    }));
                  }}
                  autoComplete="username"
                />
              </div>

              {errors.username && (
                <span className="field-error">
                  {errors.username}
                </span>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <div className={`login-input-wrap ${errors.password ? 'is-error' : ''}`}>
                <Lock size={17} className="login-input-icon" />

                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));

                    setErrors((prev) => ({
                      ...prev,
                      password: '',
                    }));
                  }}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass((value) => !value)}
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {errors.password && (
                <span className="field-error">
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-hint">
              Pastikan username dan password sudah terdaftar di database
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          <div className="login-footer-note">
            Sistem ini hanya untuk pengguna yang terdaftar.
          </div>
        </div>
      </div>
    </div>
  );
}