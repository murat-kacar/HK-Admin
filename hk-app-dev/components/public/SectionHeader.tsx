"use client";
import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    badge?: string;
}

export default function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 md:space-y-4 mb-12 md:mb-16"
        >
            {/* Badge / Label */}
            {badge && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
                        {badge}
                    </span>
                </motion.div>
            )}

            {/* Main Title - Playfair Display Italic */}
            <h2 className="font-playfair italic text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900">
                {title}
            </h2>

            {/* Subtitle with accent line - Playfair Display Normal */}
            {subtitle && (
                <>
                    <div className="flex justify-center">
                        <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                    </div>
                    <p className="font-playfair text-base md:text-lg lg:text-xl text-neutral-600 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </>
            )}
        </motion.div>
    );
}
