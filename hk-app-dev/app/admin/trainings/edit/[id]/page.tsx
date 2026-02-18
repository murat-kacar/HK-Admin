"use client";
import React, { use, useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';
import MediaManager from '@/components/admin/MediaManager';

const TRAINING_TYPES = [
  { value: 'Atölye', label: 'Atölye' },
  { value: 'Workshop', label: 'Workshop' },
  { value: 'Eğitim', label: 'Eğitim' },
  { value: 'Akademi Programı', label: 'Akademi Programı' },
  { value: 'Film Gösterimi', label: 'Film Gösterimi' },
  { value: 'Söyleşi & Panel', label: 'Söyleşi & Panel' },
  { value: 'Masterclass', label: 'Masterclass' },
  { value: 'Seminer', label: 'Seminer' },
  { value: 'Sahne & Performans', label: 'Sahne & Performans' },
  { value: 'Tiyatro Oyunu', label: 'Tiyatro Oyunu' },
  { value: 'Konser', label: 'Konser' },
  { value: 'Sergi', label: 'Sergi' },
  { value: 'Sanat Kampı', label: 'Sanat Kampı' },
  { value: 'Audition / Seçmeler', label: 'Audition / Seçmeler' },
  { value: 'Diğer', label: 'Diğer' },
];

export default function TrainingEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    title: '',
    event_type: 'Eğitim',
    slug: '',
    summary: '',
    duration: '',
    level: '',
    timing: '',
    description: '',
    detail_content: '',
    poster_image: '',
    display_order: 0,
    highlight_tags: [],
    is_featured: false,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    location: '',
    is_online: false,
    online_url: '',
    is_free: true,
    price: '',
    capacity: '',
    registration_url: '',
    ticketing_url: '',
    biletleme_sistemi: '',
    audience: '',
    language: 'Türkçe',
    agenda: '',
    faqs: [],
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    metadata: { gains: [] },
    instructor_ids: []
  });
  const [media, setMedia] = useState<any[]>([]);
  const [errors, setErrors] = useState<string | null>(null);
  const toast = useToast();

  const fetchMedia = useCallback(() => {
    fetch(`/api/media?entity_type=training&entity_id=${id}`)
      .then((r) => r.json())
      .then((j) => setMedia(j.data || []))
      .catch(() => { });
  }, [id]);

  useEffect(() => {
    // Fetch Instructors
    fetch('/api/instructors?limit=200')
      .then(r => r.json())
      .then(j => setInstructors(j.data || []))
      .catch(err => console.error(err));

    // Fetch Training Data
    fetch(`/api/trainings/id/${id}`)
      .then((r) => r.json())
      .then((j) => {
        const data = j.data || {};

        // Ensure metadata is parsed
        if (typeof data.metadata === 'string') {
          try { data.metadata = JSON.parse(data.metadata); } catch { data.metadata = { gains: [] }; }
        }
        if (!data.metadata?.gains) {
          data.metadata = { ...data.metadata, gains: data.metadata?.gains || [] };
        }
        if (typeof data.faqs === 'string') {
          try { data.faqs = JSON.parse(data.faqs); } catch { data.faqs = []; }
        }
        data.faqs = data.faqs || [];

        // Set instructor IDs from the joined data
        const instIds = data.instructors?.map((i: any) => i.id) || [];
        setForm({ ...data, instructor_ids: instIds });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    fetchMedia();
  }, [id, fetchMedia]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrors(null);

    const res = await fetch('/api/trainings', {
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

    toast?.toast({ title: 'Güncellendi', description: 'Eğitim başarıyla güncellendi.', type: 'success' });
    router.push('/admin/trainings');
  };

  const toggleInstructor = (instId: number) => {
    setForm((prev: any) => {
      const ids = [...(prev.instructor_ids || [])];
      if (ids.includes(instId)) {
        return { ...prev, instructor_ids: ids.filter(i => i !== instId) };
      } else {
        return { ...prev, instructor_ids: [...ids, instId] };
      }
    });
  };

  const toggleTag = (tag: string) => {
    setForm((prev: any) => {
      const tags = [...(prev.highlight_tags || [])];
      if (tags.includes(tag)) {
        return { ...prev, highlight_tags: tags.filter(t => t !== tag) };
      } else {
        return { ...prev, highlight_tags: [...tags, tag] };
      }
    });
  };

  if (loading) return <div className="admin-loading"><span className="admin-spinner" /> Yükleniyor...</div>;

  return (
    <div className="admin-container">
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Eğitim Düzenle</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{form.title} — İçerik Yönetimi</p>
        </div>
        <button onClick={() => router.push('/admin/trainings')} className="admin-btn admin-btn-secondary">
          ← Geri Dön
        </button>
      </div>

      <div className="admin-grid-sidebar">

        {/* ── SOL KOLON (Ana İçerik) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Temel Bilgiler */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Temel Bilgiler
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '1.5rem' }}> {/* single col intentional */}
              <div>
                <label className="admin-label">Eğitim Başlığı *</label>
                <input className="admin-input" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
            </div>

            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">Eğitim Türü</label>
                <select className="admin-input" value={form.event_type || ''} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                  {TRAINING_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                  {!TRAINING_TYPES.find(x => x.value === form.event_type) && form.event_type && (
                    <option value={form.event_type}>{form.event_type}</option>
                  )}
                </select>
              </div>
              <div>
                <label className="admin-label">SEO Slug (URL)</label>
                <input className="admin-input" placeholder="oyun-atolyesi" value={form.slug || ''} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">Kısa Özet (Kartlarda Görünür)</label>
              <textarea
                className="admin-textarea"
                rows={2}
                placeholder="Liste ve kart görünümlerinde çıkacak 1-2 cümlelik özet..."
                value={form.summary || ''}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              ></textarea>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">Açıklama (Liste Sayfası)</label>
              <textarea
                className="admin-textarea"
                rows={2}
                placeholder="Liste sayfalarında görünecek kısa metin..."
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              ></textarea>
            </div>

            <div>
              <label className="admin-label">Detaylı İçerik (Hakkında)</label>
              <textarea
                className="admin-textarea"
                rows={8}
                placeholder="Eğitim detay sayfasında görünecek uzun metin..."
                value={form.detail_content || ''}
                onChange={(e) => setForm({ ...form, detail_content: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Tarih, Saat & Konum */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Tarih, Saat & Konum
            </h3>
            <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label className="admin-label">Başlangıç Tarihi</label>
                <input type="date" className="admin-input" value={form.start_date || ''} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Bitiş Tarihi</label>
                <input type="date" className="admin-input" value={form.end_date || ''} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Başlangıç Saati</label>
                <input type="time" className="admin-input" value={form.start_time || ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Bitiş Saati</label>
                <input type="time" className="admin-input" value={form.end_time || ''} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label className="admin-label">Mekan</label>
              <input className="admin-input" placeholder="Örn: Moda Sahnesi, İstanbul" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              <input type="checkbox" checked={form.is_online || false} onChange={(e) => setForm({ ...form, is_online: e.target.checked })} style={{ width: '16px', height: '16px' }} />
              Online / Hibrit Etkinlik
            </label>
            {form.is_online && (
              <div>
                <label className="admin-label">Online Katılım Linki</label>
                <input className="admin-input" placeholder="https://zoom.us/..." value={form.online_url || ''} onChange={(e) => setForm({ ...form, online_url: e.target.value })} />
              </div>
            )}
          </div>

          {/* Hedef Kitle & Dil */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Kitle & Program
            </h3>
            <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
              <div>
                <label className="admin-label">Hedef Kitle</label>
                <input className="admin-input" placeholder="Örn: Yetişkin, Profesyonel, Herkes" value={form.audience || ''} onChange={(e) => setForm({ ...form, audience: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Dil</label>
                <input className="admin-input" placeholder="Türkçe" value={form.language || ''} onChange={(e) => setForm({ ...form, language: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="admin-label">Program Akışı (Agenda)</label>
              <textarea className="admin-textarea" rows={4} placeholder="09:00 — Kayıt&#10;10:00 — Açılış Konuşması&#10;..." value={form.agenda || ''} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
            </div>
          </div>

          {/* Kayıt & Biletleme */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '4px', height: '16px', background: 'hsl(var(--primary))', borderRadius: '2px' }}></span>
              Kayıt & Biletleme
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.is_free || false} onChange={(e) => setForm({ ...form, is_free: e.target.checked })} style={{ width: '16px', height: '16px' }} />
              Ücretsiz
            </label>
            {!form.is_free && (
              <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
                <div>
                  <label className="admin-label">Fiyat (TRY)</label>
                  <input type="number" className="admin-input" placeholder="0.00" value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Kontenjan</label>
                  <input type="number" className="admin-input" placeholder="20" value={form.capacity || ''} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="admin-label">Kayıt Linki (Dış Kayıt Formu)</label>
                <input className="admin-input" style={{ fontSize: '0.75rem' }} placeholder="https://forms.google.com/..." value={form.registration_url || ''} onChange={(e) => setForm({ ...form, registration_url: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Bilet Linki</label>
                <input className="admin-input" style={{ fontSize: '0.75rem' }} placeholder="https://biletix.com/..." value={form.ticketing_url || ''} onChange={(e) => setForm({ ...form, ticketing_url: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Biletleme Sistemi</label>
                <input className="admin-input" placeholder="Biletix, Biletinial, Passo..." value={form.biletleme_sistemi || ''} onChange={(e) => setForm({ ...form, biletleme_sistemi: e.target.value })} />
              </div>
            </div>
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
                <input className="admin-input" placeholder="Örn: Pantomim Atölyesi | HK Akademi" value={form.seo_title || ''} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Meta Açıklama</label>
                <textarea className="admin-textarea" rows={3} placeholder="Google, Yandex ve sosyal medya paylaşımlarında görünen kısa açıklama..." value={form.seo_description || ''} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>Önerilen: 120–160 karakter</p>
              </div>
              <div>
                <label className="admin-label">Anahtar Kelimeler</label>
                <input className="admin-input" placeholder="pantomim, atölye, tiyatro, istanbul" value={form.seo_keywords || ''} onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })} />
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.25rem' }}>Virgülle ayırın</p>
              </div>
            </div>
          </div>

          {/* Kazanımlar JSON Editör */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1rem' }}>Kazanımlar ve İçerik (JSON)</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
              Eğitim sayfasındaki &quot;Kazanımlar ve İçerik&quot; listesini düzenleyin.
            </p>
            <textarea
              className="admin-textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: '#f8fafc' }}
              rows={8}
              value={JSON.stringify(form.metadata, null, 2)}
              onChange={(e) => {
                try {
                  const val = JSON.parse(e.target.value);
                  setForm({ ...form, metadata: val });
                } catch { /* sessizce bekle */ }
              }}
            ></textarea>
          </div>

          {/* Medya Yönetimi */}
          <div className="admin-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '1.5rem' }}>Afiş & Galeri Yönetimi</h3>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">Ana Afiş görseli (Poster URL)</label>
              <input className="admin-input" placeholder="/assets/images/..." value={form.poster_image || ''} onChange={(e) => setForm({ ...form, poster_image: e.target.value })} />
            </div>
            <MediaManager entityType="training" entityId={Number(id)} media={media} onRefresh={fetchMedia} />
          </div>

        </div>

        {/* ── SAĞ KOLON (Yan Bilgiler) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Süre & Seviye */}
          <div className="admin-card" style={{ background: '#f8fafc' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Zaman & Seviye</h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="admin-label">Süre</label>
                <input className="admin-input" value={form.duration || ''} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="Örn: 8 Ay" />
              </div>
              <div>
                <label className="admin-label">Seviye</label>
                <input className="admin-input" value={form.level || ''} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Örn: Tüm Seviyeler" />
              </div>
              <div>
                <label className="admin-label">Zamanlama Detayı</label>
                <input className="admin-input" value={form.timing || ''} onChange={(e) => setForm({ ...form, timing: e.target.value })} placeholder="Örn: Haftada 2 Gün" />
              </div>
            </div>
          </div>

          {/* Eğitmen Seçimi */}
          <div className="admin-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1rem' }}>Eğitmenler</h4>
            <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
              {instructors.map(inst => (
                <label key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: form.instructor_ids?.includes(inst.id) ? '#f0f9ff' : 'transparent', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', border: '1px solid', borderColor: form.instructor_ids?.includes(inst.id) ? '#bae6fd' : 'transparent' }}>
                  <input
                    type="checkbox"
                    checked={form.instructor_ids?.includes(inst.id) || false}
                    onChange={() => toggleInstructor(inst.id)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  {inst.name}
                </label>
              ))}
            </div>
          </div>

          {/* Yayın DURUMU */}
          <div className="admin-card">
            <h4 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Vitrin & Listeleme</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.highlight_tags?.includes('homepage') || false}
                  onChange={() => toggleTag('homepage')}
                  style={{ width: '18px', height: '18px' }}
                />
                Ana Sayfada Göster
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.highlight_tags?.includes('hero') || false}
                  onChange={() => toggleTag('hero')}
                  style={{ width: '18px', height: '18px' }}
                />
                Hero Slider (Vitrin)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={form.is_featured || false}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Öne Çıkan (Featured)
              </label>
              <div style={{ marginTop: '0.5rem' }}>
                <label className="admin-label">Sıralama (Display Order)</label>
                <input type="number" className="admin-input" value={form.display_order || 0} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
            >
              {saving ? 'Güncelleniyor...' : 'Tümüyle Kaydet'}
            </button>
            {errors && <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '1rem', textAlign: 'center' }}>{errors}</p>}
          </div>

        </div>

      </div>
    </div>
  );
}
