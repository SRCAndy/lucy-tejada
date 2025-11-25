import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Función para generar bloques de horario basado en créditos
function generateScheduleBlocks(
  credits: number
): Array<{ day: string; startTime: string; endTime: string }> {
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const timeSlots = [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
  ];

  let hoursPerWeek = 0;
  if (credits === 2) hoursPerWeek = 2;
  else if (credits === 3) hoursPerWeek = 4;
  else if (credits === 4) hoursPerWeek = 6;
  else hoursPerWeek = Math.max(2, credits * 2);

  const numberOfBlocks = Math.ceil(hoursPerWeek / 2);
  const blocks: Array<{ day: string; startTime: string; endTime: string }> = [];

  for (let i = 0; i < numberOfBlocks; i++) {
    const dayIndex = i % daysOfWeek.length;
    const day = daysOfWeek[dayIndex];
    const randomSlotIndex = Math.floor(Math.random() * timeSlots.length);
    const slot = timeSlots[randomSlotIndex];

    blocks.push({
      day,
      startTime: slot.start,
      endTime: slot.end,
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

    console.log('[SCHEDULES-POST] Iniciando generación de horarios para:', courseId);

    if (!courseId) {
      console.error('[SCHEDULES-POST] ❌ Course ID no proporcionado');
      return NextResponse.json(
        { error: 'Course ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();
    console.log('[SCHEDULES-POST] ✅ Conectado a la BD');

    // Obtener información del curso
    console.log('[SCHEDULES-POST] Obteniendo información del curso...');
    const courseResult = await client.query(
      'SELECT id, teacher_id, credits FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      await client.end();
      console.error('[SCHEDULES-POST] ❌ Curso no encontrado');
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    const course = courseResult.rows[0];
    console.log('[SCHEDULES-POST] ✅ Curso encontrado - Créditos:', course.credits);

    // Generar bloques
    const scheduleBlocks = generateScheduleBlocks(course.credits);
    console.log(`[SCHEDULES-POST] Generando ${scheduleBlocks.length} bloques de horario`);

    // Insertar bloques de horario
    const schedules = [];

    for (const block of scheduleBlocks) {
      try {
        const scheduleId = uuidv4();

        console.log(
          `[SCHEDULES-POST] Insertando: ${block.day} ${block.startTime}-${block.endTime}`
        );

        const scheduleResult = await client.query(
          `INSERT INTO schedules 
            (id, course_id, teacher_id, day_of_week, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5::TIME, $6::TIME)
           RETURNING id, course_id, teacher_id, day_of_week, start_time, end_time`,
          [
            scheduleId,
            courseId,
            course.teacher_id,
            block.day,
            block.startTime,
            block.endTime,
          ]
        );

        if (scheduleResult.rows.length > 0) {
          schedules.push(scheduleResult.rows[0]);
          console.log('[SCHEDULES-POST] ✅ Horario insertado');
        }
      } catch (err) {
        console.error('[SCHEDULES-POST] ❌ Error insertando horario:', err);
        throw err;
      }
    }

    console.log(`[SCHEDULES-POST] Se insertaron ${schedules.length} horarios`);

    // Obtener estudiantes inscritos
    const enrollmentsResult = await client.query(
      'SELECT DISTINCT student_id FROM enrollments WHERE course_id = $1',
      [courseId]
    );

    console.log(
      `[SCHEDULES-POST] ${enrollmentsResult.rows.length} estudiantes inscritos`
    );

    // Vincular horarios con estudiantes
    const studentSchedules = [];

    for (const schedule of schedules) {
      for (const enrollment of enrollmentsResult.rows) {
        try {
          const studentScheduleId = uuidv4();

          const studentScheduleResult = await client.query(
            `INSERT INTO student_schedules 
              (id, student_id, course_id, schedule_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING
             RETURNING id, student_id, course_id, schedule_id`,
            [
              studentScheduleId,
              enrollment.student_id,
              courseId,
              schedule.id,
            ]
          );

          if (studentScheduleResult.rows.length > 0) {
            studentSchedules.push(studentScheduleResult.rows[0]);
          }
        } catch (err) {
          console.error('[SCHEDULES-POST] ⚠️ Error vinculando estudiante:', err);
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
        INNER JOIN courses c ON s.course_id = c.id
        WHERE s.course_id = $1
        ORDER BY s.day_of_week, s.start_time
      `;
      params = [courseId];
    } else if (teacherId) {
      query = `
        SELECT s.*, c.name as course_name 
        FROM schedules s
        INNER JOIN courses c ON s.course_id = c.id
        WHERE s.teacher_id = $1 AND c.id IS NOT NULL
        ORDER BY s.day_of_week, s.start_time
      `;
      params = [teacherId];
      console.log(`[SCHEDULES-GET] Obteniendo horarios para profesor ${teacherId}`);
    } else if (studentId) {
      query = `
        SELECT s.*, c.name as course_name, t.name as teacher_name
        FROM student_schedules ss
        INNER JOIN schedules s ON ss.schedule_id = s.id
        INNER JOIN courses c ON s.course_id = c.id
        INNER JOIN teachers t ON s.teacher_id = t.id
        WHERE ss.student_id = $1 AND c.id IS NOT NULL
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
    console.log(`[SCHEDULES-GET] Ejecutando query: ${query.substring(0, 80)}...`);
    const result = await client.query(query, params);
    console.log(`[SCHEDULES-GET] Encontrados ${result.rows.length} horarios`);
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
