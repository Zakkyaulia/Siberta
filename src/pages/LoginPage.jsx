import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, Cpu, Lock, User } from 'lucide-react';
import './LoginPage.css';

const CREDENTIALS = { username: 'tes123', password: 'tes123' };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = 'Username wajib diisi';
    if (!form.password)        e.password = 'Password wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200)); // simulate API

    if (form.username === CREDENTIALS.username && form.password === CREDENTIALS.password) {
      toast.success('Login berhasil! Selamat datang 👋', {
        icon: '🎉',
        style: { borderLeft: '4px solid #10b981' },
      });
      login();
      navigate('/dashboard/profil');
    } else {
      toast.error('Username atau password salah. Silakan coba lagi.', {
        icon: '🚫',
        style: { borderLeft: '4px solid #ef4444' },
      });
      setErrors({ general: 'Kredensial tidak valid' });
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      {/* Animated background blobs */}
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="grid-overlay" />
      </div>

      <div className="login-container fade-in">
        {/* Left Panel - Branding */}
        <div className="login-left">
          <div className="brand-logo">
            <div className="brand-icon-wrap">
              <Cpu size={32} strokeWidth={1.5} />
            </div>
          </div>

          <div className="brand-text">
            <h1>SiBerTA</h1>
            <p className="brand-tagline">Sistem Identifikasi Kemiripan Topik Tugas Akhir</p>
          </div>

          <div className="brand-features">
            {[
              { icon: '🧠', title: 'SBERT Powered', desc: 'Semantic Sentence-BERT untuk pemahaman kontekstual judul TA' },
              { icon: '📊', title: 'Cosine Similarity', desc: 'Deteksi kemiripan topik dengan akurasi tinggi' },
              { icon: '🎓', title: 'Sistem Informasi Unand', desc: 'Dirancang untuk mahasiswa dan dosen FTI Unand' },
            ].map((f, i) => (
              <div className="feature-item" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="feature-emoji">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="brand-footer">
            <BookOpen size={14} />
            <span>Universitas Andalas · Sistem Informasi · 2024</span>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="login-right">
          <div className="login-header">
            <h2>Masuk ke Sistem</h2>
            <p>Masukkan kredensial Anda untuk mengakses SiBerTA</p>
          </div>

          {errors.general && (
            <div className="error-banner">
              <span>⚠️</span> {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className={`input-wrap ${errors.username ? 'is-error' : ''}`}>
                <User size={17} className="input-icon" />
                <input
                  id="username"
                  type="text"
                  className="input-field"
                  placeholder="Masukkan username"
                  value={form.username}
                  onChange={e => { setForm(p => ({ ...p, username: e.target.value })); setErrors(p => ({ ...p, username: '' })); }}
                  autoComplete="username"
                />
              </div>
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className={`input-wrap ${errors.password ? 'is-error' : ''}`}>
                <Lock size={17} className="input-icon" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={e => { setForm(p => ({ ...p, password: e.target.value })); setErrors(p => ({ ...p, password: '' })); }}
                  autoComplete="current-password"
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-hint">
              <span>Demo: <strong>tes123</strong> / <strong>tes123</strong></span>
            </div>

            <button type="submit" className="btn btn-primary login-btn" disabled={loading} id="login-submit-btn">
              {loading ? (
                <><div className="spinner" /> Memverifikasi...</>
              ) : (
                'Masuk ke Sistem'
              )}
            </button>
          </form>

          <div className="login-footer-note">
            <span>🔒 Sistem ini hanya untuk mahasiswa Sistem Informasi Unand yang terdaftar</span>
          </div>
        </div>
      </div>
    </div>
  );
}
