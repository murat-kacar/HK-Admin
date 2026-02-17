import React from 'react';
import './admin.css';
import ToastProvider from '@/components/ToastProvider';
import { cookies, headers } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if this is the login page — skip auth
  const headersList = await headers();
  const url = headersList.get('x-invoke-path') || headersList.get('x-nextjs-page') || '';
  const referer = headersList.get('referer') || '';

  // For login page, render children without auth shell
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // If no token and it might be login page, render plain
  if (!token) {
    // Check via middleware: middleware already allows /admin/login through
    // The layout can't reliably detect path, so just render login wrapper
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return (
        <ToastProvider>
          {children}
        </ToastProvider>
      );
    }
    const userId = payload.sub;
    const res = await query('SELECT id, username FROM users WHERE id=$1 LIMIT 1', [Number(userId)]);
    if (res.rows.length === 0) {
      return (
        <ToastProvider>
          {children}
        </ToastProvider>
      );
    }

    const username = res.rows[0].username as string;

    return (
      <ToastProvider>
        <AdminShell username={username}>{children}</AdminShell>
      </ToastProvider>
    );
  } catch (err) {
    console.error('Admin layout auth error', err);
    return (
      <ToastProvider>
        {children}
      </ToastProvider>
    );
  }
}
