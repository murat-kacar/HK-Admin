import React from 'react';
import './admin.css';
import ToastProvider from '@/components/ToastProvider';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminShell from './AdminShell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // If no token, redirect to login
  if (!token) {
    redirect('/auth/login');
  }

  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      redirect('/auth/login');
    }

    const userId = payload.sub;
    const res = await query('SELECT id, username FROM users WHERE id=$1 LIMIT 1', [Number(userId)]);
    
    if (res.rows.length === 0) {
      redirect('/auth/login');
    }

    const username = res.rows[0].username as string;

    return (
      <ToastProvider>
        <AdminShell username={username}>{children}</AdminShell>
      </ToastProvider>
    );
  } catch (err) {
    console.error('Admin layout auth error', err);
    redirect('/auth/login');
  }
}
