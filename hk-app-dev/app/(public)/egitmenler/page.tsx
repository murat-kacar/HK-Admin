import React from 'react';
import { query } from '@/lib/db';
import InstructorCard from '@/components/public/InstructorCard';
import SectionHeader from '@/components/public/SectionHeader';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Eğitmenlerimiz - Hakan Karsak Akademi',
  description: 'Alanında uzman, profesyonel eğitmen kadromuzla tanışın.'
};

interface InstructorRow {
  id: number;
  name: string;
  bio: string;
  photo: string | null;
  expertise: string | null;
  slug: string;
}

export default async function InstructorsPage() {
  try {
    const res = await query<InstructorRow>(
      "SELECT id, name, bio, photo, expertise, slug FROM instructors ORDER BY display_order ASC, name ASC"
    );
    const items = res.rows;

    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
        {/* Başlık Bölümü */}
        <SectionHeader
          title="Eğitmen Kadromuz"
          subtitle="Sanat yolculuğunuzda size rehberlik edecek profesyonellerle tanışın."
        />

        {/* Grid Yapısı */}
        {items.length === 0 ? (
          <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
            <p className="text-neutral-400 font-medium">Şu an listelenecek eğitmen bulunmuyor. Daha sonra tekrar göz atın.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {items.map((it) => (
              <InstructorCard
                key={it.id}
                id={it.id}
                slug={it.slug}
                name={it.name}
                bio={it.bio}
                photo={it.photo || undefined}
                expertise={it.expertise || undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  } catch (err) {
    console.error('[InstructorsPage]', err);
    return (
      <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-20 text-center">
        <h1 className="text-2xl font-black text-red-800 uppercase italic mb-4">Bir Hata Oluştu</h1>
        <p className="text-neutral-500">Eğitmenler yüklenirken bir sorun yaşandı. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }
}
