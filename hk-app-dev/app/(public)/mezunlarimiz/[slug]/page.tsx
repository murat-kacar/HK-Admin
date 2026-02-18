import Link from 'next/link';

export const metadata = {
  title: 'Mezun Detayı - Hakan Karsak Akademi'
};

export default async function AlumniDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900 mb-4">Mezun Profili</h1>
      <p className="text-neutral-600 mb-2">Slug: <span className="font-semibold">{slug}</span></p>
      <p className="text-neutral-500 mb-8">Bu detay sayfası mezun veri modeli netleştiğinde eğitmen detay yapısına paralel biçimde tamamlanacak.</p>
      <Link href="/mezunlarimiz" className="text-sm font-semibold text-black hover:underline">
        Mezunlarımıza geri dön
      </Link>
    </main>
  );
}
