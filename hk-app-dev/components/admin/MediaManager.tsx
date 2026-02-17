"use client";
import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import CropperModal from './CropperModal';
import type { Area } from 'react-easy-crop';

interface MediaItem {
  id: number;
  media_type: string;
  url: string;
  thumbnail_url: string | null;
  original_name: string;
  display_order: number;
}

interface Props {
  entityType: 'training' | 'instructor';
  entityId: number;
  media: MediaItem[];
  onRefresh: () => void;
}

export default function MediaManager({ entityType, entityId, media, onRefresh }: Props) {
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<'cover' | 'photo'>('photo');
  const [deleting, setDeleting] = useState<number | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const cover = media.find((m) => m.media_type === 'cover');
  const photos = media.filter((m) => m.media_type === 'photo').sort((a, b) => a.display_order - b.display_order);
  const videos = media.filter((m) => m.media_type === 'video').sort((a, b) => a.display_order - b.display_order);

  // Upload helper (stable reference for hooks)
  const uploadFile = useCallback(async (file: File, mediaType: string) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('entity_type', entityType);
    fd.append('entity_id', String(entityId));
    fd.append('media_type', mediaType);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || 'Yükleme hatası');
      }
    } catch {
      alert('Yükleme başarısız');
    }
    setUploading(false);
    onRefresh();
  }, [entityType, entityId, onRefresh]);

  // File selected → open cropper for images, direct upload for videos
  const handleFileSelect = useCallback((files: FileList | null, mediaType: 'cover' | 'photo' | 'video') => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (mediaType === 'video') {
      uploadFile(file, 'video');
      return;
    }

    // Image → open cropper
    const reader = new FileReader();
    reader.onload = () => {
      setCropSrc(reader.result as string);
      setCropFile(file);
      setCropTarget(mediaType);
    };
    reader.readAsDataURL(file);
  }, [uploadFile]);

  const handleCropComplete = async (_croppedArea: Area, croppedAreaPixels: Area) => {
    if (!cropFile) return;
    setCropSrc(null);

    const fd = new FormData();
    fd.append('file', cropFile);
    fd.append('entity_type', entityType);
    fd.append('entity_id', String(entityId));
    fd.append('media_type', cropTarget);
    fd.append('crop_x', String(Math.round(croppedAreaPixels.x)));
    fd.append('crop_y', String(Math.round(croppedAreaPixels.y)));
    fd.append('crop_width', String(Math.round(croppedAreaPixels.width)));
    fd.append('crop_height', String(Math.round(croppedAreaPixels.height)));

    setUploading(true);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j.error || 'Yükleme hatası');
      }
    } catch {
      alert('Yükleme başarısız');
    }
    setUploading(false);
    setCropFile(null);
    onRefresh();
  };

  

  const handleDelete = async (id: number) => {
    if (!confirm('Bu medyayı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await fetch('/api/media', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    } catch { /* ignore */ }
    setDeleting(null);
    onRefresh();
  };

  return (
    <div>
      {/* Cropper overlay */}
      {cropSrc && (
        <CropperModal
          imageSrc={cropSrc}
          aspect={1}
          onComplete={handleCropComplete}
          onCancel={() => { setCropSrc(null); setCropFile(null); }}
        />
      )}

      {/* Cover photo */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="admin-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
          {entityType === 'instructor' ? 'Profil Fotoğrafı' : 'Kapak Fotoğrafı'}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: 120, height: 120, borderRadius: entityType === 'instructor' ? '50%' : '8px',
            overflow: 'hidden', background: '#f1f5f9', border: '2px dashed #cbd5e1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            {cover ? (
              <Image src={cover.url} alt="Cover" fill sizes="120px" className="object-cover" />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
              </svg>
            )}
          </div>
          <div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files, 'cover')}
            />
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => coverInputRef.current?.click()}
              disabled={uploading}
            >
              {cover ? 'Değiştir' : 'Yükle'}
            </button>
            {cover && (
              <button
                className="admin-btn admin-btn-danger admin-btn-sm"
                style={{ marginLeft: '0.5rem' }}
                onClick={() => handleDelete(cover.id)}
                disabled={deleting === cover.id}
              >
                Kaldır
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Photo gallery */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="admin-label" style={{ margin: 0 }}>Fotoğraf Galerisi ({photos.length}/10)</label>
          <div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files, 'photo')}
            />
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => photoInputRef.current?.click()}
              disabled={uploading || photos.length >= 10}
            >
              + Fotoğraf Ekle
            </button>
          </div>
        </div>
        {photos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
            Henüz fotoğraf eklenmemiş
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {photos.map((p) => (
              <div key={p.id} style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', background: '#f1f5f9' }}>
                <Image src={p.thumbnail_url || p.url} alt={p.original_name} fill sizes="100px" className="object-cover" />
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  style={{
                    position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                    borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', lineHeight: 1,
                  }}
                  title="Sil"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video gallery */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <label className="admin-label" style={{ margin: 0 }}>Video Galerisi ({videos.length}/4)</label>
          <div>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              style={{ display: 'none' }}
              onChange={(e) => handleFileSelect(e.target.files, 'video')}
            />
            <button
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading || videos.length >= 4}
            >
              + Video Ekle
            </button>
          </div>
        </div>
        {videos.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #e2e8f0' }}>
            Henüz video eklenmemiş
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '8px' }}>
            {videos.map((v) => (
              <div key={v.id} style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden', background: '#0f172a' }}>
                {v.thumbnail_url ? (
                  <Image src={v.thumbnail_url} alt={v.original_name} fill sizes="140px" className="object-cover" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(v.id)}
                  disabled={deleting === v.id}
                  style={{
                    position: 'absolute', top: 4, right: 4, width: 22, height: 22,
                    borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none',
                    color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', lineHeight: 1,
                  }}
                  title="Sil"
                >
                  ×
                </button>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '4px 6px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  fontSize: '0.7rem', color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {v.original_name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload progress overlay */}
      {uploading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', padding: '2rem 3rem', borderRadius: '12px', textAlign: 'center' }}>
            <div className="admin-spinner" style={{ marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.9rem', color: '#475569' }}>Yükleniyor...</div>
          </div>
        </div>
      )}
    </div>
  );
}
