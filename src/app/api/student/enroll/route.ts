import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Helper para decodificar token
function decodeToken(token: string) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

// Helper para obtener token del request
function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return request.cookies.get('auth_token')?.value || null;
}

export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // Obtener y validar token
    const token = getTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const tokenData = decodeToken(token);
    if (!tokenData || !tokenData.userId || tokenData.role !== 'student') {
      return NextResponse.json(
        { error: 'Token inválido o no eres estudiante' },
        { status: 401 }
      );
    }

    const { student_id, course_id } = await request.json();
    const authenticatedStudentId = tokenData.userId;

    // Verificar que el estudiante solo puede inscribirse a sí mismo
    if (student_id && student_id !== authenticatedStudentId) {
      return NextResponse.json(
        { error: 'No puedes inscribir a otros estudiantes' },
        { status: 403 }
      );
    }

    if (!course_id) {
      return NextResponse.json(
        { error: 'Course ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Verificar si el estudiante ya está inscrito
    const checkEnrollment = `
      SELECT id FROM enrollments 
      WHERE student_id = $1 AND course_id = $2
    `;
    const enrollmentResult = await client.query(checkEnrollment, [authenticatedStudentId, course_id]);

    if (enrollmentResult.rows.length > 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Ya estás inscrito en este curso' },
        { status: 409 }
      );
    }

    // Verificar capacidad del curso
    const checkCapacity = `
      SELECT enrolled_students, capacity FROM courses WHERE id = $1
    `;
    const capacityResult = await client.query(checkCapacity, [course_id]);

    if (capacityResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    const { enrolled_students, capacity } = capacityResult.rows[0];

    if (enrolled_students >= capacity) {
      await client.end();
      return NextResponse.json(
        { error: 'El curso está lleno' },
        { status: 409 }
      );
    }

    // Crear inscripción
    const enrollmentId = uuidv4();
    const insertEnrollment = `
      INSERT INTO enrollments (id, student_id, course_id, enrolled_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `;
    await client.query(insertEnrollment, [enrollmentId, authenticatedStudentId, course_id]);

    // Actualizar contador de estudiantes en el curso
    const updateCourse = `
      UPDATE courses 
      SET enrolled_students = enrolled_students + 1 
      WHERE id = $1
    `;
    await client.query(updateCourse, [course_id]);

    // Actualizar array de student_ids
    const updateStudentIds = `
      UPDATE courses
      SET student_ids = (
        SELECT ARRAY_AGG(DISTINCT e.student_id)
        FROM enrollments e
        WHERE e.course_id = $1
      )
      WHERE id = $1
    `;
    await client.query(updateStudentIds, [course_id]);

    await client.end();

    return NextResponse.json(
      { message: '✅ Inscripción exitosa' },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error en inscripción:', error);
    return NextResponse.json(
      {
        error: 'Error en la inscripción',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

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
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    const query = `
      SELECT c.id, c.name, c.code, c.teacher, c.credits, c.capacity, c.enrolled_students, c.days_of_week, c.start_time, c.end_time
      FROM courses c
      INNER JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY c.name ASC
    `;

    const result = await client.query(query, [studentId]);
    await client.end();

    return NextResponse.json(
      { courses: result.rows },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al obtener inscripciones:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener inscripciones',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
