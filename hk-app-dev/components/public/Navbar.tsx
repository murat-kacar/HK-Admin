'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/egitimler', label: 'Eğitimler' },
    { href: '/egitmenler', label: 'Eğitmenler' },
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/iletisim', label: 'İletişim' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12">H</div>
          <span className={`text-xl font-bold tracking-tighter transition-colors ${scrolled ? 'text-black' : 'text-neutral-800'}`}>
            Hakan Karsak <span className="font-light text-neutral-400">Akademi</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-neutral-600 hover:text-black transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/egitimler"
            className="px-5 py-2 bg-black text-white text-sm font-bold rounded-none hover:bg-neutral-800 transition-all hover:scale-105 active:scale-95"
          >
            Hemen Başvur
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setOpen(!open)}
          aria-label="Menüyü aç/kapat"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-current transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-full bg-current transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-full bg-current transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-t border-neutral-100 shadow-xl md:hidden overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {links.map((l, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={l.href}
                >
                  <Link
                    href={l.href}
                    className="text-2xl font-bold text-neutral-800 hover:text-primary transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <Link
                href="/egitimler"
                className="mt-4 px-6 py-4 bg-black text-white text-center font-bold text-lg"
                onClick={() => setOpen(false)}
              >
                Hemen Başvur
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
