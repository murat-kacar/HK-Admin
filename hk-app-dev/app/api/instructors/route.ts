import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { slugify } from '@/lib/slugify';
import { requireAuth } from '@/lib/api-auth';

type InstructorBody = {
  id?: number;
  name: string;
  bio?: string;
  photo?: string;
  expertise?: string;
  slug?: string;
  display_order?: number;
  email?: string;
  projects?: any;
  social_links?: any;
  show_on_homepage?: boolean;
  show_on_hero_showcase?: boolean;
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const homepage = url.searchParams.get('homepage');

  try {
    const where: string[] = [];
    if (homepage === 'true') where.push('show_on_homepage = true');
    if (url.searchParams.get('hero') === 'true') where.push('show_on_hero_showcase = true');

    const sql = `SELECT * FROM instructors ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY display_order ASC LIMIT $1`;
    const res = await query(sql, [limit]);
    return NextResponse.json({ data: res.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body: InstructorBody = await req.json();
    if (!body.name || body.name.trim().length < 3) return NextResponse.json({ error: 'Name is required and must be at least 3 characters' }, { status: 400 });
    const slug = body.slug ? body.slug : slugify(body.name || '');
    
    // Get max display_order and add 1 for new instructor
    let displayOrder = body.display_order;
    if (displayOrder === undefined || displayOrder === null || displayOrder === 0) {
      const maxOrderRes = await query('SELECT COALESCE(MAX(display_order), 0) as max_order FROM instructors');
      displayOrder = (maxOrderRes.rows[0]?.max_order || 0) + 1;
    }
    
    const res = await query(
      `INSERT INTO instructors (name, bio, photo, expertise, slug, display_order, email, projects, social_links, show_on_homepage, show_on_hero_showcase) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        body.name,
        body.bio || null,
        body.photo || null,
        body.expertise || null,
        slug,
        displayOrder,
        body.email || null,
        JSON.stringify(body.projects || []),
        JSON.stringify(body.social_links || {}),
        body.show_on_homepage || false,
        body.show_on_hero_showcase || false
      ]
    );
    return NextResponse.json({ data: res.rows[0] }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body: InstructorBody = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    if (body.name && body.name.trim().length < 3) return NextResponse.json({ error: 'Name must be at least 3 characters' }, { status: 400 });
    const existing = await query('SELECT * FROM instructors WHERE id=$1 LIMIT 1', [body.id]);
    if (existing.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const cur = existing.rows[0];
    const slug = body.slug ? body.slug : slugify(body.name || cur.name || '');
    const res = await query(
      `UPDATE instructors SET 
        name=$1, bio=$2, photo=$3, expertise=$4, slug=$5, display_order=$6, 
        email=$7, projects=$8, social_links=$9, show_on_homepage=$10, show_on_hero_showcase=$11 
       WHERE id=$12 RETURNING *`,
      [
        body.name || cur.name,
        body.bio ?? cur.bio,
        body.photo ?? cur.photo,
        body.expertise ?? cur.expertise,
        slug,
        body.display_order ?? cur.display_order,
        body.email ?? cur.email,
        JSON.stringify(body.projects ?? cur.projects),
        JSON.stringify(body.social_links ?? cur.social_links),
        body.show_on_homepage ?? cur.show_on_homepage,
        body.show_on_hero_showcase ?? cur.show_on_hero_showcase,
        body.id
      ]
    );
    return NextResponse.json({ data: res.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const authError = await requireAuth(req);
  if (authError) return authError;
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    await query('DELETE FROM instructors WHERE id=$1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
