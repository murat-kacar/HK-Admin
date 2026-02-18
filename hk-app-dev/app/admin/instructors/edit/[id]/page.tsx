"use client";
import React, { use, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import MediaManager from '@/components/admin/MediaManager';

interface InstructorForm {
  name: string;
  expertise: string;
  bio: string;
  email: string;
  slug: string;
  projects: unknown[];
  social_links: Record<string, string>;
  platform_links: Record<string, string>;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  show_on_homepage: boolean;
  show_on_hero_showcase: boolean;
  display_order: number;
}

type MediaItem = {
  id: number;
  media_type: string;
  url: string;
  thumbnail_url: string | null;
  original_name: string;
  display_order: number;
};

export default function InstructorEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InstructorForm>({
    name: '',
    expertise: '',
    bio: '',
    email: '',
    slug: '',
    projects: [],
    social_links: {
      instagram: '',
      twitter: '',
      linkedin: '',
      website: ''
    },
    platform_links: {
      imdb: '',
      youtube: '',
      google_business: '',
      meta_page: '',
      yandex: '',
      biletix: '',
      biletinial: '',
      tiyatrolar_net: '',
      sinemalar_com: ''
    },
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    show_on_homepage: false,
    show_on_hero_showcase: false,
    display_order: 0
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const toast = useToast();

  const fetchMedia = useCallback(() => {
    fetch(`/api/media?entity_type=instructor&entity_id=${id}`)
      .then((r) => r.json())
      .then((j) => setMedia(j.data || []))
      .catch(() => { });
  }, [id]);

  useEffect(() => {
    fetch(`/api/instructors/id/${id}`)
      .then((r) => r.json())
      .then((j) => {
        const data = j.data || {};
        // JSON parsing for safe state handling
        if (typeof data.projects === 'string') {
          try { data.projects = JSON.parse(data.projects); } catch { data.projects = []; }
        }
        if (typeof data.social_links === 'string') {
          try { data.social_links = JSON.parse(data.social_links); } catch { data.social_links = {}; }
        }
        if (typeof data.platform_links === 'string') {
          try { data.platform_links = JSON.parse(data.platform_links); } catch { data.platform_links = {}; }
        }
        // Ensure defaults for social links
        data.social_links = {
          instagram: data.social_links?.instagram || '',
          twitter: data.social_links?.twitter || '',
          linkedin: data.social_links?.linkedin || '',
          website: data.social_links?.website || '',
        };
        // Ensure defaults for platform links
        data.platform_links = {
          imdb: data.platform_links?.imdb || '',
          youtube: data.platform_links?.youtube || '',
          google_business: data.platform_links?.google_business || '',
          meta_page: data.platform_links?.meta_page || '',
          yandex: data.platform_links?.yandex || '',
          biletix: data.platform_links?.biletix || '',
          biletinial: data.platform_links?.biletinial || '',
          tiyatrolar_net: data.platform_links?.tiyatrolar_net || '',
          sinemalar_com: data.platform_links?.sinemalar_com || '',
        };
        setForm(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
    fetchMedia();
  }, [id, fetchMedia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors(null);

    const res = await fetch('/api/instructors', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: Number(id), ...form })
    });

    const j = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      const msg = j.error || 'Sunucu hatası';
      setErrors(msg);
      toast?.toast({ title: 'Hata', description: msg, type: 'error' });
      return;
    }

    toast?.toast({ title: 'Güncellendi', description: 'Eğitmen profili başarıyla güncellendi.', type: 'success' });
    router.push('/admin/instructors');
  };

  if (loading) {return <div className="admin-loading"><span className="admin-spinner" /> Yükleniyor...</div>;}

  return (
    <div className="admin-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Eğitmen Düzenle</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{form.name} — Profil Yönetimi</p>
        </div>
        <button onClick={() => router.push('/admin/instructors')} className="admin-btn admin-btn-secondary">
          ← Geri Dön
        </button>
      </div>

      <div className="admin-grid-sidebar-sm">

        {/* ── SOL KOLON (Ana İçerik) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Temel Bilgiler */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Temel Profil
            </h3>

            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">Eğitmen İsmi *</label>
                <input className="admin-input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="admin-label">Kısa Unvan / Branş</label>
                <input className="admin-input" placeholder="Örn: Pantomim Oyuncusu" value={form.expertise || ''} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">SEO Slug (URL)</label>
              <input className="admin-input" placeholder="hakan-karsak" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.4rem' }}>Boş bırakırsanız isme göre otomatik oluşur.</p>
            </div>

            <div>
              <label className="admin-label">Özgeçmiş / Biyografi</label>
              <textarea
                className="admin-textarea"
                rows={10}
                placeholder="Hocanın hikayesini buraya yazın..."
                value={form.bio || ''}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Kariyer & Projeler JSON Editör */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Kariyer & Proje Listesi</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Projeleri kategorize edilmiş bir liste olarak tutar. (JSON Formatı)
            </p>
            <textarea
              className="admin-textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f8fafc' }}
              rows={12}
              value={JSON.stringify(form.projects, null, 2)}
              onChange={(e) => {
                try {
                  const val = JSON.parse(e.target.value);
                  setForm({ ...form, projects: val });
                } catch { /* sessizce bekle */ }
              }}
            ></textarea>
          </div>

          {/* SEO */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              SEO
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Sayfa Başlığı (title tag)</label>
                <input className="admin-input" placeholder="Örn: Hakan Karşak | Pantomim Sanatçısı" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Meta Açıklama</label>
                <textarea className="admin-textarea" rows={3} placeholder="Google, Yandex ve sosyal medya paylaşımlarında görünen kısa açıklama..." value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>Önerilen: 120–160 karakter</p>
              </div>
              <div>
                <label className="admin-label">Anahtar Kelimeler</label>
                <input className="admin-input" placeholder="pantomim, tiyatro, istanbul, eğitmen" value={form.seo_keywords || ''} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>Virgülle ayırın</p>
              </div>
            </div>
          </div>

          {/* Platform Linkleri */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Platform Linkleri
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>IMDb, Biletix, YouTube gibi sektör platformlarındaki profil/sayfa linkleri.</p>
            <div className="admin-grid-2">
              {([
                ['imdb', 'IMDb'],
                ['youtube', 'YouTube'],
                ['google_business', 'Google Business'],
                ['meta_page', 'Meta (Facebook) Sayfası'],
                ['yandex', 'Yandex'],
                ['biletix', 'Biletix'],
                ['biletinial', 'Biletinial'],
                ['tiyatrolar_net', 'Tiyatrolar.net'],
                ['sinemalar_com', 'Sinemalar.com'],
              ] as [string, string][]).map(([key, label]) => (
                <div key={key}>
                  <label className="admin-label">{label}</label>
                  <input
                    className="admin-input"
                    style={{ fontSize: '0.75rem' }}
                    placeholder="https://..."
                    value={form.platform_links?.[key] || ''}
                    onChange={(e) => setForm({ ...form, platform_links: { ...form.platform_links, [key]: e.target.value } })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Medya Galerisi */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>Portfolyo Galerisi (Resim & Video)</h3>
            <MediaManager entityType="instructor" entityId={Number(id)} media={media} onRefresh={fetchMedia} />
          </div>

        </div>

        {/* ── SAĞ KOLON (İletişim & Yan Bilgiler) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* İletişim & Sosyal Medya */}
          <div className="admin-card" style={{ background: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>İletişim & Sosyal</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">E-posta</label>
                <input className="admin-input" type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@akademiniz.com" />
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />

              {['instagram', 'twitter', 'linkedin', 'website'].map(key => (
                <div key={key}>
                  <label className="admin-label" style={{ textTransform: 'capitalize' }}>{key}</label>
                  <input
                    className="admin-input"
                    style={{ fontSize: '0.75rem' }}
                    value={form.social_links?.[key] || ''}
                    onChange={(e) => setForm({
                      ...form,
                      social_links: { ...form.social_links, [key]: e.target.value }
                    })}
                    placeholder="https://..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Yayın DURUMU */}
          <div className="admin-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Yayın Durumu</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.show_on_homepage || false}
                  onChange={(e) => setForm({ ...form, show_on_homepage: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Ana Sayfada Göster
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.show_on_hero_showcase || false}
                  onChange={(e) => setForm({ ...form, show_on_hero_showcase: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Hero Showcase (Vitrin)
              </label>
              <div style={{ marginTop: '0.5rem' }}>
                <label className="admin-label">Görünüm Sırası</label>
                <input
                  type="number"
                  className="admin-input"
                  value={form.display_order || 0}
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          {/* Kaydet Butonu (Floating-like stay) */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              {saving ? 'Kaydediliyor...' : 'Tümünü Güncelle'}
            </button>
            {errors && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>{errors}</p>}
          </div>

        </div>

      </div>
    </div >
  );
}
