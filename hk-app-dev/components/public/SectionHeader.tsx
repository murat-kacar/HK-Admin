"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full mb-8"
        >
            <div className="bg-gradient-to-r from-neutral-900 via-indigo-800 to-sky-600 text-white rounded-none md:rounded-xl p-8 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150" />

                <div className="relative z-10 text-center md:text-left">
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2 italic">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-sm md:text-base text-white/60 font-medium max-w-2xl">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
