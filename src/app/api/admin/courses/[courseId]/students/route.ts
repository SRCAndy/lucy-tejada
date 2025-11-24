import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// GET - Obtener detalles de estudiantes de un curso
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
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
      SELECT 
        c.id as course_id,
        c.name as course_name,
        c.code as course_code,
        c.teacher as course_teacher,
        s.id as student_id,
        s.name as student_name,
        s.email as student_email,
        s.id_number,
        s.city,
        s.gender,
        e.enrolled_at
      FROM courses c
      LEFT JOIN students s ON s.id = ANY(c.student_ids)
      LEFT JOIN enrollments e ON s.id = e.student_id AND c.id = e.course_id
      WHERE c.id = $1
      ORDER BY s.name ASC
    `;

    const result = await client.query(query, [params.courseId]);
    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    // Separar información del curso de estudiantes
    const courseInfo = {
      id: result.rows[0].course_id,
      name: result.rows[0].course_name,
      code: result.rows[0].course_code,
      teacher: result.rows[0].course_teacher,
    };

    const students = result.rows
      .filter((row) => row.student_id) // Filtrar estudiantes reales (no null)
      .map((row) => ({
        id: row.student_id,
        name: row.student_name,
        email: row.student_email,
        id_number: row.id_number,
        city: row.city,
        gender: row.gender,
        enrolled_at: row.enrolled_at,
      }));

    return NextResponse.json(
      {
        course: courseInfo,
        students: students,
        total_students: students.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al obtener estudiantes del curso:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estudiantes del curso',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
