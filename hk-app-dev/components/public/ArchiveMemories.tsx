"use client";
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { motion } from 'framer-motion';

interface TrainingItem {
  id: number;
  title: string;
  poster_image?: string;
  slug?: string;
}

export default function ArchiveMemories() {
  const [items, setItems] = useState<TrainingItem[]>([]);

  useEffect(() => {
    fetch('/api/trainings?archive=true&limit=10')
      .then((r) => r.json())
      .then((data) => {
        setItems(data?.data || []);
      })
      .catch((err) => console.error('[ArchiveMemories]', err));
  }, []);

  if (items.length === 0) return <div className="text-sm text-neutral-500 py-4">Arşivde gösterilecek anılar yok.</div>;

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-lora italic text-2xl font-bold tracking-tight">Akademi Anıları</h2>
        <span className="text-xs uppercase tracking-widest text-neutral-400">Geçmişten Bugüne</span>
      </div>

      {/* Native CSS Horizontal Scroll Wrapper */}
      <div className="relative overflow-hidden -mx-4 px-4">
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory">
          {items.map((it) => (
            <motion.div
              key={it.id}
              whileHover={{ y: -5 }}
              className="flex-shrink-0 w-40 md:w-48 snap-start"
            >
              <Card className="overflow-hidden border-none shadow-lg">
                <AspectRatio ratio={3 / 4}>
                  <Image
                    src={it.poster_image || '/assets/images/placeholder.jpg'}
                    alt={it.title}
                    fill
                    sizes="(max-width: 768px) 160px, 192px"
                    className="object-cover grayscale hover:grayscale-0 transition-all duration-500"
                  />
                </AspectRatio>
                <div className="p-3 bg-neutral-900">
                  <p className="text-xs font-medium text-white line-clamp-1">{it.title}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
