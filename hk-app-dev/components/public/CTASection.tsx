"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <section className="w-full bg-black text-white py-20 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="font-lora text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
              Sahnede Yerinizi Alın
            </h2>
            <p className="text-base md:text-lg text-white/60 max-w-2xl mx-auto font-medium">
              Hakan Karsak Akademi'de sanat yolculuğunuza bugün başlayın. Profesyonel eğitmenler eşliğinde yeteneklerinizi keşfedin.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Link href="/etkinlikler">
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 rounded-none px-12 py-6 font-bold uppercase tracking-widest text-sm shadow-2xl"
              >
                Etkinliklere Göz At
              </Button>
            </Link>
            <Link href="/iletisim">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/20 text-white hover:bg-white hover:text-black rounded-none px-12 py-6 font-bold uppercase tracking-widest text-sm"
              >
                İletişime Geç
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
