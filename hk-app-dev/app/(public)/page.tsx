import React from 'react';
import HeroShowcase from '@/components/public/HeroShowcase';
import SectionHeader from '@/components/public/SectionHeader';
import QuickAccessCards from '@/components/public/QuickAccessCards';
import FeaturedSection from '@/components/public/FeaturedSection';
import ArchiveMemories from '@/components/public/ArchiveMemories';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="pb-24">
      {/* Dynamic Hero Section */}
      <HeroShowcase />

      {/* Primary Navigation / Branches */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-12 md:mt-24">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-12">
          <h2 className="font-lora text-4xl md:text-7xl font-black text-neutral-900 uppercase italic tracking-tighter">
            Keşfetmeye <br /> Başlayın
          </h2>
          <p className="text-neutral-500 font-medium max-w-xs text-sm md:text-base">
            Sanatın her dalında uzman eğitmenlerle kendinizi geliştirin. Branşınızı seçin.
          </p>
        </div>
        <QuickAccessCards />
      </div>

      {/* Featured Karnaval Section (Dynamic from DB) */}
      <FeaturedSection />

      {/* Memories Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-24">
        <ArchiveMemories />
      </div>

      {/* Academy Call to Action */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 mt-32">
        <div className="relative bg-neutral-900 rounded-[3rem] p-12 md:p-24 overflow-hidden text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-800/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-800/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

          <h2 className="font-lora relative z-10 text-4xl md:text-7xl font-black text-white uppercase italic tracking-tighter mb-8 leading-none">
            Hayallerinizi <br /> Sahneye Taşıyın
          </h2>
          <p className="relative z-10 text-neutral-400 font-medium text-lg mb-12 max-w-xl mx-auto">
            Hakan Karsak Akademi, sadece bir okul değil; sanatın kalbinin attığı bir topluluktur. Aramıza katılmak için ilk adımı atın.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="/egitimler" className="w-full sm:w-auto bg-red-800 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-white hover:text-red-800 transition-all shadow-2xl">
              PROGRAMLARI İNCELE
            </a>
            <a href="/iletisim" className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.3em] text-xs hover:bg-white/10 transition-all">
              BİZE ULAŞIN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
