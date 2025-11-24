import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// GET - Obtener cursos de un profesor
export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Obtener teacher_id desde el header
    const teacherId = request.headers.get('x-teacher-id');

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    const query = `
      SELECT 
        id, 
        name, 
        code, 
        teacher_id, 
        teacher, 
        credits, 
        enrolled_students, 
        capacity, 
        days_of_week, 
        start_time, 
        end_time,
        student_ids
      FROM courses
      WHERE teacher_id = $1
      ORDER BY name ASC
    `;

    const result = await client.query(query, [teacherId]);
    await client.end();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener cursos del profesor:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener cursos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
