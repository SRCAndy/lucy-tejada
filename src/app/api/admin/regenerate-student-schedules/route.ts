import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

/**
 * Endpoint para regenerar horarios de estudiantes
 * POST /api/admin/regenerate-student-schedules
 * Body: { studentId?: string, courseId?: string }
 */

export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { studentId, courseId } = await request.json();

    await client.connect();

    let query = '';
    let params: any[] = [];

    if (studentId && courseId) {
      // Regenerar para un estudiante específico en un curso específico
      query = `
        SELECT DISTINCT e.student_id, e.course_id
        FROM enrollments e
        WHERE e.student_id = $1 AND e.course_id = $2
      `;
      params = [studentId, courseId];
    } else if (studentId) {
      // Regenerar todos los horarios del estudiante
      query = `
        SELECT DISTINCT e.student_id, e.course_id
        FROM enrollments e
        WHERE e.student_id = $1
      `;
      params = [studentId];
    } else if (courseId) {
      // Regenerar todos los horarios del curso
      query = `
        SELECT DISTINCT e.student_id, e.course_id
        FROM enrollments e
        WHERE e.course_id = $1
      `;
      params = [courseId];
    } else {
      await client.end();
      return NextResponse.json(
        { error: 'Se requiere studentId o courseId' },
        { status: 400 }
      );
    }

    console.log('[REGENERATE-SCHEDULES] Obteniendo inscripciones...');
    const enrollmentsResult = await client.query(query, params);
    console.log(`[REGENERATE-SCHEDULES] ${enrollmentsResult.rows.length} inscripciones encontradas`);

    let created = 0;
    let skipped = 0;

    for (const enrollment of enrollmentsResult.rows) {
      // Obtener horarios del curso
      const schedulesResult = await client.query(`
        SELECT id FROM schedules WHERE course_id = $1
      `, [enrollment.course_id]);

      for (const schedule of schedulesResult.rows) {
        // Verificar si ya existe
        const existsResult = await client.query(`
          SELECT id FROM student_schedules
          WHERE student_id = $1 AND schedule_id = $2
        `, [enrollment.student_id, schedule.id]);

        if (existsResult.rows.length === 0) {
          // Crear el student_schedule
          const studentScheduleId = uuidv4();
          await client.query(`
            INSERT INTO student_schedules (id, student_id, course_id, schedule_id)
            VALUES ($1, $2, $3, $4)
          `, [studentScheduleId, enrollment.student_id, enrollment.course_id, schedule.id]);

          created++;
        } else {
          skipped++;
        }
      }
    }

    await client.end();

    console.log(`[REGENERATE-SCHEDULES] ✅ ${created} horarios creados, ${skipped} saltados`);

    return NextResponse.json(
      {
        message: `✅ Regeneración completada`,
        created,
        skipped,
        total: created + skipped,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[REGENERATE-SCHEDULES] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error al regenerar horarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
