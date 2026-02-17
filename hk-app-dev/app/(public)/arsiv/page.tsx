import React from 'react';
import { query } from '@/lib/db';
import TrainingCard from '@/components/public/TrainingCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Arşiv - Hakan Karsak Akademi' };

interface TrainingRow {
  id: number;
  title: string;
  slug: string;
  poster_image: string | null;
  event_type: string | null;
  description: string | null;
}

export default async function ArchivePage() {
  try {
    const res = await query<TrainingRow>(
      `SELECT id, title, slug, poster_image, event_type, description, start_date
       FROM trainings
       WHERE status != 'deleted' AND COALESCE(end_date, start_date) < CURRENT_DATE
       ORDER BY start_date DESC LIMIT 100`
    );
    const items = res.rows;

    return (
      <div className="py-6 w-full max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-semibold mb-2">Arşiv</h1>
        <p className="text-muted-foreground text-sm mb-6">Geçmiş eğitim ve etkinliklerimiz</p>
        {items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Arşivde henüz kayıt bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((it) => (
              <TrainingCard
                key={it.id}
                id={it.id}
                slug={it.slug || String(it.id)}
                title={it.title}
                poster_image={it.poster_image || undefined}
                category={it.event_type || undefined}
                description={it.description || undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (_err) {
    return (
      <div className="py-6 w-full max-w-6xl mx-auto px-6">
        <h1 className="text-2xl font-semibold mb-4">Arşiv</h1>
        <div>Veri alınırken hata oluştu.</div>
      </div>
    );
  }
}
