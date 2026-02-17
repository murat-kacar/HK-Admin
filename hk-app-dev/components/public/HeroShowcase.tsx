"use client";
import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface TrainingItem {
  id: number;
  title: string;
  poster_image?: string;
  description?: string;
  slug?: string;
  event_type?: string;
  display_order?: number;
  _source?: 'training' | 'event';
}

export default function HeroShowcase() {
  const [items, setItems] = useState<TrainingItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        // Fetch both trainings and events with 'hero' tag
        const [trainingsRes, eventsRes] = await Promise.all([
          fetch('/api/trainings?category=hero&limit=10'),
          fetch('/api/events?category=hero&limit=10')
        ]);
        
        const trainingsData = await trainingsRes.json();
        const eventsData = await eventsRes.json();
        
        const trainings = (trainingsData?.data || []).map((t: any) => ({ 
          ...t, 
          _source: 'training',
          poster_image: t.poster_image || t.image_url
        }));
        const events = (eventsData?.data || []).map((e: any) => ({ 
          ...e, 
          _source: 'event',
          poster_image: e.image_url || e.poster_image
        }));
        
        // Combine and sort by display_order
        const combined = [...trainings, ...events].sort((a, b) => 
          (a.display_order || 999) - (b.display_order || 999)
        );

        // If no hero items, fallback to recent active items
        if (combined.length === 0) {
          const [fallbackTrainings, fallbackEvents] = await Promise.all([
            fetch('/api/trainings?limit=4'),
            fetch('/api/events?limit=4')
          ]);
          const t = await fallbackTrainings.json();
          const e = await fallbackEvents.json();
          const fallback = [
            ...(t?.data || []).map((item: any) => ({ 
              ...item, 
              _source: 'training',
              poster_image: item.poster_image || item.image_url
            })),
            ...(e?.data || []).map((item: any) => ({ 
              ...item, 
              _source: 'event',
              poster_image: item.image_url || item.poster_image
            }))
          ].slice(0, 4);
          setItems(fallback);
        } else {
          setItems(combined.slice(0, 5));
        }
      } catch (err) {
        console.error('[HeroShowcase]', err);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (items.length > 0 && !isPaused && isLoaded) {
      timerRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % items.length);
      }, 5000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items, isPaused, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="w-full aspect-[5/4] md:aspect-[21/9] bg-neutral-900 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
        <div className="w-full py-20 bg-neutral-50 rounded-3xl border-2 border-dashed border-neutral-100 flex flex-col items-center justify-center text-center">
          <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-2">Akademi Vitrini</p>
          <h3 className="font-lora text-xl font-black italic text-neutral-800 uppercase tracking-tighter">Yakında Yeni Eğitimler Burada Olacak</h3>
        </div>
      </div>
    );
  }

  const activeItem = items[activeIndex];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6">
      <section
        className="relative w-full flex flex-col md:flex-row bg-black overflow-hidden shadow-2xl rounded-2xl border border-white/5"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* ── Sol: Vitrin Alanı ── */}
        <div
          className="relative w-full md:flex-1 flex flex-col bg-neutral-900 overflow-hidden"
        >
          {/* Görsel Paneli */}
          <div className="relative w-full aspect-[5/4] md:aspect-auto md:h-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={activeItem.poster_image || '/assets/images/placeholder.jpg'}
                  alt={activeItem.title}
                  fill
                  priority
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />

            {/* Metin İçerik Alanı */}
            <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20">
              <motion.div
                key={`desc-${activeItem.id}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="h-[2px] w-12 bg-red-800"></span>
                  <span className="text-red-800 text-[10px] md:text-xs uppercase tracking-[0.5em] font-black">
                    {activeItem.event_type || 'Öne Çıkan'}
                  </span>
                </div>
                <h1 className="font-lora text-4xl md:text-7xl font-black text-white mb-6 leading-none uppercase tracking-tighter italic">
                  {activeItem.title}
                </h1>

                {activeItem.description && (
                  <p className="text-sm md:text-lg text-white/70 line-clamp-2 mb-8 max-w-2xl font-medium leading-relaxed">
                    {activeItem.description}
                  </p>
                )}

                <Link href={activeItem._source === 'event' ? `/akademide-neler-var/${activeItem.slug}` : `/egitimler/${activeItem.slug}`}>
                  <div className="inline-flex items-center gap-3 bg-white text-black px-6 py-3 rounded-full text-[10px] md:text-xs font-black tracking-widest hover:bg-red-800 hover:text-white transition-all uppercase cursor-pointer">
                    DETAYLARI İNCELE <span>→</span>
                  </div>
                </Link>
              </motion.div>
            </div>

            {/* Progress Bar */}
            {!isPaused && (
              <motion.div
                key={`progress-${activeIndex}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="absolute bottom-0 left-0 h-1.5 bg-red-800 z-30"
              />
            )}
          </div>
        </div>

        {/* ── Sağ: Seçici Liste (35%) ── */}
        <div className="hidden md:flex w-[350px] bg-neutral-950 flex-col border-l border-white/5">
          <div className="p-6 border-b border-white/5 bg-white/5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 mb-1">PROGRAM AKIŞI</h2>
            <p className="text-sm text-white font-bold italic uppercase tracking-tighter">Akademide Sizi Bekleyinler</p>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`relative transition-all duration-300 border-b border-white/5 ${activeIndex === index ? 'bg-white/10' : 'hover:bg-white/[0.05]'
                  }`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className={`h-full flex items-center gap-4 p-6 cursor-pointer group transition-all duration-500 ${activeIndex === index ? 'opacity-100 pl-8' : 'opacity-40 hover:opacity-100'
                  }`}>
                  {activeIndex === index && <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-800" />}
                  <div className="relative w-16 h-12 flex-shrink-0 overflow-hidden bg-neutral-900 rounded-lg">
                    <Image
                      src={item.poster_image || '/assets/images/placeholder.jpg'}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className={`object-cover transition-transform duration-700 ${activeIndex === index ? 'scale-110' : 'scale-100'}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xs font-black uppercase tracking-tight leading-tight transition-colors duration-300 ${activeIndex === index ? 'text-white' : 'text-neutral-400'
                      }`}>
                      {item.title}
                    </h3>
                    <p className="text-[9px] font-bold text-neutral-600 mt-1 uppercase tracking-widest">{item.event_type || 'Eğitim'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6 bg-neutral-900/50">
            <Link href="/egitimler" className="text-[10px] font-black uppercase tracking-[0.2em] text-red-800 hover:text-white transition-colors">
              TÜMÜNÜ GÖRÜNTÜLE →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
