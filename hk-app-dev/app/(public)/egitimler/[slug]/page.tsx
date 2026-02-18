"use client";
import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar, Clock, MapPin, BarChart, CheckCircle2, User, ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/public/SectionHeader';
import ApplicationForm from '@/components/public/ApplicationForm';
import { useSearchParams } from 'next/navigation';

interface Instructor {
  id: number;
  name: string;
  slug: string;
  photo: string | null;
  expertise: string | null;
}

interface TrainingData {
  id: number;
  title: string;
  description: string;
  event_type: string;
  duration: string;
  level: string;
  timing: string;
  detail_content: string;
  poster_image: string;
  slug: string;
  metadata?: {
    gains?: string[];
  };
}

export default function TrainingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const shouldApply = searchParams.get('apply') === 'true';

  const [data, setData] = useState<TrainingData | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/trainings/slug/${slug}`);
        const j = await res.json();
        if (j.data) {
          const training = j.data;
          if (typeof training.metadata === 'string') {training.metadata = JSON.parse(training.metadata);}
          setData(training);
          setInstructors(training.instructors || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Scroll to application form if apply=true
  useEffect(() => {
    if (shouldApply && !loading) {
      const el = document.getElementById('apply-section');
      if (el) {el.scrollIntoView({ behavior: 'smooth' });}
    }
  }, [shouldApply, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-4 border-neutral-100 border-t-red-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {return notFound();}

  return (
    <main className="bg-white min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden bg-neutral-900">
        <Image
          src={data.poster_image || '/assets/images/placeholder.jpg'}
          alt={data.title}
          fill
          className="object-cover opacity-40 grayscale-0 hover:grayscale transition-all duration-1000"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-12">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <Link
              href="/egitimler"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-bold tracking-widest uppercase"
            >
              <ChevronLeft size={16} /> EĞİTİMLERE DÖN
            </Link>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="bg-red-800 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 inline-block shadow-xl">
                {data.event_type}
              </span>
              <h1 className="font-lora text-5xl md:text-8xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none mb-6">
                {data.title}
              </h1>

              <div className="flex flex-wrap gap-8 text-neutral-600 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-red-800" /> {data.duration}
                </div>
                <div className="flex items-center gap-2">
                  <BarChart size={16} className="text-red-800" /> {data.level}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-red-800" /> {data.timing}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

          {/* Sol Kolon: Açıklama & Kazanımlar */}
          <div className="lg:col-span-8">
            {/* Eğitim Açıklaması */}
            <div className="prose prose-neutral max-w-none mb-20">
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-800 mb-8">Eğitim Hakkında</h2>
              <p className="text-xl text-neutral-600 font-light leading-relaxed whitespace-pre-wrap">
                {data.description}
              </p>
            </div>

            {/* Kazanımlar */}
            {(data.detail_content || (data.metadata?.gains && data.metadata.gains.length > 0)) && (
              <div className="mb-20">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-800 mb-10">Kazanımlar ve İçerik</h2>
                {data.metadata?.gains && data.metadata.gains.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {data.metadata.gains.map((gain, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-4 p-6 bg-neutral-50 rounded-sm border-l-2 border-red-800"
                      >
                        <CheckCircle2 size={18} className="text-red-800 mt-1 flex-shrink-0" />
                        <span className="text-sm font-medium text-neutral-600 leading-tight">{gain}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-neutral-600 font-light leading-relaxed whitespace-pre-wrap">
                      {data.detail_content}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağ Kolon: Eğitmenler & Sidebar */}
          <div className="lg:col-span-4 space-y-12">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-red-800 mb-8">Eğitmenler</h2>
              <div className="space-y-6">
                {instructors.map((inst) => (
                  <motion.div
                    key={inst.id}
                    whileHover={{ x: 5 }}
                    className="group"
                  >
                    <Link href={`/egitmenler/${inst.slug}`} className="flex items-center gap-5 p-4 bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-all rounded-sm">
                      <div className="relative w-16 h-20 overflow-hidden bg-neutral-100 flex-shrink-0 rounded-sm">
                        <Image
                          src={inst.photo || '/assets/images/placeholder.jpg'}
                          alt={inst.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black uppercase tracking-tight text-neutral-900 group-hover:text-red-800 transition-colors">
                          {inst.name}
                        </h3>
                        <p className="text-[10px] uppercase font-bold text-neutral-400 mt-1">
                          {inst.expertise}
                        </p>
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase text-red-800 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          PROFİLİ İNCELE <ArrowRight size={10} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Hızlı Başvuru Kartı (Sidebar) */}
            <div className="bg-neutral-900 p-8 rounded-sm shadow-2xl skew-y-0 hover:-skew-y-1 transition-transform duration-500">
              <h3 className="text-white font-black uppercase tracking-widest text-lg mb-4">ŞİMDİ KATILIN</h3>
              <p className="text-neutral-400 text-xs font-medium mb-8 leading-relaxed">
                Kontenjanlar sınırlıdır. Sanat dolu bir yolculuk için ilk adımı hemen atın.
              </p>
              <button
                onClick={() => document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-red-800 text-white py-4 rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white hover:text-red-800 transition-all flex items-center justify-center gap-3"
              >
                BAŞVURU FORMU <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Başvuru Formu Section */}
      <section id="apply-section" className="bg-neutral-50 py-24 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto px-4">
          <SectionHeader
            title="KAYIT VE BAŞVURU"
            subtitle="Hayallerinizi Sahneye Taşımak İçin Formu Doldurun"
          />
          <div className="mt-16 bg-white p-8 md:p-12 shadow-2xl border border-neutral-100 rounded-sm">
            <ApplicationForm
              training_id={data.id}
              training_title={data.title}
              training_date={data.timing}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function notFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-2xl font-bold text-neutral-900 mb-4">Eğitim Bulunamadı</h1>
      <Link href="/egitimler" className="text-red-800 hover:underline flex items-center gap-2">
        <ChevronLeft size={20} /> Eğitimlere Dön
      </Link>
    </div>
  );
}
