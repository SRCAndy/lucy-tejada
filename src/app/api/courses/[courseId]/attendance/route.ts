import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

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
