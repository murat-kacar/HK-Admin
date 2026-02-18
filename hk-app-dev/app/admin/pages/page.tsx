"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

interface PageItem {
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

const PAGE_SLUGS = ['hakkimizda', 'sss', 'iletisim'];
const PAGE_LABELS: Record<string, string> = {
  hakkimizda: 'Akademi Hakkında',
  sss: 'Sıkça Sorulan Sorular',
  iletisim: 'İletişim & Konum',
};

const PAGE_DESC: Record<string, string> = {
  hakkimizda: 'Vizyonumuz, misyonumuz ve tarihimiz.',
  sss: 'Öğrenci adaylarının en çok sorduğu sorular.',
  iletisim: 'Adres bilgileri ve iletişim kanalları.',
};

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const results: PageItem[] = [];
    for (const slug of PAGE_SLUGS) {
      const r = await fetch(`/api/pages/${slug}`);
      if (r.ok) {
        const j = await r.json();
        results.push(j.data);
      }
    }
    setPages(results);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (slug: string) => {
    const page = pages.find((p) => p.slug === slug);
    if (page) {
      setForm({ title: page.title, content: page.content });
      setActive(slug);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) {return;}
    setSaving(true);
    const res = await fetch(`/api/pages/${active}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast?.toast({ title: 'Hata', description: 'Değişiklikler kaydedilemedi.', type: 'error' });
      return;
    }
    toast?.toast({ title: 'Kaydedildi', description: `${PAGE_LABELS[active] || active} sayfası güncellendi.`, type: 'success' });
    setActive(null);
    load();
  };

  if (loading) {return <div className="admin-loading"><span className="admin-spinner" /> Sayfalar taranıyor...</div>;}

  if (active) {
    return (
      <div style={{ maxWidth: 900 }}>
        <button onClick={() => setActive(null)} className="admin-btn admin-btn-secondary" style={{ marginBottom: '2rem' }}>
          ← Sayfalara Dön
        </button>

        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>{PAGE_LABELS[active] || active}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>İçerik ve yapılandırma</p>
            </div>
            <span className="admin-badge admin-badge-info" style={{ textTransform: 'lowercase' }}>/{active}</span>
          </div>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">Görünen Başlık</label>
              <input
                className="admin-input"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div style={{ marginBottom: '2rem' }}>
              <label className="admin-label">Sayfa İçeriği (Zengin Metin / HTML)</label>
              <textarea
                className="admin-textarea"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={20}
                style={{ fontFamily: 'Fira Code, monospace', fontSize: '0.85rem', lineHeight: 1.6, background: '#f8fafc', padding: '1.5rem' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Yayınla'}
              </button>
              <button type="button" onClick={() => setActive(null)} className="admin-btn admin-btn-secondary">
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {pages.map((p) => (
          <div key={p.slug} className="admin-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#1e293b', marginBottom: '0.25rem' }}>{PAGE_LABELS[p.slug] || p.slug}</div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>{PAGE_DESC[p.slug]}</p>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></div>
                Güncelleme: {p.updated_at ? new Date(p.updated_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
            <button onClick={() => openEdit(p.slug)} className="admin-btn admin-btn-secondary">
              İçeriği Düzenle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
