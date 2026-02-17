"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  trainings: number;
  instructors: number;
  applications: number;
  pending: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ trainings: 0, instructors: 0, applications: 0, pending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [evRes, insRes, appRes] = await Promise.all([
          fetch('/api/trainings?limit=1'),
          fetch('/api/instructors?limit=1'),
          fetch('/api/applications'),
        ]);
        const [evJ, insJ, appJ] = await Promise.all([evRes.json(), insRes.json(), appRes.json()]);

        const trainings = evJ.total ?? (evJ.data?.length || 0);
        const instructors = insJ.total ?? (insJ.data?.length || 0);
        const apps = appJ.data || [];
        const pending = apps.filter((a: { status: string }) => a.status === 'pending').length;

        setStats({ trainings, instructors, applications: apps.length, pending });
      } catch (err) {
        console.error('[Dashboard] Stats load error', err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const cards = [
    {
      label: 'Aktif Eğitimler',
      value: stats.trainings,
      iconColor: '#3b82f6',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
      ),
      href: '/admin/trainings',
    },
    {
      label: 'Eğitmen Kadrosu',
      value: stats.instructors,
      iconColor: '#22c55e',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      ),
      href: '/admin/instructors',
    },
    {
      label: 'Toplam Başvuru',
      value: stats.applications,
      iconColor: '#eab308',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15a2.25 2.25 0 0 1 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
        </svg>
      ),
      href: '/admin/applications',
    },
    {
      label: 'Bekleyen Formlar',
      value: stats.pending,
      iconColor: '#ef4444',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      href: '/admin/applications',
    },
  ];

  return (
    <div>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {cards.map((c) => (
          <Link href={c.href} key={c.label} className="admin-stat-card admin-card" style={{ textDecoration: 'none' }}>
            <div className="admin-stat-icon">
              {c.icon}
            </div>
            <div>
              <div className="admin-stat-label">{c.label}</div>
              <div className="admin-stat-value">
                {loading ? '—' : c.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Quick actions */}
        <div className="admin-card">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ width: 4, height: 18, background: 'var(--admin-accent)', borderRadius: 2 }}></span>
            Hızlı Erişim
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Link href="/admin/trainings" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start' }}>
              + Yeni Eğitim
            </Link>
            <Link href="/admin/instructors" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start' }}>
              + Yeni Eğitmen
            </Link>
            <Link href="/admin/applications" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start' }}>
              Başvuruları Yönet
            </Link>
            <Link href="/admin/pages" className="admin-btn admin-btn-secondary" style={{ justifyContent: 'flex-start' }}>
              Sayfa İçerikleri
            </Link>
          </div>
        </div>

        <div className="admin-card" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', border: 'none' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>HK Akademi Panel</h2>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem' }}>Hoş geldin kral. Akademi verileri güvende, içerikler kontrolünde.</p>
          <div style={{ marginTop: 'auto' }}>
            <Link href="/" target="_blank" className="admin-btn admin-btn-primary" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
              Siteyi Önizle
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
