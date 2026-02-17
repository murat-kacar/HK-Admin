"use client";
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';

interface Application {
  id: number;
  training_title: string | null;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  status: string;
  created_at: string;
}

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminApplicationsPage() {
  const [items, setItems] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('all');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/applications');
    const j = await r.json();
    setItems(j.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: number, status: string) => {
    const res = await fetch('/api/applications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!res.ok) {
      toast?.toast({ title: 'Hata', description: 'Güncelleme başarısız', type: 'error' });
      return;
    }
    toast?.toast({ title: 'Güncellendi', description: `Başvuru ${status === 'approved' ? 'onaylandı' : 'reddedildi'}`, type: 'success' });
    load();
  };

  const filtered = filter === 'all' ? items : items.filter((a) => a.status === filter);

  const counts = {
    all: items.length,
    pending: items.filter((a) => a.status === 'pending').length,
    approved: items.filter((a) => a.status === 'approved').length,
    rejected: items.filter((a) => a.status === 'rejected').length,
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `Tümü` },
    { key: 'pending', label: `Bekleyen` },
    { key: 'approved', label: `Onaylı` },
    { key: 'rejected', label: `Reddedilen` },
  ];

  const badgeStyles = (s: string) => {
    if (s === 'approved') return { background: '#dcfce7', color: '#15803d' };
    if (s === 'rejected') return { background: '#fee2e2', color: '#dc2626' };
    return { background: '#fef9c3', color: '#a16207' };
  };

  const statusLabel = (s: string) => {
    if (s === 'approved') return 'Onaylı';
    if (s === 'rejected') return 'Reddedilen';
    return 'Bekliyor';
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="admin-card" style={{ marginBottom: '2.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`admin-btn admin-btn-sm ${filter === tab.key ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
              style={{ borderRadius: '20px', padding: '0.4rem 1.25rem', border: filter === tab.key ? 'none' : '1px solid #e2e8f0' }}
            >
              {tab.label} <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>{counts[tab.key]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><span className="admin-spinner" /> Formlar yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>Seçili kriterlerde başvuru bulunamadı.</p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>AD SOYAD</th>
                  <th>EĞİTİM</th>
                  <th>İLETİŞİM</th>
                  <th>TARİH</th>
                  <th>DURUM</th>
                  <th style={{ textAlign: 'right' }}>İŞLEMLER</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{app.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.message || 'Mesaj bırakılmadı'}</p>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--admin-accent)' }}>{app.training_title || 'Genel Başvuru'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{app.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{app.phone}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(app.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                    <td>
                      <span className="admin-badge" style={badgeStyles(app.status)}>{statusLabel(app.status)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {app.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => updateStatus(app.id, 'approved')} className="admin-btn admin-btn-success admin-btn-sm" style={{ border: 'none' }}>
                            Onayla
                          </button>
                          <button onClick={() => updateStatus(app.id, 'rejected')} className="admin-btn admin-btn-danger admin-btn-sm" style={{ border: 'none' }}>
                            Reddet
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => updateStatus(app.id, 'pending')} className="admin-btn admin-btn-secondary admin-btn-sm" style={{ fontSize: '0.7rem' }}>
                          Beklemeye Al
                        </button>
                      )}
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
