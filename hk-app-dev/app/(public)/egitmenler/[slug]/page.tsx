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

interface MediaItem {
  id: number;
  url: string;
  original_name?: string;
  thumbnail_url?: string;
  media_type?: string;
}

export default function InstructorDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [instructorData, setInstructorData] = useState<InstructorData | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const instructorResponse = await fetch(`/api/instructors/slug/${slug}`);
        const instructorPayload = await instructorResponse.json();
        if (instructorPayload.data) {
          const instructor = instructorPayload.data as InstructorData;
          // Parse JSON if needed
          if (typeof instructor.projects === 'string') {instructor.projects = JSON.parse(instructor.projects);}
          if (typeof instructor.social_links === 'string') {instructor.social_links = JSON.parse(instructor.social_links);}
          setInstructorData(instructor);

          // Fetch Media
          const mediaResponse = await fetch(`/api/media?entity_type=instructor&entity_id=${instructor.id}`);
          const mediaPayload = await mediaResponse.json();
          setMediaItems((mediaPayload.data || []) as MediaItem[]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructorData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-neutral-200 border-t-sky-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!instructorData) {
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

          {/* Sol: Fotoğraf + İletişim */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 w-full flex flex-col gap-6"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 shadow-2xl rounded-sm">
              <Image
                src={instructorData.photo || '/assets/images/placeholder.jpg'}
                alt={instructorData.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* İletişim & Sosyal Medya - Kompakt */}
            <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-200">
              <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4">
                İletişim
              </h3>
              <div className="space-y-3">
                {instructorData.email && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail size={14} />
                    </div>
                    <a
                      href={`mailto:${instructorData.email}`}
                      className="text-xs text-neutral-700 hover:text-sky-600 transition-colors font-medium break-all leading-tight"
                    >
                      {instructorData.email}
                    </a>
                  </div>
                )}

                {instructorData.social_links?.instagram && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Instagram size={14} />
                    </div>
                    <a
                      href={instructorData.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-700 hover:text-sky-600 transition-colors font-medium break-all leading-tight"
                    >
                      {instructorData.social_links.instagram.replace('https://www.', '')}
                    </a>
                  </div>
                )}

                {instructorData.social_links?.twitter && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Twitter size={14} />
                    </div>
                    <a
                      href={instructorData.social_links.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-700 hover:text-sky-600 transition-colors font-medium break-all leading-tight"
                    >
                      {instructorData.social_links.twitter.replace('https://', '')}
                    </a>
                  </div>
                )}

                {instructorData.social_links?.tiyatrolar && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe size={14} />
                    </div>
                    <a
                      href={instructorData.social_links.tiyatrolar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-700 hover:text-sky-600 transition-colors font-medium break-all leading-tight"
                    >
                      {instructorData.social_links.tiyatrolar.replace('https://', '')}
                    </a>
                  </div>
                )}

                {instructorData.social_links?.linkedin && instructorData.social_links.linkedin && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-sky-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                      <Linkedin size={14} />
                    </div>
                    <a
                      href={instructorData.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-neutral-700 hover:text-sky-600 transition-colors font-medium break-all leading-tight"
                    >
                      {instructorData.social_links.linkedin.replace('https://', '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Verdiği Eğitimler */}
            {instructorData.events && instructorData.events.length > 0 && (
              <div className="bg-neutral-50 p-6 rounded-sm border border-neutral-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4">
                  Verdiği Eğitimler
                </h3>
                <div className="space-y-3">
                  {instructorData.events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/egitimler/${event.slug}`}
                      className="block p-3 bg-white border border-neutral-100 rounded-sm hover:border-sky-400 hover:shadow-md transition-all group"
                    >
                      <p className="text-xs font-bold text-neutral-900 group-hover:text-sky-600 transition-colors leading-tight">
                        {event.title}
                      </p>
                      <p className="text-[10px] text-neutral-500 mt-1.5 uppercase font-semibold tracking-wide">
                        {event.event_type}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sağ: Bilgiler */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 pt-4 flex flex-col gap-12"
          >
            <div>
              <h1 className="font-lora text-5xl md:text-6xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none mb-4">
                {instructorData.name}
              </h1>
              <h2 className="text-xl md:text-2xl font-medium text-sky-600 italic mb-8">
                {instructorData.expertise}
              </h2>

              {/* Biyografi - Kısa Giriş */}
              <div className="prose prose-neutral max-w-none">
                <p className="text-lg text-neutral-600 leading-relaxed font-light">
                  {instructorData.bio}
                </p>
              </div>
            </div>

            {/* Kariyer & Projeler - Kompakt */}
            {instructorData.projects && instructorData.projects.length > 0 && (
              <div className="border-t border-neutral-200 pt-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-neutral-900 mb-6">
                  Kariyer & Projeler
                </h3>
                <div className="space-y-6">
                  {/* Tiyatro Oyunları */}
                  {instructorData.projects.find((p) => (p.category || '').includes('Tiyatro')) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-neutral-50 p-5 rounded-sm border border-neutral-200 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-sky-600 text-white rounded-full flex items-center justify-center">
                          <BookOpen size={16} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                          Tiyatro Oyunları
                        </h4>
                      </div>
                      <ul className="space-y-2">
                        {(instructorData.projects.find((p) => (p.category || '').includes('Tiyatro'))?.items || []).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600 leading-tight">
                            <span className="text-sky-600 font-bold flex-shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {/* Film & Dizi (2 Columns) */}
                  {(instructorData.projects.find((p) => (p.category || '').includes('Film')) || instructorData.projects.find((p) => (p.category || '').includes('Dizi'))) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-neutral-50 p-5 rounded-sm border border-neutral-200 hover:border-sky-300 transition-colors"
                    >
                      <h4 className="text-xs font-black uppercase tracking-widest text-neutral-900 mb-4">
                        Film & Dizi
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {/* Film Column */}
                        {instructorData.projects.find((p) => (p.category || '').includes('Film')) && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Film size={14} className="text-sky-600" />
                              <p className="text-xs font-bold text-neutral-700">Film</p>
                            </div>
                            <ul className="space-y-1.5">
                              {(instructorData.projects.find((p) => (p.category || '').includes('Film'))?.items || []).map((item, idx) => (
                                <li key={idx} className="text-xs text-neutral-600 leading-tight">
                                  <span className="text-sky-600 font-bold">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Dizi Column */}
                        {instructorData.projects.find((p) => (p.category || '').includes('Dizi')) && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Film size={14} className="text-sky-600" />
                              <p className="text-xs font-bold text-neutral-700">Dizi</p>
                            </div>
                            <ul className="space-y-1.5">
                              {(instructorData.projects.find((p) => (p.category || '').includes('Dizi'))?.items || []).map((item, idx) => (
                                <li key={idx} className="text-xs text-neutral-600 leading-tight">
                                  <span className="text-sky-600 font-bold">•</span> {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Galeri Section */}
      {mediaItems.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-24">
          <SectionHeader
            title="PORTFOLYO GALERİSİ"
            subtitle="Performanslar ve Sahne Arkası"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-16">
            {mediaItems.map((mediaItem) => (
              <motion.div
                key={mediaItem.id}
                whileHover={{ scale: 1.02 }}
                className="relative aspect-square bg-neutral-100 overflow-hidden rounded-sm group cursor-pointer"
              >
                <Image
                  src={mediaItem.url}
                  alt={mediaItem.original_name || instructorData.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {mediaItem.media_type === 'video' && (
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
