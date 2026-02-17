import React from 'react';
import { query } from '@/lib/db';
import { sanitize } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'İletişim - Hakan Karsak Akademi' };

export default async function ContactPage() {
  const res = await query('SELECT title, content FROM pages WHERE slug=$1 LIMIT 1', ['iletisim']);
  const page = res.rows[0];
  const html = page?.content ? sanitize(page.content) : '';

  return (
    <div className="py-6">
      <h1 className="text-2xl font-semibold mb-4">{page?.title || 'İletişim'}</h1>
      {html ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p>İletişim bilgileri yakında eklenecek.</p>
      )}
    </div>
  );
}
