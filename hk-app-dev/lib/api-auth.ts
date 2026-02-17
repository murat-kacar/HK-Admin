import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

/**
 * Verify admin authentication from request cookies.
 * Returns null if authenticated, or a 401 NextResponse if not.
 */
export async function requireAuth(req: Request): Promise<NextResponse | null> {
  const cookie = req.headers.get('cookie') || '';
  const tokenMatch = cookie.match(/(?:^|;\s*)token=([^;]*)/);
  const token = tokenMatch?.[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload || !payload.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null; // authenticated
}
