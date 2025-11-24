import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// GET - Obtener avisos
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const courseId = (await params).courseId;
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    const query = `
      SELECT id, title, content, date, author, image_url, category, created_at, updated_at
      FROM announcements
      WHERE course_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const result = await client.query(query, [courseId]);
    await client.end();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener avisos:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener avisos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Crear aviso (solo profesores)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const courseId = (await params).courseId;
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { title, content, author, category, image_url, date } = await request.json();

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Título y contenido son requeridos' },
        { status: 400 }
      );
    }

    await client.connect();

    const query = `
      INSERT INTO announcements (id, course_id, title, content, date, author, image_url, category, created_at, updated_at)
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id, title, content, date, author, image_url, category, created_at, updated_at
    `;

    const result = await client.query(query, [
      courseId,
      title,
      content,
      date || new Date(),
      author || null,
      image_url || null,
      category || null,
    ]);
    await client.end();

    return NextResponse.json(
      {
        message: '✅ Aviso creado correctamente',
        announcement: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al crear aviso:', error);
    return NextResponse.json(
      {
        error: 'Error al crear aviso',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
