"use client";
import React, { use, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import MediaManager from '@/components/admin/MediaManager';

const EVENT_TYPES = [
  { value: 'Film Gösterimi', label: 'Film Gösterimi' },
  { value: 'Söyleşi', label: 'Söyleşi' },
  { value: 'Panel', label: 'Panel' },
  { value: 'Tiyatro Oyunu', label: 'Tiyatro Oyunu' },
  { value: 'Konser', label: 'Konser' },
  { value: 'Sergi', label: 'Sergi' },
  { value: 'Masterclass', label: 'Masterclass' },
  { value: 'Özel Etkinlik', label: 'Özel Etkinlik' },
  { value: 'Diğer', label: 'Diğer' },
];

const CATEGORIES = [
  { value: 'hero', label: 'Hero Vitrin' },
  { value: 'homepage', label: 'Ana Sayfa' },
];

interface EventForm {
  title: string;
  event_type: string;
  slug: string;
  description: string;
  content: string;
  start_date: string;
  end_date: string;
  location: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  metadata: Record<string, unknown>;
  highlight_tags: string[];
}

type MediaItem = {
  id: number;
  media_type: string;
  url: string;
  thumbnail_url: string | null;
  original_name: string;
  display_order: number;
};

export default function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EventForm>({
    title: '',
    event_type: 'Film Gösterimi',
    slug: '',
    description: '',
    content: '',
    start_date: '',
    end_date: '',
    location: '',
    image_url: '',
    is_active: true,
    display_order: 0,
    metadata: {},
    highlight_tags: []
  });
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const toast = useToast();

  const fetchEvent = useCallback(async () => {
    const response = await fetch(`/api/events/id/${id}`);
    const payload = await response.json();
    const event = payload.data;

    if (!event) {
      toast?.toast({ title: 'Hata', description: 'Etkinlik bulunamadı', type: 'error' });
      router.push('/admin/events');
      return;
    }

    if (typeof event.metadata === 'string') {
      try { event.metadata = JSON.parse(event.metadata); } catch { event.metadata = {}; }
    }

    if (event.start_date) {
      event.start_date = event.start_date.split('T')[0];
    }
    if (event.end_date) {
      event.end_date = event.end_date.split('T')[0];
    }

    if (!event.highlight_tags) {
      event.highlight_tags = [];
    }

    setForm(event);
  }, [id, router, toast]);

  const fetchMedia = useCallback(() => {
    fetch(`/api/media?entity_type=event&entity_id=${id}`)
      .then((response) => response.json())
      .then((payload) => setMedia(payload.data || []))
      .catch(() => { });
  }, [id]);

  const handleMediaRefresh = useCallback(async () => {
    fetchMedia();
    try {
      await fetchEvent();
    } catch {
      // ignore refresh race errors
    }
  }, [fetchEvent, fetchMedia]);

  useEffect(() => {
    fetchEvent()
      .catch((err) => {
        console.error(err);
        toast?.toast({ title: 'Hata', description: 'Yükleme başarısız', type: 'error' });
      })
      .finally(() => setLoading(false));

    fetchMedia();
  }, [fetchEvent, fetchMedia, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors(null);

    const res = await fetch('/api/events', {
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

    toast?.toast({ title: 'Güncellendi', description: 'Etkinlik başarıyla güncellendi.', type: 'success' });
    router.push('/admin/events');
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => {
      const tags = [...(prev.highlight_tags || [])];
      if (tags.includes(tag)) {
        return { ...prev, highlight_tags: tags.filter(t => t !== tag) };
      } else {
        return { ...prev, highlight_tags: [...tags, tag] };
      }
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <span className="admin-spinner" /> Yükleniyor...
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Etkinlik Düzenle</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{form.title} — İçerik Yönetimi</p>
        </div>
        <button onClick={() => router.push('/admin/events')} className="admin-btn admin-btn-secondary">
          ← Geri Dön
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-grid-sidebar">

          {/* SOL KOLON - Ana İçerik */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Temel Bilgiler */}
            <div className="admin-card">
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#1e293b', 
                marginBottom: '1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem' 
              }}>
                <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
                Temel Bilgiler
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="admin-label">Etkinlik Başlığı *</label>
                  <input 
                    className="admin-input" 
                    value={form.title || ''} 
                    onChange={(e) => setForm({ ...form, title: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label className="admin-label">Etkinlik Türü</label>
                  <select 
                    className="admin-input" 
                    value={form.event_type || ''} 
                    onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                    {!EVENT_TYPES.find(x => x.value === form.event_type) && form.event_type && (
                      <option value={form.event_type}>{form.event_type}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="admin-label">SEO Slug (URL)</label>
                  <input 
                    className="admin-input" 
                    placeholder="film-gosterimi-soylesi" 
                    value={form.slug || ''} 
                    onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="admin-label">Kısa Açıklama (Özet)</label>
                <textarea
                  className="admin-textarea"
                  rows={3}
                  placeholder="Liste sayfalarında görünecek kısa açıklama..."
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="admin-label">Detaylı İçerik</label>
                <textarea
                  className="admin-textarea"
                  rows={10}
                  placeholder="Etkinlik detay sayfasında görünecek uzun metin..."
                  value={form.content || ''}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                ></textarea>
              </div>
            </div>

            {/* Tarih & Lokasyon */}
            <div className="admin-card">
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#1e293b', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
                Tarih & Lokasyon
              </h3>

              <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label className="admin-label">Başlangıç Tarihi</label>
                  <input 
                    type="date"
                    className="admin-input" 
                    value={form.start_date || ''} 
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="admin-label">Bitiş Tarihi</label>
                  <input 
                    type="date"
                    className="admin-input" 
                    value={form.end_date || ''} 
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="admin-label">Lokasyon</label>
                <input 
                  className="admin-input" 
                  placeholder="Örn: Hakan Karsak Akademi Salonu"
                  value={form.location || ''} 
                  onChange={(e) => setForm({ ...form, location: e.target.value })} 
                />
              </div>

              <div>
                <label className="admin-label">Vitrin & Listeleme</label>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {CATEGORIES.map((tag) => (
                    <label key={tag.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                      <input 
                        type="checkbox" 
                        checked={(form.highlight_tags || []).includes(tag.value)} 
                        onChange={() => toggleTag(tag.value)} 
                        style={{ width: 18, height: 18 }} 
                      />
                      {tag.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Görsel */}
            <div className="admin-card">
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: '#1e293b', 
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
                Görsel Yönetimi
              </h3>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="admin-label">Afiş/Poster Görseli URL</label>
                <input 
                  className="admin-input" 
                  placeholder="/assets/images/event-poster.jpg"
                  value={form.image_url || ''} 
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} 
                />
              </div>

              {form.image_url && (
                <div style={{ 
                  borderRadius: '8px', 
                  overflow: 'hidden', 
                  border: '1px solid #e2e8f0',
                  maxWidth: '400px'
                }}>
                  <img 
                    src={form.image_url} 
                    alt="Preview" 
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: '1.5rem' }}>
                <MediaManager entityType="event" entityId={Number(id)} media={media} onRefresh={handleMediaRefresh} />
              </div>
            </div>

            {/* Metadata (JSON) */}
            <div className="admin-card">
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>
                Metadata (JSON)
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                Ek bilgiler için JSON formatında veri girebilirsiniz.
              </p>
              <textarea
                className="admin-textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f8fafc' }}
                rows={6}
                value={JSON.stringify(form.metadata, null, 2)}
                onChange={(e) => {
                  try {
                    const val = JSON.parse(e.target.value);
                    setForm({ ...form, metadata: val });
                  } catch { /* bekle */ }
                }}
              ></textarea>
            </div>

          </div>

          {/* SAĞ KOLON - Yan Bilgiler */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Yayın Ayarları */}
            <div className="admin-card" style={{ background: '#f8fafc' }}>
              <h4 style={{ 
                fontSize: '0.8rem', 
                fontWeight: 700, 
                textTransform: 'uppercase', 
                color: '#64748b', 
                letterSpacing: '0.05em', 
                marginBottom: '1.25rem' 
              }}>
                Yayın Ayarları
              </h4>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="admin-label">Durum</label>
                <select 
                  className="admin-input" 
                  value={form.is_active ? 'true' : 'false'} 
                  onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                >
                  <option value="true">Aktif (Yayında)</option>
                  <option value="false">Pasif (Gizli)</option>
                </select>
              </div>

              <div>
                <label className="admin-label">Görünüm Sırası</label>
                <input 
                  type="number"
                  className="admin-input" 
                  value={form.display_order || 0} 
                  onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} 
                />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                  Küçük numara önce görünür
                </p>
              </div>
            </div>

            {/* Hızlı Bilgi */}
            <div className="admin-card" style={{ background: '#fef3c7', borderColor: '#fbbf24' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#92400e', marginBottom: '0.75rem' }}>
                💡 Bilgi
              </h4>
              <p style={{ fontSize: '0.7rem', color: '#78350f', lineHeight: 1.6 }}>
                Etkinlik detay sayfası: <br />
                <code style={{ background: '#fffbeb', padding: '2px 4px', borderRadius: '3px' }}>
                  /akademide-neler-var/{form.slug || '...'}
                </code>
              </p>
            </div>

            {/* Kaydet Butonları */}
            <div className="admin-card">
              {errors && <div className="admin-error" style={{ marginBottom: '1rem' }}>{errors}</div>}
              
              <button 
                type="submit" 
                disabled={saving} 
                className="admin-btn admin-btn-primary" 
                style={{ width: '100%', marginBottom: '0.75rem' }}
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
              
              <button 
                type="button" 
                onClick={() => router.push('/admin/events')} 
                className="admin-btn admin-btn-secondary" 
                style={{ width: '100%' }}
              >
                İptal
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}
