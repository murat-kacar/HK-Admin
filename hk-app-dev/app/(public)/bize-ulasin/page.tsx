import SectionHeader from '@/components/public/SectionHeader';

export const metadata = {
  title: 'Bize Ulaşın - Hakan Karsak Akademi'
};

export default function ContactUsPage() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
      <SectionHeader
        title="Bize Ulaşın"
        subtitle="İletişim içerikleri bu sayfada yayınlanacak."
      />

      <div className="text-center py-20 bg-neutral-50 rounded-3xl border border-dashed border-neutral-200">
        <p className="text-neutral-600 font-medium">Bize Ulaşın sayfası hazırlanıyor.</p>
      </div>
    </div>
  );
}
