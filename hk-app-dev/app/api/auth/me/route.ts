import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const cookie = req.headers.get('cookie') || '';
    const tokenMatch = cookie.match(/(?:^|;\s*)token=([^;]*)/);
    const token = tokenMatch?.[1] || null;
    if (!token) {return NextResponse.json({ user: null });}
    const payload = await verifyToken(token);
    return NextResponse.json({ user: payload || null });
  } catch (_err) {
    return NextResponse.json({ user: null });
  }
}
