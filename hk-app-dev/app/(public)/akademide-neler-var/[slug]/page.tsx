import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Calendar, MapPin } from 'lucide-react';
import { notFound } from 'next/navigation';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface EventData {
  id: number;
  title: string;
  description: string;
  content?: string;
  event_type: string | null;
  start_date: string | null;
  end_date: string | null;
  location: string | null;
  image_url: string | null;
  slug: string;
  metadata?: EventMetadata;
}

interface FeaturedFilm {
  title: string;
  year?: string;
  awards?: string[];
}

interface PastPerformance {
  venue?: string;
  date?: string;
}

interface EventMetadata {
  author?: string;
  translator?: string;
  director?: string;
  guest?: string;
  guest_team?: string;
  artist?: string;
  duration?: string;
  is_free?: boolean;
  actors?: string[];
  crew?: string[];
  featured_films?: FeaturedFilm[];
  past_performances?: PastPerformance[];
  highlights?: string[];
  [key: string]: unknown;
}

async function getEvent(slug: string) {
  try {
    const res = await query<EventData>(
      'SELECT id, title, slug, description, content, event_type, start_date, end_date, location, image_url, metadata FROM events WHERE slug = $1 AND is_active = true',
      [slug]
    );
    const event = res.rows[0] || null;
    if (event && typeof event.metadata === 'string') {
      event.metadata = JSON.parse(event.metadata);
    }
    return event;
  } catch (err) {
    console.error('[getEvent]', err);
    return null;
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) {return '';}
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate) {return '';}
  if (!endDate) {return formatDate(startDate);}
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startFormatted = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(start);
  const endFormatted = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(end);
  
  return `${startFormatted} - ${endFormatted}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  return {
    title: event?.title || 'Etkinlik',
    description: event?.description || 'Akademide Neler Var'
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-neutral-900">
        <Image
          src={event.image_url || '/assets/images/placeholder.jpg'}
          alt={event.title}
          fill
          className="object-cover opacity-40 hover:opacity-60 transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <Link
              href="/akademide-neler-var"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold tracking-widest uppercase"
            >
              <ChevronLeft size={16} /> ETKİNLİKLERE DÖN
            </Link>

            <div className="mb-8">
              {event.event_type && (
                <span className="bg-sky-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-xl">
                  {event.event_type}
                </span>
              )}
              <h1 className="font-lora text-5xl md:text-8xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none mb-6">
                {event.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-neutral-600 font-bold text-xs uppercase tracking-widest">
                {event.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-sky-600" /> {formatDate(event.start_date)}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-sky-600" /> {event.location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Sol Kolon: Açıklama & İçerik */}
          <div className="lg:col-span-8">
            {/* Etkinlik Açıklaması */}
            <div className="prose prose-neutral max-w-none mb-20">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-8">Etkinlik Hakkında</h2>
              <p className="text-xl text-neutral-600 font-light leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Detaylı İçerik */}
            {event.content && (
              <div className="prose prose-neutral max-w-none mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-8">Detaylar</h2>
                <div className="text-lg text-neutral-600 font-light leading-relaxed whitespace-pre-wrap">
                  {event.content}
                </div>
              </div>
            )}

            {/* Metadata Bilgileri */}
            {event.metadata && Object.keys(event.metadata).length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-10">Etkinlik Bilgileri</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {event.metadata.author && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">YAZAR</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.author}</p>
                    </div>
                  )}
                  {event.metadata.translator && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">ÇEVİREN</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.translator}</p>
                    </div>
                  )}
                  {event.metadata.director && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">YÖNETMEN</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.director}</p>
                    </div>
                  )}
                  {event.metadata.guest && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">KONUK</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.guest}</p>
                    </div>
                  )}
                  {event.metadata.guest_team && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">KONUK EKIP</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.guest_team}</p>
                    </div>
                  )}
                  {event.metadata.artist && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">SANATÇI</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.artist}</p>
                    </div>
                  )}
                  {event.metadata.artist && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">SANAT YÖNETMENI</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.artist}</p>
                    </div>
                  )}
                  {event.metadata.duration && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">SÜRE</p>
                      <p className="text-lg text-neutral-900 font-semibold">{event.metadata.duration}</p>
                    </div>
                  )}
                  {event.metadata.is_free && (
                    <div>
                      <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">GİRİŞ</p>
                      <p className="text-lg text-neutral-900 font-semibold text-green-600">Ücretsiz</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Oyuncular */}
            {event.metadata?.actors && Array.isArray(event.metadata.actors) && event.metadata.actors.length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-6">OYUNCULAR</h2>
                <div className="flex flex-wrap gap-4">
                  {event.metadata.actors.map((actor: string, idx: number) => (
                    <span key={idx} className="bg-neutral-50 px-4 py-2 rounded-full text-sm font-semibold text-neutral-700">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ekip */}
            {event.metadata?.crew && Array.isArray(event.metadata.crew) && event.metadata.crew.length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-6">EKIP</h2>
                <div className="flex flex-wrap gap-4">
                  {event.metadata.crew.map((member: string, idx: number) => (
                    <span key={idx} className="bg-neutral-50 px-4 py-2 rounded-full text-sm font-semibold text-neutral-700">
                      {member}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Öne Çıkan Filmler */}
            {event.metadata?.featured_films && Array.isArray(event.metadata.featured_films) && event.metadata.featured_films.length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-6">ÖZEL SALINSıN OLAN FİLMLER</h2>
                <div className="space-y-6">
                  {event.metadata.featured_films.map((film: FeaturedFilm, idx: number) => (
                    <div key={idx} className="border-l-4 border-sky-600 pl-6 py-2">
                      <p className="text-lg font-black text-neutral-900">{film.title}</p>
                      {film.year && <p className="text-sm text-neutral-500">{film.year}</p>}
                      {film.awards && Array.isArray(film.awards) && film.awards.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {film.awards.map((award: string, aidx: number) => (
                            <span key={aidx} className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                              ⭐ {award}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geçmiş Gösterimler */}
            {event.metadata?.past_performances && Array.isArray(event.metadata.past_performances) && event.metadata.past_performances.length > 0 && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-6">GEÇMIŞ GÖSTERİMLER</h2>
                <div className="space-y-4">
                  {event.metadata.past_performances.map((perf: PastPerformance, idx: number) => (
                    <div key={idx} className="bg-neutral-50 p-4 rounded-lg">
                      <p className="font-bold text-neutral-900">{perf.venue || 'Mekan'}</p>
                      {perf.date && <p className="text-sm text-neutral-500">{perf.date}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sağ Kolon: Özet Bilgi Kutusu */}
          <aside className="lg:col-span-4">
            <div className="sticky top-8 bg-neutral-50 rounded-3xl p-8 border border-neutral-100">
              <h3 className="text-sm font-black uppercase tracking-[0.3em] text-sky-600 mb-8">ETKİNLİK DETAYLARı</h3>

              {event.event_type && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">Tür</p>
                  <p className="text-base font-bold text-neutral-900">{event.event_type}</p>
                </div>
              )}

              {event.start_date && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">Tarih</p>
                  <p className="text-base font-bold text-neutral-900">{formatDate(event.start_date)}</p>
                </div>
              )}

              {event.location && (
                <div className="mb-6 pb-6 border-b border-neutral-200">
                  <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-2">Mekan</p>
                  <p className="text-base font-bold text-neutral-900">{event.location}</p>
                </div>
              )}

              {event.metadata?.highlights && Array.isArray(event.metadata.highlights) && event.metadata.highlights.length > 0 && (
                <div>
                  <p className="text-xs uppercase font-black text-neutral-400 tracking-widest mb-4">Neler Var</p>
                  <ul className="space-y-2">
                    {event.metadata.highlights.map((highlight: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-neutral-700">
                        <span className="text-sky-600 font-bold mt-0.5">✓</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
