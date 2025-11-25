import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

/**
 * Endpoint para sincronizar horarios de TODOS los estudiantes
 * POST /api/admin/sync-all-schedules
 * 
 * Crea student_schedules faltantes para todos los estudiantes inscritos
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
    await client.connect();

    console.log('[SYNC-ALL] Iniciando sincronización de todos los horarios...');

    // Obtener todos los enrollments
    const allEnrollments = await client.query(`
      SELECT DISTINCT e.student_id, e.course_id
      FROM enrollments e
      ORDER BY e.course_id, e.student_id
    `);

    console.log(`[SYNC-ALL] ${allEnrollments.rows.length} inscripciones encontradas`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const enrollment of allEnrollments.rows) {
      try {
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
      } catch (err) {
        console.error(`[SYNC-ALL] Error procesando inscripción:`, err);
        errors++;
      }
    }

    await client.end();

    console.log(`[SYNC-ALL] ✅ ${created} horarios creados, ${skipped} saltados, ${errors} errores`);

    return NextResponse.json(
      {
        message: `✅ Sincronización completada`,
        created,
        skipped,
        errors,
        total: created + skipped,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SYNC-ALL] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error al sincronizar horarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener estadísticas de sincronización
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
    await client.connect();

    // Contar inscripciones sin horarios
    const missingSchedules = await client.query(`
      SELECT COUNT(DISTINCT e.student_id, e.course_id) as count
      FROM enrollments e
      WHERE NOT EXISTS (
        SELECT 1 FROM student_schedules ss
        WHERE ss.student_id = e.student_id AND ss.course_id = e.course_id
      )
    `);

    // Contar inscripciones con horarios
    const withSchedules = await client.query(`
      SELECT COUNT(DISTINCT e.student_id, e.course_id) as count
      FROM enrollments e
      WHERE EXISTS (
        SELECT 1 FROM student_schedules ss
        WHERE ss.student_id = e.student_id AND ss.course_id = e.course_id
      )
    `);

    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM enrollments) as total_enrollments,
        (SELECT COUNT(*) FROM student_schedules) as total_student_schedules,
        (SELECT COUNT(*) FROM schedules) as total_schedules,
        (SELECT COUNT(*) FROM students) as total_students
    `);

    await client.end();

    return NextResponse.json(
      {
        missing_schedule_pairs: missingSchedules.rows[0].count,
        with_schedule_pairs: withSchedules.rows[0].count,
        ...stats.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[SYNC-ALL-STATS] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener estadísticas',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
