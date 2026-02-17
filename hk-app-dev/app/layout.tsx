import React from 'react';
import { Playfair_Display, Lora } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata = {
  title: 'Hakan Karsak Akademi',
  description: 'Sanat ve kültür etkinlikleri'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${lora.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
