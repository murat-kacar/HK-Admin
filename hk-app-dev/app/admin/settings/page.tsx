"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => { setForm(data.data || {}); })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (k: string, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if (form.contact_email && !/^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(form.contact_email)) {
      setErrors('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    setSaving(true);
    const res = await fetch('/api/site-settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      const msg = j.error || 'Sunucu hatası';
      setErrors(msg);
      toast?.toast({ title: 'Hata', description: msg, type: 'error' });
      return;
    }
    toast?.toast({ title: 'Başarılı', description: 'Tüm ayarlar başarıyla güncellendi.', type: 'success' });
  };

  if (loading) return <div className="admin-loading"><span className="admin-spinner" /> Sistem taranıyor...</div>;

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '2.5rem', alignItems: 'start' }}>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <form onSubmit={handleSubmit}>
            {/* Genel Yapılandırma */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 4, height: 16, background: 'var(--admin-accent)', borderRadius: 2 }}></span>
                Genel Kimlik
              </h3>

              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div>
                  <label className="admin-label">Akademi / Site Başlığı</label>
                  <input className="admin-input" style={{ fontSize: '1rem', fontWeight: 600 }} value={form.site_title || ''} onChange={(e) => handleChange('site_title', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Meta Açıklaması (SEO)</label>
                  <textarea className="admin-textarea" value={form.site_description || ''} onChange={(e) => handleChange('site_description', e.target.value)} rows={4} style={{ fontSize: '0.85rem' }} />
                </div>
              </div>
            </div>

            {/* Teknik Detaylar */}
            <div className="admin-card" style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ width: 4, height: 16, background: 'var(--admin-accent)', borderRadius: 2 }}></span>
                Teknik & İletişim
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label className="admin-label">Sistem Bildirim E-postası</label>
                  <input className="admin-input" type="email" placeholder="admin@hkakademi.com" value={form.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Ana Alan Adı (Canonical)</label>
                  <input className="admin-input" placeholder="hkakademi.com" value={form.canonical_domain || ''} onChange={(e) => handleChange('canonical_domain', e.target.value)} />
                </div>
              </div>
              <p style={{ margin: '1rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
                * İletişim e-postası aday başvurularının yönlendirileceği adrestir.
              </p>
            </div>

            {errors && <div className="admin-error" style={{ marginBottom: '1.5rem' }}>{errors}</div>}

            <div style={{ position: 'sticky', bottom: 0, padding: '1.5rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button type="submit" disabled={saving} className="admin-btn admin-btn-primary" style={{ minWidth: 200, padding: '0.85rem' }}>
                {saving ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="admin-card" style={{ background: 'var(--admin-sidebar)', color: 'white', border: 'none' }}>
          <div style={{ marginBottom: '1.5rem', color: 'var(--admin-accent)' }}>
            <svg style={{ width: 24, height: 24 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700, fontSize: '0.95rem' }}>Dikkat Çekici Not</h4>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Burada yapılan değişiklikler sitenin SEO performansını ve iletişim kanallarını doğrudan etkiler. Canonical domain ayarını yaparken dikkatli olunması önerilir.
          </p>
        </div>

      </div>
    </div>
  );
}
