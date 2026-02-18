'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileAilemizOpen, setMobileAilemizOpen] = useState(false);
  const [mobileBizKimizOpen, setMobileBizKimizOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { href: '/akademide-neler-var', label: 'Akademide Neler Var!' },
    { href: '/egitimler', label: 'Eğitimler' },
  ];

  const ailemizLinks = [
    { href: '/egitmenler', label: 'Eğitmenlerimiz' },
    { href: '/mezunlarimiz', label: 'Mezunlarımız' },
  ];

  const bizKimizLinks = [
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/akademi-olanaklari', label: 'Akademi Olanakları' },
    { href: '/bize-ulasin', label: 'Bize Ulaşın' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
        }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="w-8 h-8 bg-black flex items-center justify-center text-white font-bold text-xl transition-transform group-hover:rotate-12">H</div>
          <span className={`text-xl font-bold tracking-tighter transition-colors ${isScrolled ? 'text-black' : 'text-neutral-800'}`}>
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

          <div className="relative group">
            <button className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
              Ailemiz
            </button>
            <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="min-w-[220px] bg-white border border-neutral-200 shadow-lg p-2">
                {ailemizLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="relative group">
            <button className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
              Biz kimiz?
            </button>
            <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
              <div className="min-w-[240px] bg-white border border-neutral-200 shadow-lg p-2">
                {bizKimizLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

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
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menüyü aç/kapat"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-full bg-current transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
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
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: links.length * 0.1 }}
                className="border-t border-neutral-100 pt-3"
              >
                <button
                  onClick={() => setMobileAilemizOpen((prev) => !prev)}
                  className="w-full text-left text-2xl font-bold text-neutral-800"
                >
                  Ailemiz
                </button>
                {mobileAilemizOpen && (
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    {ailemizLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-base font-medium text-neutral-700 hover:text-black"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileAilemizOpen(false);
                          setMobileBizKimizOpen(false);
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (links.length + 1) * 0.1 }}
                className="border-t border-neutral-100 pt-3"
              >
                <button
                  onClick={() => setMobileBizKimizOpen((prev) => !prev)}
                  className="w-full text-left text-2xl font-bold text-neutral-800"
                >
                  Biz kimiz?
                </button>
                {mobileBizKimizOpen && (
                  <div className="mt-2 flex flex-col gap-2 pl-3">
                    {bizKimizLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-base font-medium text-neutral-700 hover:text-black"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileAilemizOpen(false);
                          setMobileBizKimizOpen(false);
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </motion.div>

              <Link
                href="/egitimler"
                className="mt-4 px-6 py-4 bg-black text-white text-center font-bold text-lg"
                onClick={() => {
                  setIsMenuOpen(false);
                  setMobileAilemizOpen(false);
                  setMobileBizKimizOpen(false);
                }}
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
