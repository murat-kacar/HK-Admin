"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2, AlertCircle, Phone, Mail, User, MessageSquare } from 'lucide-react';

interface Props {
  training_id?: number;
  training_title?: string;
  training_date?: string;
}

export default function ApplicationForm({ training_id, training_title, training_date }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const payload = {
      training_id,
      training_title,
      training_date,
      name: fd.get('name'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      message: fd.get('message')
    };

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Sunucu hatası');

      e.currentTarget.reset();
      setSuccess(true);
      // Success state is shown for 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError('Başvuru gönderilemedi. Lütfen teknik bir sorun olduğunu düşünüyorsanız iletişime geçin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="font-lora text-2xl font-black uppercase italic tracking-tighter text-neutral-900 mb-2">Başvurunuz Alındı!</h3>
        <p className="text-neutral-500 font-medium max-w-xs mx-auto">
          Sanat yolculuğuna ilk adımı attınız. Ekibimiz en kısa sürede sizinle iletişime geçecek.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ad Soyad */}
        <div className="relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Tam İsim</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
            <input
              name="name"
              required
              minLength={3}
              placeholder="Hakan Karsak"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:bg-white focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all outline-none text-neutral-900 font-bold"
            />
          </div>
        </div>

        {/* Telefon */}
        <div className="relative">
          <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Telefon Numarası</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
            <input
              name="phone"
              type="tel"
              required
              placeholder="05xx xxx xx xx"
              className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:bg-white focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all outline-none text-neutral-900 font-bold"
            />
          </div>
        </div>
      </div>

      {/* Email */}
      <div className="relative">
        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">E-Posta Adresi</label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-300" size={18} />
          <input
            name="email"
            type="email"
            required
            placeholder="merhaba@akademi.com"
            className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:bg-white focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all outline-none text-neutral-900 font-bold"
          />
        </div>
      </div>

      {/* Mesaj */}
      <div className="relative">
        <label className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-2 block">Bize Sormak İstedikleriniz (Opsiyonel)</label>
        <div className="relative">
          <MessageSquare className="absolute left-4 top-6 text-neutral-300" size={18} />
          <textarea
            name="message"
            rows={4}
            placeholder="Kariyer hedeflerinizden veya merak ettiklerinizden bahsedebilirsiniz..."
            className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-neutral-100 rounded-xl focus:bg-white focus:border-red-800 focus:ring-4 focus:ring-red-800/5 transition-all outline-none text-neutral-900 font-bold resize-none"
          />
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading}
        className="group relative w-full overflow-hidden bg-neutral-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-red-800 active:scale-[0.98]"
      >
        <span className="relative z-10 flex items-center justify-center gap-3">
          {loading ? 'İşleniyor...' : (
            <>
              BAŞVURUYU TAMAMLA <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </span>
      </button>

      <p className="text-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
        * Bilgileriniz KVKK kapsamında korunmakta ve sadece akademi iletişimi için kullanılmaktadır.
      </p>
    </form>
  );
}
