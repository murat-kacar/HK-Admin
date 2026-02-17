import React from 'react';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <div className="container py-6 text-sm text-gray-600">
        <Card className="p-4">
          <div className="mb-3">Hakan Karsak Akademi — Sanat ve kültür etkinlikleri</div>
          <div className="flex items-center justify-between">
            <div>© {new Date().getFullYear()} Hakan Karsak Akademi. Tüm hakları saklıdır.</div>
            <div className="space-x-3">
              <Link href="#">Facebook</Link>
              <Link href="#">Instagram</Link>
              <Link href="#">YouTube</Link>
            </div>
          </div>
        </Card>
      </div>
    </footer>
  );
}
