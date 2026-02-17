import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Hakan Karsak Akademi',
  description: 'Sanat ve kültür etkinlikleri'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
