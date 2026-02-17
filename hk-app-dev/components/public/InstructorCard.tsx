"use client";
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, User } from 'lucide-react';

interface InstructorCardProps {
    id: number;
    name: string;
    bio?: string;
    photo?: string;
    expertise?: string;
    slug: string;
}

export default function InstructorCard({
    name,
    bio,
    photo,
    expertise,
    slug
}: InstructorCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <Card className="overflow-hidden border-none shadow-xl bg-white group flex flex-col h-full rounded-2xl">
                {/* Fotoğraf Alanı - 4:5 Oranı (Dikey Profil) */}
                <div className="relative w-full aspect-[4/5] overflow-hidden bg-neutral-100">
                    <Image
                        src={photo || '/assets/images/placeholder.jpg'}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>

                {/* İçerik Alanı */}
                <div className="p-6 md:p-8 flex flex-col flex-1">
                    <h3 className="font-lora text-2xl font-semibold text-neutral-900 mb-2 leading-tight">
                        {name}
                    </h3>



                    <p className="text-sm text-neutral-500 line-clamp-3 mb-6 font-medium leading-relaxed">
                        {bio || 'Eğitmen biyografisi henüz eklenmemiş.'}
                    </p>

                    {/* Butonlar */}
                    <div className="flex items-center gap-3 mt-auto">
                        <Link href={`/egitmenler/${slug}`} className="w-full">
                            <Button variant="outline" className="w-full rounded-full border-neutral-200 text-neutral-600 font-bold uppercase tracking-widest text-[10px] py-6 hover:bg-neutral-50">
                                Profilini İncele
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
