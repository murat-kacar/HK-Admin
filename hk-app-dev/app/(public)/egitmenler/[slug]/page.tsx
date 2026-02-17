"use client";
import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Instagram, Twitter, Linkedin, Globe, ChevronLeft, Award, Film, BookOpen, Star } from 'lucide-react';
import SectionHeader from '@/components/public/SectionHeader';

interface ProjectCategory {
  category: string;
  items: string[];
}

interface InstructorData {
  id: number;
  name: string;
  expertise: string;
  bio: string;
  photo: string;
  slug: string;
  email?: string;
  specialties?: string[];
  projects?: ProjectCategory[];
  social_links?: Record<string, string>;
  events?: {
    id: number;
    title: string;
    slug: string;
    event_type: string;
    poster_image: string;
  }[];
}

export default function InstructorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [data, setData] = useState<InstructorData | null>(null);
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/instructors/slug/${slug}`);
        const j = await res.json();
        if (j.data) {
          const instructor = j.data;
          // Parse JSON if needed
          if (typeof instructor.projects === 'string') instructor.projects = JSON.parse(instructor.projects);
          if (typeof instructor.social_links === 'string') instructor.social_links = JSON.parse(instructor.social_links);
          setData(instructor);

          // Fetch Media
          const mRes = await fetch(`/api/media?entity_type=instructor&entity_id=${instructor.id}`);
          const mJ = await mRes.json();
          setMedia(mJ.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Eğitmen Bulunamadı</h1>
        <Link href="/egitmenler" className="text-sky-600 hover:underline flex items-center gap-2">
          <ChevronLeft size={20} /> Eğitmenlere Dön
        </Link>
      </div>
    );
  }

  return (
    <main className="bg-white min-h-screen pb-20">
      {/* Üst Navigasyon */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/egitmenler"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-sky-600 transition-colors text-sm font-medium group"
        >
          <div className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-sky-600 transition-colors">
            <ChevronLeft size={16} />
          </div>
          EĞİTMENLERE DÖN
        </Link>
      </div>

      {/* Hero Section - 2 Column Layout */}
      <section className="max-w-6xl mx-auto px-4 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Sol: Fotoğraf */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 w-full"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 shadow-2xl rounded-sm">
              <Image
                src={data.photo || '/assets/images/placeholder.jpg'}
                alt={data.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </motion.div>

          {/* Sağ: Bilgiler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 pt-4"
          >
            <h1 className="text-5xl md:text-6xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none mb-4">
              {data.name}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium text-sky-600 italic mb-8">
              {data.expertise}
            </h2>


            {/* Biyografi - Kısa Giriş */}
            <div className="prose prose-neutral max-w-none mb-10">
              <p className="text-lg text-neutral-600 leading-relaxed font-light">
                {data.bio}
              </p>
            </div>

            {/* İletişim & Sosyal Medya */}
            <div className="flex flex-wrap items-center gap-6">
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="bg-neutral-900 text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg flex items-center gap-3"
                >
                  <Mail size={16} /> İletişime Geç
                </a>
              )}

              <div className="flex items-center gap-4">
                {data.social_links?.instagram && (
                  <a href={data.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-sky-600 hover:border-sky-600 transition-all">
                    <Instagram size={20} />
                  </a>
                )}
                {data.social_links?.linkedin && (
                  <a href={data.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-sky-600 hover:border-sky-600 transition-all">
                    <Linkedin size={20} />
                  </a>
                )}
                {data.social_links?.twitter && (
                  <a href={data.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-sky-600 hover:border-sky-600 transition-all">
                    <Twitter size={20} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Projeler & Kariyer Section */}
      {data.projects && data.projects.length > 0 && (
        <section className="bg-neutral-50 py-24">
          <div className="max-w-6xl mx-auto px-4">
            <SectionHeader
              title="KARİYER & PROJELER"
              subtitle="Sanatsal Üretim ve Deneyimler"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {data.projects.map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-sm shadow-sm border border-neutral-100 hover:border-sky-200 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center">
                      {cat.category.toLowerCase().includes('tiyatro') ? <BookOpen size={20} /> : <Film size={20} />}
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900">
                      {cat.category}
                    </h3>
                  </div>
                  <ul className="space-y-4">
                    {cat.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-neutral-500 leading-snug">
                        <Star size={10} className="mt-1 text-sky-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verdiği Eğitimler / Atölyeler Section */}
      {data.events && data.events.length > 0 && (
        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4">
            <SectionHeader
              title="VERDİĞİ EĞİTİMLER"
              subtitle="Aktif Atölyeler ve Programlar"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {data.events.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -10 }}
                  className="group cursor-pointer"
                >
                  <Link href={`/etkinlikler/${event.slug}`}>
                    <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 shadow-lg border border-neutral-100">
                      <Image
                        src={event.poster_image || '/assets/images/placeholder.jpg'}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-sky-600 self-start px-3 py-1 mb-2">
                          İNCELE
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter text-neutral-900 leading-none">
                      {event.title}
                    </h3>
                    <p className="text-[10px] uppercase font-bold text-sky-600 mt-2 tracking-widest">
                      {event.event_type}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Galeri Section */}
      {media.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-24">
          <SectionHeader
            title="PORTFOLYO GALERİSİ"
            subtitle="Performanslar ve Sahne Arkası"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-16">
            {media.map((m, i) => (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square bg-neutral-100 overflow-hidden rounded-sm group cursor-pointer"
              >
                <Image
                  src={m.url}
                  alt={m.original_name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {m.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-sky-600 shadow-xl">
                      <Film size={24} fill="currentColor" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
