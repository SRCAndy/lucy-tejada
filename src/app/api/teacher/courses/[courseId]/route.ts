import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// GET - Obtener estudiantes de un curso
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

    // Obtener detalles del curso y sus estudiantes
    const query = `
      SELECT 
        c.id,
        c.name as course_name,
        c.code,
        c.teacher,
        c.credits,
        c.capacity,
        c.enrolled_students,
        c.student_ids,
        s.id as student_id,
        s.name as student_name,
        s.email as student_email,
        s.id_number
      FROM courses c
      LEFT JOIN students s ON s.id = ANY(c.student_ids)
      WHERE c.id = $1
      ORDER BY s.name ASC NULLS LAST
    `;

    const result = await client.query(query, [courseId]);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Procesar los resultados
    const courseData = {
      id: result.rows[0].id,
      name: result.rows[0].course_name,
      code: result.rows[0].code,
      teacher: result.rows[0].teacher,
      credits: result.rows[0].credits,
      capacity: result.rows[0].capacity,
      enrolled_students: result.rows[0].enrolled_students,
      students: result.rows
        .filter(row => row.student_id)
        .map(row => ({
          id: row.student_id,
          name: row.student_name,
          email: row.student_email,
          id_number: row.id_number,
        }))
    };

    return NextResponse.json(courseData, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener estudiantes del curso:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estudiantes',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
