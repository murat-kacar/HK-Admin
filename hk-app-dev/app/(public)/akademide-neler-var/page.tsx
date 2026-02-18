'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SectionHeader from '@/components/public/SectionHeader';

interface EventRow {
  id: number;
  title: string;
  description: string;
  slug: string;
  event_type: string | null;
  location: string | null;
  image_url: string | null;
  start_date: string | null;
  metadata: Record<string, unknown>;
  is_active: boolean;
}

export default function AkademideNelerVarPage() {
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', {
          cache: 'no-store'
        });
        const data = await res.json();
        setItems(data.data || []);
      } catch (err) {
        console.error('[getEvents]', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) {return '';}
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <SectionHeader title="Akademide Neler Var!" subtitle="Güncel etkinlikler, gösterimler ve daha fazlası" />
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-neutral-100 border-t-black rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {/* Başlık Bölümü */}
      <SectionHeader
        title="Akademide Neler Var!"
        subtitle="Güncel etkinlikler, gösterimler ve daha fazlası"
      />

      {/* Grid Yapısı */}
      {items.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
          <p className="text-neutral-400 font-medium">Şu an aktif bir etkinlik bulunmuyor. Daha sonra tekrar göz atın.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {items.map((item: EventRow, idx: number) => (
            <motion.div
              key={item.id}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="overflow-hidden border-none shadow-xl bg-white group flex flex-col h-full rounded-2xl"
            >
              {/* Görsel Alanı - 5:4 Oranı */}
              <div className="relative w-full aspect-[5/4] overflow-hidden bg-neutral-100">
                <Image
                  src={item.image_url || '/assets/images/placeholder.jpg'}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* İçerik Alanı */}
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <h3 className="font-lora text-2xl font-bold text-neutral-900 mb-4 leading-tight">
                  {item.title}
                </h3>

                <p className="text-sm text-neutral-500 line-clamp-3 mb-6 font-medium leading-relaxed">
                  {item.description || 'Bu etkinlik için henüz bir açıklama girilmemiş.'}
                </p>

                {/* Meta Bilgiler */}
                <div className="flex flex-col gap-3 mt-auto mb-8 border-t border-neutral-50 pt-6">
                  {item.event_type && (
                    <div className="text-xs uppercase font-black text-sky-600 tracking-widest">
                      {item.event_type}
                    </div>
                  )}
                  
                  {item.start_date && (
                    <div className="text-xs text-neutral-500 font-medium">
                      📅 {formatDate(item.start_date)}
                    </div>
                  )}
                  
                  {item.location && (
                    <div className="text-xs text-neutral-500 font-medium">
                      📍 {item.location}
                    </div>
                  )}
                </div>

                {/* Buton */}
                <Link href={`/akademide-neler-var/${item.slug}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-black text-white text-sm font-black uppercase tracking-tight rounded-none transition-colors hover:bg-neutral-800 active:bg-neutral-900"
                    type="button"
                  >
                    Detayları Gör
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
