import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

/**
 * Endpoint de diagnóstico para verificar horarios de estudiantes
 * GET /api/debug/student-schedules?studentId=xxx
 */

export async function GET(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'studentId es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    console.log(`[DEBUG-STUDENT] Verificando horarios del estudiante ${studentId}`);

    // 1. Verificar inscripciones del estudiante
    const enrollments = await client.query(`
      SELECT e.id, e.student_id, e.course_id, c.name as course_name
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
    `, [studentId]);

    console.log(`[DEBUG-STUDENT] Inscripciones encontradas: ${enrollments.rows.length}`);

    // 2. Para cada inscripción, verificar horarios
    const details = [];
    for (const enrollment of enrollments.rows) {
      const schedules = await client.query(`
        SELECT id, course_id, day_of_week, start_time, end_time
        FROM schedules
        WHERE course_id = $1
      `, [enrollment.course_id]);

      console.log(`[DEBUG-STUDENT] Curso "${enrollment.course_name}": ${schedules.rows.length} horarios`);

      // 3. Verificar si hay student_schedules
      const studentSchedules = await client.query(`
        SELECT id, student_id, schedule_id
        FROM student_schedules
        WHERE student_id = $1 AND course_id = $2
      `, [studentId, enrollment.course_id]);

      console.log(`[DEBUG-STUDENT] Student schedules para este curso: ${studentSchedules.rows.length}`);

      details.push({
        enrollment: enrollment.id,
        course_id: enrollment.course_id,
        course_name: enrollment.course_name,
        schedules_count: schedules.rows.length,
        schedules: schedules.rows,
        student_schedules_count: studentSchedules.rows.length,
        student_schedules: studentSchedules.rows,
      });
    }

    // 4. Intentar obtener horarios directamente
    const directSchedules = await client.query(`
      SELECT s.*, c.name as course_name, t.name as teacher_name
      FROM student_schedules ss
      INNER JOIN schedules s ON ss.schedule_id = s.id
      INNER JOIN courses c ON s.course_id = c.id
      INNER JOIN teachers t ON s.teacher_id = t.id
      WHERE ss.student_id = $1
      ORDER BY s.day_of_week, s.start_time
    `, [studentId]);

    console.log(`[DEBUG-STUDENT] Horarios obtenidos directamente: ${directSchedules.rows.length}`);

    await client.end();

    return NextResponse.json(
      {
        studentId,
        enrollments_count: enrollments.rows.length,
        enrollments: enrollments.rows,
        details,
        direct_schedules_count: directSchedules.rows.length,
        direct_schedules: directSchedules.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[DEBUG-STUDENT] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error en diagnóstico',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
