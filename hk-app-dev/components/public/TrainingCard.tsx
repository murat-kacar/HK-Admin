"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Clock, BarChart } from 'lucide-react';

interface TrainingCardProps {
  id: number;
  title: string;
  description?: string;
  poster_image?: string;
  slug: string;
  category?: string;
  duration?: string;
  level?: string;
  _source?: 'training' | 'event';
}

export default function TrainingCard({
  title,
  description,
  poster_image,
  slug,
  category,
  duration = "Belirtilmedi",
  level = "Tüm Seviyeler",
  _source = 'training'
}: TrainingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="overflow-hidden border-none shadow-xl bg-white group flex flex-col h-full rounded-2xl">
        {/* Görsel Alanı - 5:4 Oranı */}
        <div className="relative w-full aspect-[5/4] overflow-hidden bg-neutral-100">
          <Image
            src={poster_image || '/assets/images/placeholder.jpg'}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* İçerik Alanı */}
        <div className="p-6 md:p-8 flex flex-col flex-1">
          <h3 className="font-lora text-2xl font-bold text-neutral-900 mb-4 leading-tight">
            {title}
          </h3>

          <p className="text-sm text-neutral-500 line-clamp-3 mb-6 font-medium leading-relaxed">
            {description || 'Bu eğitim için henüz bir açıklama girilmemiş.'}
          </p>

          {/* Meta Bilgiler */}
          <div className="flex flex-wrap gap-4 mt-auto mb-8 border-t border-neutral-50 pt-6">
            <div className="flex items-center gap-2 text-neutral-400">
              <BarChart size={14} className="text-red-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{level}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <Clock size={14} className="text-red-700" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{duration}</span>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex items-center gap-3">
            <Link href={_source === 'event' ? `/akademide-neler-var/${slug}` : `/egitimler/${slug}`} className="flex-1">
              <Button variant="outline" className="w-full rounded-full border-neutral-200 text-neutral-600 font-bold uppercase tracking-widest text-[10px] py-6 hover:bg-neutral-50">
                Detaylar
              </Button>
            </Link>
            <Link href={_source === 'event' ? `/akademide-neler-var/${slug}` : `/egitimler/${slug}?apply=true`} className="flex-1">
              <Button className="w-full rounded-full bg-red-800 hover:bg-red-900 text-white font-bold uppercase tracking-widest text-[10px] py-6 shadow-lg shadow-red-900/20">
                {_source === 'event' ? 'Detaylar' : 'Başvuru Yap'}
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
