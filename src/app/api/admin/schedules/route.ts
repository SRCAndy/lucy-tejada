import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Función para generar bloques de horario basado en créditos
function generateScheduleBlocks(credits: number): Array<{ dayOfWeek: string; startTime: string; endTime: string }> {
  const daysOfWeek = ['Lunes', 'Miércoles', 'Viernes'];
  const blocks: Array<{ dayOfWeek: string; startTime: string; endTime: string }> = [];

  let hoursPerWeek = 0;
  if (credits === 2) hoursPerWeek = 2;
  else if (credits === 3) hoursPerWeek = 4;
  else if (credits === 4) hoursPerWeek = 6;

  // Cada bloque es de 2 horas
  const numberOfBlocks = hoursPerWeek / 2;

  // Horarios disponibles (en intervalos de 2 horas, desde 6 AM hasta 8 PM)
  const timeSlots = [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
  ];

  // Distribuir los bloques en los días de la semana con horarios aleatorios
  for (let i = 0; i < numberOfBlocks; i++) {
    const dayIndex = i % daysOfWeek.length;
    const day = daysOfWeek[dayIndex];

    // Seleccionar un horario aleatorio
    const randomSlotIndex = Math.floor(Math.random() * timeSlots.length);
    const randomSlot = timeSlots[randomSlotIndex];

    blocks.push({
      dayOfWeek: day,
      startTime: randomSlot.start,
      endTime: randomSlot.end,
    });
  }

  return blocks;
}

// POST - Generar horarios para un curso
export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Obtener información del curso
    const courseQuery = 'SELECT id, teacher_id, credits FROM courses WHERE id = $1';
    const courseResult = await client.query(courseQuery, [courseId]);

    if (courseResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];
    const scheduleBlocks = generateScheduleBlocks(course.credits);

    // Insertar bloques de horario en la tabla schedules
    const schedules = [];
    for (const block of scheduleBlocks) {
      const scheduleId = uuidv4();
      const insertScheduleQuery = `
        INSERT INTO schedules (id, course_id, teacher_id, day_of_week, start_time, end_time)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, course_id, teacher_id, day_of_week, start_time, end_time
      `;

      const scheduleResult = await client.query(insertScheduleQuery, [
        scheduleId,
        courseId,
        course.teacher_id,
        block.dayOfWeek,
        block.startTime,
        block.endTime,
      ]);

      schedules.push(scheduleResult.rows[0]);
    }

    // Obtener todos los estudiantes inscritos en el curso
    const enrollmentsQuery = `
      SELECT DISTINCT student_id FROM enrollments WHERE course_id = $1
    `;
    const enrollmentsResult = await client.query(enrollmentsQuery, [courseId]);

    // Insertar horarios para cada estudiante
    const studentSchedules = [];
    for (const schedule of schedules) {
      for (const enrollment of enrollmentsResult.rows) {
        const studentScheduleId = uuidv4();
        const insertStudentScheduleQuery = `
          INSERT INTO student_schedules (id, student_id, course_id, schedule_id)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT DO NOTHING
          RETURNING id, student_id, course_id, schedule_id
        `;

        const studentScheduleResult = await client.query(insertStudentScheduleQuery, [
          studentScheduleId,
          enrollment.student_id,
          courseId,
          schedule.id,
        ]);

        if (studentScheduleResult.rows.length > 0) {
          studentSchedules.push(studentScheduleResult.rows[0]);
        }
      }
    }

    await client.end();

    return NextResponse.json(
      {
        message: '✅ Horarios generados correctamente',
        schedules,
        studentSchedules,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al generar horarios:', error);
    return NextResponse.json(
      {
        error: 'Error al generar horarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// GET - Obtener horarios de un curso
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
    const courseId = searchParams.get('courseId');
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');

    let query = '';
    let params: string[] = [];

    if (courseId) {
      query = `
        SELECT s.*, c.name as course_name 
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        WHERE s.course_id = $1
        ORDER BY s.day_of_week, s.start_time
      `;
      params = [courseId];
    } else if (teacherId) {
      query = `
        SELECT s.*, c.name as course_name 
        FROM schedules s
        JOIN courses c ON s.course_id = c.id
        WHERE s.teacher_id = $1
        ORDER BY s.day_of_week, s.start_time
      `;
      params = [teacherId];
    } else if (studentId) {
      query = `
        SELECT s.*, c.name as course_name, t.name as teacher_name
        FROM student_schedules ss
        JOIN schedules s ON ss.schedule_id = s.id
        JOIN courses c ON s.course_id = c.id
        JOIN teachers t ON s.teacher_id = t.id
        WHERE ss.student_id = $1
        ORDER BY s.day_of_week, s.start_time
      `;
      params = [studentId];
    } else {
      return NextResponse.json(
        { error: 'Se requiere courseId, teacherId o studentId' },
        { status: 400 }
      );
    }

    await client.connect();
    const result = await client.query(query, params);
    await client.end();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener horarios:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener horarios',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
