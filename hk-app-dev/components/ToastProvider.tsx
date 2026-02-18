"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

type Toast = { id: string; title?: string; description?: string; type?: 'info'|'success'|'error' };

const ToastContext = createContext<{ toast: (t: Omit<Toast,'id'>)=>void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {throw new Error('useToast must be used within ToastProvider');}
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast,'id'>) => {
    const id = String(Date.now()) + Math.random().toString(36).slice(2,8);
    setToasts((s) => [...s, { id, ...t }]);
  }, []);

  useEffect(() => {
    if (!toasts.length) {return;}
    const timers = toasts.map((t) => setTimeout(() => {
      setToasts((s) => s.filter(x => x.id !== t.id));
    }, 4500));
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full p-3 rounded shadow-lg text-sm ${t.type==='error' ? 'bg-red-50 border border-red-200 text-red-900' : t.type==='success' ? 'bg-green-50 border border-green-200 text-green-900' : 'bg-white border'}`}>
            {t.title && <div className="font-semibold">{t.title}</div>}
            {t.description && <div className="mt-1">{t.description}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
