import React from 'react';
import { query } from '@/lib/db';
import TrainingCard from '@/components/public/TrainingCard';
import SectionHeader from '@/components/public/SectionHeader';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Eğitim Kataloğu - Hakan Karsak Akademi',
  description: 'Akademimizdeki tüm güncel atölye, eğitim ve sahne programlarını keşfedin.'
};

interface TrainingRow {
  id: number;
  title: string;
  description: string;
  slug: string;
  poster_image: string | null;
  event_type: string | null;
  highlight_tags: string[] | null;
  duration: string | null;
  level: string | null;
}

export default async function TrainingsPage({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;

  try {
    const where: string[] = ["status = 'active'"];
    const params: any[] = [];

    if (kategori) {
      params.push(kategori);
      where.push(`event_type = $${params.length}`);
    }

    const sql = `SELECT id, title, description, slug, poster_image, event_type, highlight_tags, duration, level FROM trainings WHERE ${where.join(' AND ')} ORDER BY display_order ASC, start_date ASC`;
    const res = await query<TrainingRow>(sql, params);
    const items = res.rows;

    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Başlık Bölümü */}
        <SectionHeader
          title="Eğitim Kataloğu"
          subtitle="Akademimizdeki sanat yolculuğuna ilk adımı atın."
        />

        {/* Grid Yapısı */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
            <p className="text-neutral-400 font-medium">Şu an aktif bir eğitim programı bulunmuyor. Daha sonra tekrar göz atın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {items.map((it) => (
              <TrainingCard
                key={it.id}
                id={it.id}
                slug={it.slug}
                title={it.title}
                description={it.description}
                poster_image={it.poster_image || undefined}
                category={it.event_type || undefined}
                level={it.level || undefined}
                duration={it.duration || undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('[TrainingsPage]', err);
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-red-800 uppercase italic mb-4">Bir Hata Oluştu</h1>
        <p className="text-neutral-500">Eğitimler yüklenirken bir sorun yaşandı. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }
}
