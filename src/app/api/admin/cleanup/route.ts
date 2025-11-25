import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

/**
 * API para limpiar y mantener la integridad de la base de datos
 * DELETE /api/admin/cleanup - Elimina horarios huérfanos de cursos borrados
 */

export async function DELETE(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();

    console.log('[CLEANUP] Iniciando limpieza de horarios huérfanos...');

    // Encontrar horarios sin curso asociado
    const orphanedSchedules = await client.query(`
      SELECT s.id
      FROM schedules s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE c.id IS NULL
    `);

    const orphanedCount = orphanedSchedules.rows.length;
    console.log(`[CLEANUP] Encontrados ${orphanedCount} horarios huérfanos`);

    if (orphanedCount > 0) {
      // Eliminar student_schedules asociados primero
      await client.query(`
        DELETE FROM student_schedules
        WHERE schedule_id IN (
          SELECT s.id
          FROM schedules s
          LEFT JOIN courses c ON s.course_id = c.id
          WHERE c.id IS NULL
        )
      `);
      console.log('[CLEANUP] ✅ Registros de horarios de estudiantes eliminados');

      // Eliminar los horarios huérfanos
      const result = await client.query(`
        DELETE FROM schedules
        WHERE course_id NOT IN (SELECT id FROM courses)
        RETURNING id
      `);

      console.log(`[CLEANUP] ✅ ${result.rows.length} horarios huérfanos eliminados`);
    }

    // Encontrar inscripciones sin curso
    const orphanedEnrollments = await client.query(`
      SELECT COUNT(*) as count
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE c.id IS NULL
    `);

    const orphanedEnrollmentsCount = orphanedEnrollments.rows[0].count;
    console.log(`[CLEANUP] Encontradas ${orphanedEnrollmentsCount} inscripciones huérfanas`);

    if (orphanedEnrollmentsCount > 0) {
      // Eliminar student_schedules asociados
      await client.query(`
        DELETE FROM student_schedules
        WHERE course_id NOT IN (SELECT id FROM courses)
      `);

      // Eliminar inscripciones huérfanas
      const result = await client.query(`
        DELETE FROM enrollments
        WHERE course_id NOT IN (SELECT id FROM courses)
        RETURNING id
      `);

      console.log(`[CLEANUP] ✅ ${result.rows.length} inscripciones huérfanas eliminadas`);
    }

    await client.end();

    return NextResponse.json(
      {
        message: '✅ Limpieza completada',
        orphanedSchedulesRemoved: orphanedCount,
        orphanedEnrollmentsRemoved: orphanedEnrollmentsCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CLEANUP] ❌ Error durante la limpieza:', error);
    return NextResponse.json(
      {
        error: 'Error durante la limpieza',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// GET - Obtener información sobre registros huérfanos
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

    console.log('[CLEANUP-CHECK] Verificando registros huérfanos...');

    // Verificar horarios huérfanos
    const orphanedSchedules = await client.query(`
      SELECT COUNT(*) as count
      FROM schedules s
      LEFT JOIN courses c ON s.course_id = c.id
      WHERE c.id IS NULL
    `);

    // Verificar inscripciones huérfanas
    const orphanedEnrollments = await client.query(`
      SELECT COUNT(*) as count
      FROM enrollments e
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE c.id IS NULL
    `);

    // Verificar student_schedules huérfanos
    const orphanedStudentSchedules = await client.query(`
      SELECT COUNT(*) as count
      FROM student_schedules ss
      LEFT JOIN schedules s ON ss.schedule_id = s.id
      WHERE s.id IS NULL
    `);

    await client.end();

    return NextResponse.json(
      {
        orphanedSchedules: orphanedSchedules.rows[0].count,
        orphanedEnrollments: orphanedEnrollments.rows[0].count,
        orphanedStudentSchedules: orphanedStudentSchedules.rows[0].count,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[CLEANUP-CHECK] ❌ Error al verificar:', error);
    return NextResponse.json(
      {
        error: 'Error al verificar',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
