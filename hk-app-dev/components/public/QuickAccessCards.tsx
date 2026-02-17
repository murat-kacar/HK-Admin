"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const branches = [
  {
    title: 'Oyunculuk',
    slug: 'oyunculuk',
    image: '/assets/images/acting.jpg',
    desc: 'Sahne sanatlarının temelleri ve ileri oyunculuk teknikleri.'
  },
  {
    title: 'Kamera Önü',
    slug: 'kamera-onu',
    image: '/assets/images/camera.jpg',
    desc: 'Sinema ve dizi dünyası için profesyonel hazırlık.'
  },
  {
    title: 'Diksiyon',
    slug: 'diksiyon',
    image: '/assets/images/voice.jpg',
    desc: 'Doğru nefes, hitabet ve etkileyici konuşma sanatı.'
  },
  {
    title: 'Müzik & Dans',
    slug: 'muzik-dans',
    image: '/assets/images/music.jpg',
    desc: 'Ritmin ve sesin büyüsüyle sahneyi canlandırın.'
  }
];

export default function BranchSelection() {
  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-sm uppercase tracking-[0.3em] text-neutral-400 font-bold mb-2">Eğitim Birimlerimiz</h2>
        <p className="text-3xl font-light text-neutral-800">İlgi alanınızı seçerek huniyi daraltın.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {branches.map((branch, index) => (
          <Link key={branch.slug} href={`/egitimler?kategori=${branch.slug}`}>
            <motion.div
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-72 overflow-hidden bg-neutral-900 ring-1 ring-white/10"
            >
              {/* Background Color/Pattern placeholder (Actual image would be here) */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-black transition-transform duration-700 group-hover:scale-110 opacity-60" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="w-10 h-0.5 bg-primary mb-4 transition-all duration-300 group-hover:w-full" />
                <h3 className="font-lora text-2xl font-semibold text-white mb-2">{branch.title}</h3>
                <p className="text-xs text-white/40 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {branch.desc}
                </p>
                <span className="mt-4 text-[10px] uppercase tracking-widest text-primary font-bold">Keşfet →</span>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
