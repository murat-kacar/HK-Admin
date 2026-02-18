"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

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

interface EventItem {
  id: number;
  title: string;
  event_type: string | null;
  start_date: string | null;
  slug: string;
  display_order: number;
  image_url?: string;
  is_active: boolean;
  highlight_tags: string[];
}

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', event_type: 'Film Gösterimi', start_date: '', start_time: '', location: '', display_order: 0, highlight_tags: [] as string[] });
  const [errors, setErrors] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/events?limit=100&includeInactive=true');
    const j = await r.json();
    setItems(j.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.title.trim().length < 3) {
      setErrors('Başlık en az 3 karakter olmalıdır.');
      return;
    }
    setErrors(null);
    setCreating(true);
    const res = await fetch('/api/events', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(form) 
    });
    const j = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      const msg = j.error || 'Sunucu hatası';
      setErrors(msg);
      toast?.toast({ title: 'Hata', description: msg, type: 'error' });
      return;
    }
    toast?.toast({ title: 'Oluşturuldu', description: 'Etkinlik oluşturuldu, detaylar için yönlendiriliyorsunuz.', type: 'success' });
    if (j.data?.id) {
      router.push(`/admin/events/edit/${j.data.id}`);
    } else {
      setForm({ title: '', event_type: 'Film Gösterimi', start_date: '', start_time: '', location: '', display_order: 0, highlight_tags: [] });
      setShowForm(false);
      load();
    }
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      highlight_tags: prev.highlight_tags.includes(tag)
        ? prev.highlight_tags.filter((t) => t !== tag)
        : [...prev.highlight_tags, tag],
    }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {return;}
    const res = await fetch('/api/events', { 
      method: 'DELETE', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id }) 
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast?.toast({ title: 'Hata', description: j.error || 'Silinemedi', type: 'error' });
      return;
    }
    toast?.toast({ title: 'Silindi', description: 'Etkinlik sistemden kaldırıldı.', type: 'success' });
    load();
  };

  const handleToggleActive = async (item: EventItem) => {
    const res = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_active: !item.is_active })
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast?.toast({ title: 'Hata', description: j.error || 'Güncellenemedi', type: 'error' });
      return;
    }
    toast?.toast({ 
      title: 'Güncellendi', 
      description: item.is_active ? 'Etkinlik gizlendi' : 'Etkinlik aktif edildi', 
      type: 'success' 
    });
    load();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) {return;}

    const newItems = [...items];
    const current = { ...newItems[index] };
    const neighbor = { ...newItems[targetIndex] };

    // Swap positions
    newItems[index] = neighbor;
    newItems[targetIndex] = current;

    // Swap display_order
    const tempOrder = current.display_order;
    current.display_order = neighbor.display_order;
    neighbor.display_order = tempOrder;

    // Update state immediately
    setItems(newItems);

    try {
      await Promise.all([
        fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, display_order: current.display_order })
        }),
        fetch('/api/events', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: neighbor.id, display_order: neighbor.display_order })
        })
      ]);
    } catch (err) {
      toast?.toast({ title: 'Hata', description: 'Sıralama sunucu tarafında güncellenemedi.', type: 'error' });
      load();
    }
  };

  const tagLabel = (tags: string[]) => {
    if (!tags || tags.length === 0) {return null;}
    const allowed = ['hero', 'homepage'];
    const filtered = tags.filter(t => allowed.includes(t));
    if (filtered.length === 0) {return null;}

    return filtered.map((t) => (
      <span key={t} style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: t === 'hero' ? '#fef3c7' : '#dcfce7', color: t === 'hero' ? '#92400e' : '#166534', fontWeight: 700, marginRight: '4px', textTransform: 'uppercase' }}>
        {t === 'hero' ? 'Vitrin' : 'Ana Sayfa'}
      </span>
    ));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) {return 'Tarih belirtilmemiş';}
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div>
      {/* Desktop action button */}
      <div className="admin-page-action-desktop">
        <button
          className={`admin-btn ${showForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Vazgeç' : '+ Yeni Etkinlik'}
        </button>
      </div>

      {/* Mobile action bar */}
      <div className="admin-mobile-action-bar">
        <button
          className={`admin-btn ${showForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'İptal' : '+ Yeni Etkinlik Ekle'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2.5rem', border: '2px solid var(--admin-accent)', boxShadow: 'var(--admin-shadow)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>
            Yeni Etkinlik Kaydı
          </h3>
          <form onSubmit={handleCreate}>
            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">Etkinlik Başlığı *</label>
                <input
                  className="admin-input"
                  placeholder="Örn: Film Gösterimi ve Söyleşi"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="admin-label">Etkinlik Türü</label>
                <select className="admin-input" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-grid-3" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">Başlangıç Tarihi</label>
                <input type="date" className="admin-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Saat</label>
                <input type="time" className="admin-input" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Mekan</label>
                <input className="admin-input" placeholder="Örn: Moda Sahnesi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="admin-label">Hangi listelerde gösterilsin?</label>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {CATEGORIES.map((tag) => (
                  <label key={tag.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input type="checkbox" checked={form.highlight_tags.includes(tag.value)} onChange={() => toggleTag(tag.value)} style={{ width: 18, height: 18 }} />
                    {tag.label}
                  </label>
                ))}
              </div>
            </div>

            {errors && <div className="admin-error" style={{ marginBottom: '1.5rem' }}>{errors}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={creating} className="admin-btn admin-btn-primary">
                {creating ? 'Oluşturuluyor...' : 'Devam Et (Detaylara Geç)'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-secondary">Vazgeç</button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          padding: '1.25rem 1.5rem', 
          borderBottom: '1px solid var(--admin-border)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          background: '#fcfcfc' 
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
            Toplam {items.length} Etkinlik
          </span>
        </div>
        
        {loading ? (
          <div className="admin-loading">
            <span className="admin-spinner" /> Etkinlikler yükleniyor...
          </div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <p>Henüz kayıtlı bir etkinlik bulunmuyor.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Etkinlik Bilgisi</th>
                  <th className="hide-mobile">Tarih</th>
                  <th className="hide-mobile">Öne Çıkarma</th>
                  <th>Durum</th>
                  <th className="hide-mobile">Sıra</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {items.map((it) => (
                    <motion.tr
                      key={it.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        layout: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                      }}
                      style={{ background: 'white' }}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: '8px', 
                            background: '#f1f5f9', 
                            overflow: 'hidden', 
                            flexShrink: 0 
                          }}>
                            {it.image_url ? (
                              <img src={it.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ 
                                width: '100%', 
                                height: '100%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                background: '#e2e8f0', 
                                color: '#94a3b8' 
                              }}>
                                <svg style={{ width: 20, height: 20 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                              {it.title}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                              {it.event_type || 'Etkinlik'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {formatDate(it.start_date)}
                        </span>
                      </td>
                      <td className="hide-mobile">{tagLabel(it.highlight_tags) || <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.75rem' }}>Genel</span>}</td>
                      <td>
                        <button
                          onClick={() => handleToggleActive(it)}
                          className={`admin-badge ${it.is_active ? 'admin-badge-success' : 'admin-badge-warning'}`}
                          style={{ cursor: 'pointer', border: 'none', padding: '4px 10px' }}
                          title={it.is_active ? 'Aktif - Gizlemek için tıkla' : 'Pasif - Aktif etmek için tıkla'}
                        >
                          {it.is_active ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              onClick={() => handleMove(items.indexOf(it), 'up')}
                              disabled={items.indexOf(it) === 0}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                cursor: items.indexOf(it) === 0 ? 'default' : 'pointer', 
                                color: items.indexOf(it) === 0 ? '#cbd5e1' : '#94a3b8', 
                                display: 'flex' 
                              }}
                              title="Yukarı Taşı"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMove(items.indexOf(it), 'down')}
                              disabled={items.indexOf(it) === items.length - 1}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                padding: 0, 
                                cursor: items.indexOf(it) === items.length - 1 ? 'default' : 'pointer', 
                                color: items.indexOf(it) === items.length - 1 ? '#cbd5e1' : '#94a3b8', 
                                display: 'flex' 
                              }}
                              title="Aşağı Taşı"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                              </svg>
                            </button>
                          </div>
                          <span style={{ 
                            fontSize: '0.85rem', 
                            fontWeight: 600, 
                            color: '#1e293b', 
                            minWidth: '1.5rem', 
                            textAlign: 'center' 
                          }}>
                            {it.display_order}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-table-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link
                            href={`/admin/events/edit/${it.id}`}
                            className="admin-btn admin-btn-secondary admin-btn-sm"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => handleDelete(it.id)}
                            className="admin-btn admin-btn-danger admin-btn-sm"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
