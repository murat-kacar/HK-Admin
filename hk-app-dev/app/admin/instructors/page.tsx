"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

interface InstructorItem {
  id: number;
  name: string;
  expertise: string;
  slug: string;
  photo?: string;
  display_order: number;
}

type InstructorCreateForm = {
  name: string;
  expertise: string;
  email: string;
  display_order: number;
};

export default function AdminInstructorsPage() {
  const [items, setItems] = useState<InstructorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InstructorCreateForm>({ name: '', expertise: '', email: '', display_order: 0 });
  const [errors, setErrors] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/instructors?limit=200');
    const j = await r.json();
    setItems(j.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors(null);
    if (!form.name || form.name.trim().length < 3) {
      setErrors('İsim en az 3 karakter olmalıdır.');
      return;
    }
    setCreating(true);
    const res = await fetch('/api/instructors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const j = await res.json().catch(() => ({}));
    setCreating(false);
    if (!res.ok) {
      const msg = j.error || 'Sunucu hatası';
      setErrors(msg);
      toast?.toast({ title: 'Hata', description: msg, type: 'error' });
      return;
    }
    toast?.toast({ title: 'Oluşturuldu', description: 'Eğitmen profili oluşturuldu, detaylar için yönlendiriliyorsunuz.', type: 'success' });
    if (j.data?.id) {
      router.push(`/admin/instructors/edit/${j.data.id}`);
    } else {
      setForm({ name: '', expertise: '', email: '', display_order: 0 });
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu eğitmeni silmek istediğinize emin misiniz?')) return;
    const res = await fetch('/api/instructors', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast?.toast({ title: 'Hata', description: j.error || 'Silinemedi', type: 'error' });
      return;
    }
    toast?.toast({ title: 'Silindi', description: 'Eğitmen sistemden kaldırıldı.', type: 'success' });
    load();
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const current = { ...newItems[index] };
    const neighbor = { ...newItems[targetIndex] };

    // Swap positions in the local array for immediate visual feedback
    newItems[index] = neighbor;
    newItems[targetIndex] = current;

    // Optimistically update display_order values to match their new positions
    // We swap the order values so they maintain their relative sorting in DB
    const tempOrder = current.display_order;
    current.display_order = neighbor.display_order;
    neighbor.display_order = tempOrder;

    // Update state immediately
    setItems(newItems);

    try {
      // Background sync with database
      await Promise.all([
        fetch('/api/instructors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: current.id, display_order: current.display_order })
        }),
        fetch('/api/instructors', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: neighbor.id, display_order: neighbor.display_order })
        })
      ]);
      // No need to call load() if everything is successful
    } catch (err) {
      toast?.toast({ title: 'Hata', description: 'Sıralama sunucu tarafında güncellenemedi.', type: 'error' });
      load(); // Revert to server state on error
    }
  };

  return (
    <div>
      {/* Desktop action button */}
      <div className="admin-page-action-desktop">
        <button className={`admin-btn ${showForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Vazgeç' : '+ Yeni Eğitmen'}
        </button>
      </div>

      {/* Mobile action bar */}
      <div className="admin-mobile-action-bar">
        <button className={`admin-btn ${showForm ? 'admin-btn-secondary' : 'admin-btn-primary'}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'İptal' : '+ Yeni Eğitmen Ekle'}
        </button>
      </div>

      {/* Modern Create form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: '2.5rem', border: '2px solid var(--admin-accent)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Yeni Eğitmen Profilini Oluştur</h3>
          <form onSubmit={handleCreate}>
            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">Tam İsim *</label>
                <input className="admin-input" placeholder="Örn: Hakan Karsak" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="admin-label">Uzmanlık / Branş</label>
                <input className="admin-input" placeholder="Örn: Oyunculuk, Yönetmen" value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })} />
              </div>
            </div>
            <div className="admin-grid-2" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label className="admin-label">E-posta</label>
                <input type="email" className="admin-input" placeholder="ornek@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="admin-label">Görünüm Sırası</label>
                <input type="number" className="admin-input" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
            {errors && <div className="admin-error" style={{ marginBottom: '1.5rem' }}>{errors}</div>}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" disabled={creating} className="admin-btn admin-btn-primary">
                {creating ? 'Oluşturuluyor...' : 'Devam Et (Detaylara Geç)'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="admin-btn admin-btn-secondary">İptal</button>
            </div>
          </form>
        </div>
      )}

      {/* Modern List */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--admin-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fcfcfc' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Kayıtlı {items.length} Sanatçı</span>
        </div>
        {loading ? (
          <div className="admin-loading"><span className="admin-spinner" /> Veriler çekiliyor...</div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            <p>Henüz kayıtlı bir eğitmen bulunmuyor.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Sanatçı Bilgisi</th>
                  <th className="hide-mobile">Branş</th>
                  <th className="hide-mobile">Sıra</th>
                  <th className="hide-mobile">Bağlantı (Slug)</th>
                  <th style={{ textAlign: 'right' }}>İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
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
                          <div style={{ width: 32, height: 32, borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#475569', overflow: 'hidden' }}>
                            {it.photo ? (
                              <img src={it.photo} alt={it.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              it.name.charAt(0)
                            )}
                          </div>
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{it.name}</span>
                        </div>
                      </td>
                      <td className="hide-mobile">
                        <span className="admin-badge admin-badge-info" style={{ background: '#f0fdf4', color: '#166534' }}>{it.expertise || 'Genel'}</span>
                      </td>
                      <td className="hide-mobile">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              onClick={() => handleMove(items.indexOf(it), 'up')}
                              disabled={items.indexOf(it) === 0}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: items.indexOf(it) === 0 ? 'default' : 'pointer', color: items.indexOf(it) === 0 ? '#cbd5e1' : '#94a3b8', display: 'flex' }}
                              title="Yukarı Taşı"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                            </button>
                            <button
                              onClick={() => handleMove(items.indexOf(it), 'down')}
                              disabled={items.indexOf(it) === items.length - 1}
                              style={{ background: 'none', border: 'none', padding: 0, cursor: items.indexOf(it) === items.length - 1 ? 'default' : 'pointer', color: items.indexOf(it) === items.length - 1 ? '#cbd5e1' : '#94a3b8', display: 'flex' }}
                              title="Aşağı Taşı"
                            >
                              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </button>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', minWidth: '1.5rem', textAlign: 'center' }}>{it.display_order}</span>
                        </div>
                      </td>
                      <td className="hide-mobile"><code style={{ fontSize: '0.8rem', background: '#f1f5f9', padding: '0.2rem 0.4rem', borderRadius: '4px', color: '#64748b' }}>/{it.slug}</code></td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-table-actions" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <Link href={`/admin/instructors/edit/${it.id}`} className="admin-btn admin-btn-secondary admin-btn-sm">
                            Düzenle
                          </Link>
                          <button onClick={() => handleDelete(it.id)} className="admin-btn admin-btn-danger admin-btn-sm" style={{ border: 'none' }}>
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
