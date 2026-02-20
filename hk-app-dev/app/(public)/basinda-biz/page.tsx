import Link from 'next/link';
import SectionHeader from '@/components/public/SectionHeader';
import { query } from '@/lib/db';

export const metadata = {
  title: 'Basında Biz - Hakan Karsak Akademi'
};

type PressNewsItem = {
  id: number;
  title: string;
  excerpt: string | null;
  source_name: string | null;
  source_url: string | null;
  image_url: string | null;
  published_at: string | null;
};

export default async function PressPage() {
  const response = await query<PressNewsItem>(
    `SELECT
      id,
      title,
      excerpt,
      source_name,
      source_url,
      image_url,
      published_at
    FROM press_news
    WHERE is_active = true
    ORDER BY display_order ASC, published_at DESC NULLS LAST, id DESC
    LIMIT 100`
  );

  const items = response.rows;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <SectionHeader
        title="Basında Biz"
        subtitle="Akademimiz hakkında basında yer alan haber ve röportajlar."
      />

      {items.length === 0 ? (
        <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
          <p className="text-neutral-600 font-medium">Henüz yayınlanmış basın içeriği bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map((item) => (
            <article key={item.id} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-5 md:p-6">
                <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-3">{item.title}</h3>

                {item.excerpt && (
                  <p className="text-sm text-neutral-600 leading-relaxed mb-4 line-clamp-4">{item.excerpt}</p>
                )}

                <div className="text-xs text-neutral-500 mb-4">
                  {item.source_name && <span>{item.source_name}</span>}
                  {item.source_name && item.published_at && <span> • </span>}
                  {item.published_at && (
                    <span>{new Date(item.published_at).toLocaleDateString('tr-TR')}</span>
                  )}
                </div>

                {item.source_url ? (
                  <Link
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-semibold text-black hover:underline"
                  >
                    Habere Git
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-neutral-400">Kaynak linki yakında</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
