import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Función para decodificar token
function decodeToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// Función para obtener token del request
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  const cookies = request.cookies.get('auth_token');
  return cookies?.value || null;
}

// GET - Obtener asistencia del estudiante en un curso
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
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const tokenData = decodeToken(token);

    if (!tokenData?.userId) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    await client.connect();

    // Obtener asistencia del estudiante en el curso
    const attendanceQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE present = true) as attended,
        COUNT(*) FILTER (WHERE present = false) as absent,
        COUNT(*) as total,
        ROUND(COUNT(*) FILTER (WHERE present = true)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 0)::INT as percentage
      FROM attendance
      WHERE course_id = $1 AND student_id = $2
    `;

    const attendanceResult = await client.query(attendanceQuery, [courseId, tokenData.userId]);
    const stats = attendanceResult.rows[0] || { attended: 0, absent: 0, total: 0, percentage: 0 };

    // Obtener últimas clases
    const lastClassesQuery = `
      SELECT attendance_date as date, present as attended
      FROM attendance
      WHERE course_id = $1 AND student_id = $2
      ORDER BY attendance_date DESC
      LIMIT 5
    `;

    const lastClassesResult = await client.query(lastClassesQuery, [courseId, tokenData.userId]);

    const attendanceData = {
      studentId: tokenData.userId,
      courseId: courseId,
      totalClasses: parseInt(stats.total) || 0,
      attended: parseInt(stats.attended) || 0,
      absent: parseInt(stats.absent) || 0,
      percentage: parseInt(stats.percentage) || 0,
      lastClasses: lastClassesResult.rows.map(row => ({
        date: row.date.toISOString().split('T')[0],
        attended: row.attended
      })) || []
    };

    await client.end();

    return NextResponse.json(attendanceData, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener asistencia:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener asistencia',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Guardar asistencias (para profesores)
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
    const body = await request.json();
    const { attendance, teacherId } = body; // { studentId: { date: boolean, ... }, ... }

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Verificar que el profesor es dueño del curso
    const courseOwnerQuery = `
      SELECT teacher_id FROM courses WHERE id = $1
    `;
    const courseResult = await client.query(courseOwnerQuery, [courseId]);

    if (courseResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (courseResult.rows[0].teacher_id !== teacherId) {
      await client.end();
      return NextResponse.json(
        { error: 'No tienes permiso para modificar las asistencias de este curso' },
        { status: 403 }
      );
    }

    console.log(`[ATTENDANCE-POST] Guardando asistencias para el curso ${courseId}`);

    let created = 0;
    let updated = 0;

    for (const studentId in attendance) {
      for (const dateStr in attendance[studentId]) {
        const present = attendance[studentId][dateStr];

        try {
          // Intentar insertar o actualizar
          const upsertQuery = `
            INSERT INTO attendance (id, course_id, student_id, attendance_date, present)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (course_id, student_id, attendance_date) 
            DO UPDATE SET present = EXCLUDED.present
            RETURNING id
          `;

          const result = await client.query(upsertQuery, [
            uuidv4(),
            courseId,
            studentId,
            dateStr,
            present,
          ]);

          if (result.rows.length > 0) {
            created++;
          }
        } catch (err) {
          console.error(`[ATTENDANCE-POST] Error procesando asistencia:`, err);
        }
      }
    }

    await client.end();

    console.log(`[ATTENDANCE-POST] ✅ ${created} registros procesados`);

    return NextResponse.json(
      {
        message: '✅ Asistencias guardadas correctamente',
        processed: created,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ATTENDANCE-POST] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error al guardar asistencias',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar asistencias de una fecha
export async function DELETE(
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
    const body = await request.json();
    const { date, teacherId } = body; // date en formato YYYY-MM-DD

    if (!date) {
      return NextResponse.json(
        { error: 'La fecha es requerida' },
        { status: 400 }
      );
    }

    if (!teacherId) {
      return NextResponse.json(
        { error: 'Teacher ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Verificar que el profesor es dueño del curso
    const courseOwnerQuery = `
      SELECT teacher_id FROM courses WHERE id = $1
    `;
    const courseResult = await client.query(courseOwnerQuery, [courseId]);

    if (courseResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    if (courseResult.rows[0].teacher_id !== teacherId) {
      await client.end();
      return NextResponse.json(
        { error: 'No tienes permiso para modificar las asistencias de este curso' },
        { status: 403 }
      );
    }

    console.log(`[ATTENDANCE-DELETE] Eliminando asistencias del ${date} para el curso ${courseId}`);

    // Convertir formato "28-Oct" a "YYYY-MM-DD"
    const [day, month] = date.split('-');
    const currentYear = new Date().getFullYear();
    const monthIndex = new Date(`${month} 1, 2020`).getMonth();
    const formattedDate = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const deleteQuery = `
      DELETE FROM attendance
      WHERE course_id = $1 AND attendance_date = $2
      RETURNING id
    `;

    const result = await client.query(deleteQuery, [courseId, formattedDate]);
    await client.end();

    console.log(`[ATTENDANCE-DELETE] ✅ ${result.rows.length} registros eliminados`);

    return NextResponse.json(
      {
        message: '✅ Asistencias eliminadas correctamente',
        deleted: result.rows.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ATTENDANCE-DELETE] ❌ Error:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar asistencias',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
