"use client";

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

type NewsItem = {
  id: number;
  title: string;
  excerpt: string | null;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
  is_active: boolean;
  display_order: number;
};

type NewsForm = {
  title: string;
  excerpt: string;
  source_name: string;
  source_url: string;
  image_url: string;
  published_at: string;
  is_active: boolean;
  display_order: number;
};

const INITIAL_FORM: NewsForm = {
  title: '',
  excerpt: '',
  source_name: '',
  source_url: '',
  image_url: '',
  published_at: '',
  is_active: true,
  display_order: 0,
};

export default function AdminNewsPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<string | null>(null);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const response = await fetch('/api/news?includeInactive=true&limit=200');
    const payload = await response.json();
    setItems(payload.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setActiveId(null);
    setForm(INITIAL_FORM);
    setErrors(null);
  };

  const openEdit = (item: NewsItem) => {
    setActiveId(item.id);
    setForm({
      title: item.title || '',
      excerpt: item.excerpt || '',
      source_name: item.source_name || '',
      source_url: item.source_url || '',
      image_url: item.image_url || '',
      published_at: item.published_at ? item.published_at.slice(0, 10) : '',
      is_active: item.is_active,
      display_order: item.display_order || 0,
    });
    setErrors(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);

    if (!form.title || form.title.trim().length < 3) {
      setErrors('Başlık en az 3 karakter olmalıdır.');
      return;
    }

    setSaving(true);
    const response = await fetch('/api/news', {
      method: activeId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...(activeId ? { id: activeId } : {}), ...form }),
    });

    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      const message = payload.error || 'Sunucu hatası';
      setErrors(message);
      toast?.toast({ title: 'Hata', description: message, type: 'error' });
      return;
    }

    toast?.toast({
      title: activeId ? 'Güncellendi' : 'Oluşturuldu',
      description: activeId ? 'Haber güncellendi.' : 'Yeni haber eklendi.',
      type: 'success',
    });

    resetForm();
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      return;
    }

    const response = await fetch('/api/news', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      toast?.toast({ title: 'Hata', description: 'Silme işlemi başarısız.', type: 'error' });
      return;
    }

    toast?.toast({ title: 'Silindi', description: 'Haber kaldırıldı.', type: 'success' });
    if (activeId === id) {
      resetForm();
    }
    load();
  };

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.05rem' }}>
          {activeId ? 'Haberi Düzenle' : 'Yeni Haber Ekle'}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="admin-label">Başlık *</label>
              <input
                className="admin-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="admin-label">Kaynak</label>
              <input
                className="admin-input"
                value={form.source_name}
                onChange={(e) => setForm({ ...form, source_name: e.target.value })}
                placeholder="Örn: Hürriyet"
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Özet</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>

          <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="admin-label">Haber Linki</label>
              <input
                className="admin-input"
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="admin-label">Görsel URL</label>
              <input
                className="admin-input"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="admin-grid-2" style={{ marginBottom: '1rem' }}>
            <div>
              <label className="admin-label">Yayın Tarihi</label>
              <input
                type="date"
                className="admin-input"
                value={form.published_at}
                onChange={(e) => setForm({ ...form, published_at: e.target.value })}
              />
            </div>
            <div>
              <label className="admin-label">Sıralama</label>
              <input
                type="number"
                className="admin-input"
                value={form.display_order}
                onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              style={{ width: 18, height: 18 }}
            />
            Yayında (Basında Biz sayfasında görünür)
          </label>

          {errors && <div className="admin-error" style={{ marginBottom: '0.75rem' }}>{errors}</div>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} className="admin-btn admin-btn-primary">
              {saving ? 'Kaydediliyor...' : activeId ? 'Güncelle' : 'Haberi Ekle'}
            </button>
            {activeId && (
              <button type="button" className="admin-btn admin-btn-secondary" onClick={resetForm}>
                İptal
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="admin-spinner" /> Haberler yükleniyor...</div>
      ) : items.length === 0 ? (
        <div className="admin-card admin-empty"><p>Henüz haber bulunmuyor.</p></div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kaynak</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th style={{ textAlign: 'right' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.title}</div>
                      {item.excerpt && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{item.excerpt}</div>}
                    </td>
                    <td>{item.source_name || '—'}</td>
                    <td>{item.published_at ? new Date(item.published_at).toLocaleDateString('tr-TR') : '—'}</td>
                    <td>
                      <span className={item.is_active ? 'admin-badge admin-badge-success' : 'admin-badge admin-badge-neutral'}>
                        {item.is_active ? 'Yayında' : 'Taslak'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => openEdit(item)} style={{ marginRight: '0.5rem' }}>
                        Düzenle
                      </button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(item.id)}>
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
