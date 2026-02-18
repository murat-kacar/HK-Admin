import Link from 'next/link';
import SectionHeader from '@/components/public/SectionHeader';

export const metadata = {
  title: 'Mezunlarımız - Hakan Karsak Akademi',
  description: 'Mezunlarımız çok yakında bu sayfada yer alacak.'
};

export default function AlumniPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <SectionHeader
        title="Mezunlarımız"
        subtitle="Mezun listesi ve mezun profilleri bu alanda yayınlanacak."
      />

      <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
        <p className="text-neutral-600 font-medium mb-3">Bu sayfa hazırlanıyor.</p>
        <p className="text-neutral-500 text-sm">Alan yapısı netleştiğinde eğitmenler sayfasına benzer liste ve detay akışı açılacak.</p>
        <Link href="/egitmenler" className="inline-block mt-6 text-sm font-semibold text-black hover:underline">
          Eğitmenlerimiz sayfasına git
        </Link>
      </div>
    </div>
  );
}
