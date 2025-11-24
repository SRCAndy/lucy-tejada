import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    // Ver todos los cursos y sus student_ids
    const query = `
      SELECT 
        id,
        name,
        code,
        student_ids,
        ARRAY_LENGTH(student_ids, 1) as total_students,
        enrolled_students
      FROM courses
      ORDER BY name ASC
    `;

    const result = await client.query(query);
    await client.end();

    return NextResponse.json({
      courses: result.rows,
      message: 'Debug: Cursos y sus student_ids'
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error en debug:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener debug',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
