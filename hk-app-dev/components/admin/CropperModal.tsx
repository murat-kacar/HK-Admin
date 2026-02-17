"use client";
import React, { useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';

interface Props {
  imageSrc: string;
  aspect?: number;
  onComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onCancel: () => void;
}

export default function CropperModal({ imageSrc, aspect = 1, onComplete, onCancel }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedArea(_croppedArea);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = () => {
    if (croppedArea && croppedAreaPixels) {
      onComplete(croppedArea, croppedAreaPixels);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Crop area */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          cropShape={aspect === 1 ? 'round' : 'rect'}
          showGrid={aspect !== 1}
          style={{
            containerStyle: { background: '#000' },
          }}
        />
      </div>

      {/* Controls */}
      <div style={{
        padding: '16px 24px',
        background: '#1a1a2e',
        display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        {/* Zoom slider */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" />
          </svg>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{
              flex: 1, accentColor: '#6366f1', cursor: 'pointer',
            }}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /><path d="M11 8v6" />
          </svg>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '8px 20px', borderRadius: '6px',
              background: 'transparent', border: '1px solid #475569',
              color: '#94a3b8', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '8px 20px', borderRadius: '6px',
              background: '#6366f1', border: 'none',
              color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            }}
          >
            Kırp ve Yükle
          </button>
        </div>
      </div>
    </div>
  );
}
