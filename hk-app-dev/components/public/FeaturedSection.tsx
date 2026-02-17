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
    display_order?: number;
    _source?: 'training' | 'event';
}

export default function FeaturedSection() {
    const [items, setItems] = useState<TrainingItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch both trainings and events with 'homepage' tag
                const [trainingsRes, eventsRes] = await Promise.all([
                    fetch('/api/trainings?category=homepage&limit=10'),
                    fetch('/api/events?category=homepage&limit=10')
                ]);

                const trainingsData = await trainingsRes.json();
                const eventsData = await eventsRes.json();

                const trainings = (trainingsData?.data || []).map((t: any) => ({ 
                    ...t, 
                    _source: 'training',
                    poster_image: t.poster_image || t.image_url
                }));
                const events = (eventsData?.data || []).map((e: any) => ({ 
                    ...e, 
                    _source: 'event',
                    poster_image: e.image_url || e.poster_image
                }));

                // Combine and sort by display_order
                const combined = [...trainings, ...events].sort((a, b) => 
                    (a.display_order || 999) - (b.display_order || 999)
                );

                // Fallback: If no homepage items, show first few active items
                if (combined.length === 0) {
                    const [fallbackTrainings, fallbackEvents] = await Promise.all([
                        fetch('/api/trainings?limit=3'),
                        fetch('/api/events?limit=3')
                    ]);
                    const t = await fallbackTrainings.json();
                    const e = await fallbackEvents.json();
                    const fallback = [
                        ...(t?.data || []).map((item: any) => ({ 
                            ...item, 
                            _source: 'training',
                            poster_image: item.poster_image || item.image_url
                        })),
                        ...(e?.data || []).map((item: any) => ({ 
                            ...item, 
                            _source: 'event',
                            poster_image: item.image_url || item.poster_image
                        }))
                    ].slice(0, 3);
                    setItems(fallback);
                } else {
                    setItems(combined.slice(0, 3));
                }
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
                        <h3 className="font-lora text-4xl md:text-6xl font-black text-neutral-900 uppercase italic tracking-tighter leading-none">
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
                                _source={it._source}
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
