import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;
    if (!username || !password) {return NextResponse.json({ error: 'Missing fields' }, { status: 400 });}

    const res = await query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
    if (res.rows.length === 0) {return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });}

    const user = res.rows[0];
    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await signToken({ sub: user.id, username: user.username });
    const resp = NextResponse.json({ success: true });
    resp.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });
    return resp;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
