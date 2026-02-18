"use client";
import React, { useState } from 'react';

export default function AuthLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = { username: fd.get('username'), password: fd.get('password') };
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {throw new Error('Giriş başarısız');}
      window.location.href = '/admin/dashboard';
    } catch {
      setError('Kullanıcı adı veya şifre hatalı.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 1rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem', color: '#fff', marginBottom: '0.75rem' }}>HK</div>
          <h1 style={{ color: '#f1f5f9', fontSize: '1.35rem', fontWeight: 600, marginBottom: '0.25rem' }}>HK Akademi</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Yönetim Paneline Giriş</p>
        </div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 12, padding: '2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
          {error && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: 8, fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }} htmlFor="username">Kullanıcı Adı</label>
            <input
              id="username"
              name="username"
              required
              autoFocus
              style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }}
              placeholder="admin"
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }} htmlFor="password">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              style={{ width: '100%', padding: '0.7rem 1rem', fontSize: '0.9rem', border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none' }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '0.8rem', fontSize: '0.9rem', fontWeight: 600, background: loading ? '#94a3b8' : '#3b82f6', color: 'white', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
