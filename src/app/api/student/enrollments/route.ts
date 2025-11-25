import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// POST - Matricular estudiante en un curso
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

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: 'Student ID y Course ID son requeridos' },
        { status: 400 }
      );
    }

    await client.connect();

    // Verificar que el estudiante no esté ya inscrito
    const existingEnrollment = await client.query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      await client.end();
      return NextResponse.json(
        { error: 'El estudiante ya está inscrito en este curso' },
        { status: 400 }
      );
    }

    // Crear inscripción
    const enrollmentId = uuidv4();
    const enrollmentQuery = `
      INSERT INTO enrollments (id, student_id, course_id)
      VALUES ($1, $2, $3)
      RETURNING id, student_id, course_id
    `;

    const enrollmentResult = await client.query(enrollmentQuery, [
      enrollmentId,
      studentId,
      courseId,
    ]);

    // Obtener todos los horarios del curso
    const schedulesQuery = `
      SELECT id, course_id, teacher_id, day_of_week, start_time, end_time
      FROM schedules
      WHERE course_id = $1
    `;

    const schedulesResult = await client.query(schedulesQuery, [courseId]);

    // Crear registros de horario para el estudiante
    const studentSchedules = [];
    for (const schedule of schedulesResult.rows) {
      const studentScheduleId = uuidv4();
      const studentScheduleQuery = `
        INSERT INTO student_schedules (id, student_id, course_id, schedule_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT DO NOTHING
        RETURNING id, student_id, course_id, schedule_id
      `;

      const studentScheduleResult = await client.query(studentScheduleQuery, [
        studentScheduleId,
        studentId,
        courseId,
        schedule.id,
      ]);

      if (studentScheduleResult.rows.length > 0) {
        studentSchedules.push(studentScheduleResult.rows[0]);
      }
    }

    // Actualizar la tabla de cursos para incluir el estudiante
    const updateCoursesQuery = `
      UPDATE courses 
      SET student_ids = (
        SELECT ARRAY_AGG(DISTINCT e.student_id) 
        FROM enrollments e 
        WHERE e.course_id = courses.id
      ),
      enrolled_students = (
        SELECT COUNT(*) FROM enrollments WHERE course_id = $1
      )
      WHERE id = $1
      RETURNING id
    `;

    await client.query(updateCoursesQuery, [courseId]);

    await client.end();

    return NextResponse.json(
      {
        message: '✅ Estudiante matriculado correctamente',
        enrollment: enrollmentResult.rows[0],
        studentSchedules: studentSchedules,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al matricular estudiante:', error);
    return NextResponse.json(
      {
        error: 'Error al matricular estudiante',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// GET - Obtener inscripciones de un estudiante
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
        { error: 'Student ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    const query = `
      SELECT 
        e.id,
        e.student_id,
        e.course_id,
        c.name as course_name,
        c.code as course_code,
        c.teacher as teacher_name,
        c.credits,
        c.capacity,
        COALESCE(c.enrolled_students, 0) as enrolled_students
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.student_id = $1
      ORDER BY c.name ASC
    `;

    const result = await client.query(query, [studentId]);
    await client.end();

    return NextResponse.json(result.rows, { status: 200 });
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

// DELETE - Desmatricular estudiante de un curso
export async function DELETE(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { searchParams } = new URL(request.url);
    const enrollmentId = searchParams.get('id');

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Obtener información de la inscripción antes de eliminarla
    const enrollmentQuery = 'SELECT student_id, course_id FROM enrollments WHERE id = $1';
    const enrollmentResult = await client.query(enrollmentQuery, [enrollmentId]);

    if (enrollmentResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    const { student_id, course_id } = enrollmentResult.rows[0];

    // Eliminar horarios del estudiante
    await client.query(
      'DELETE FROM student_schedules WHERE student_id = $1 AND course_id = $2',
      [student_id, course_id]
    );

    // Eliminar inscripción
    const deleteQuery = 'DELETE FROM enrollments WHERE id = $1 RETURNING id';
    const result = await client.query(deleteQuery, [enrollmentId]);

    // Actualizar la tabla de cursos
    await client.query(
      `UPDATE courses 
       SET student_ids = (
         SELECT ARRAY_AGG(DISTINCT e.student_id) 
         FROM enrollments e 
         WHERE e.course_id = $1
       ),
       enrolled_students = (
         SELECT COUNT(*) FROM enrollments WHERE course_id = $1
       )
       WHERE id = $1`,
      [course_id]
    );

    await client.end();

    return NextResponse.json(
      { message: '✅ Estudiante desmatriculado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al desmatricular estudiante:', error);
    return NextResponse.json(
      {
        error: 'Error al desmatricular estudiante',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
