"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import TrainingCard from './TrainingCard';
import { motion } from 'framer-motion';

interface TrainingItem {
    id: number;
    title: string;
    description?: string;
    poster_image?: string;
    slug: string;
    event_type?: string;
    duration?: string;
    level?: string;
}

export default function FeaturedSection() {
    const [items, setItems] = useState<TrainingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // First attempt: trainings tagged for homepage
                const r = await fetch('/api/trainings?category=homepage&upcoming=true&limit=3');
                const data = await r.json();
                let featuredItems = data?.data || [];

                // Fallback: If no homepage tags, show first few upcoming trainings excluding those likely in hero
                if (featuredItems.length === 0) {
                    const r2 = await fetch('/api/trainings?upcoming=true&limit=6');
                    const data2 = await r2.json();
                    // Take 3-6 if we assume first 1-4 are in hero, or just take first 3 if hero is empty
                    featuredItems = data2?.data?.slice(0, 3) || [];
                }

                setItems(featuredItems);
            } catch (err) {
                console.error('[FeaturedSection]', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 md:px-6 py-20">
                <div className="h-8 w-48 bg-neutral-100 rounded animate-pulse mb-12" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => <div key={i} className="aspect-[4/5] bg-neutral-100 rounded-2xl animate-pulse" />)}
                </div>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <section className="bg-neutral-50 py-24 md:py-32">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-sm font-black uppercase tracking-[0.4em] text-red-800 mb-4">Seçili Eğitimler</h2>
                        <h3 className="text-4xl md:text-6xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none">
                            Sanat Hunisini <br className="hidden md:block" /> Daraltın
                        </h3>
                    </div>
                    <p className="text-neutral-500 font-medium max-w-sm">
                        Akademideki en güncel ve en çok tercih edilen programlarımızı sizin için derledik.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {items.map((it, idx) => (
                        <motion.div
                            key={it.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                        >
                            <TrainingCard
                                id={it.id}
                                title={it.title}
                                description={it.description}
                                poster_image={it.poster_image}
                                slug={it.slug}
                                category={it.event_type}
                                duration={it.duration}
                                level={it.level}
                            />
                        </motion.div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <motion.div whileHover={{ scale: 1.05 }} className="inline-block">
                        <Link
                            href="/egitimler"
                            className="bg-neutral-900 text-white px-10 py-5 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-red-800 transition-all shadow-2xl"
                        >
                            Tüm Kataloğu Keşfet →
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
