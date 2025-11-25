import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

/**
 * Genera bloques de horario basado en créditos
 * - 2 créditos = 2 horas/semana (1 bloque de 2 horas)
 * - 3 créditos = 4 horas/semana (2 bloques de 2 horas)
 * - 4 créditos = 6 horas/semana (3 bloques de 2 horas)
 * 
 * Distribuye los bloques en lunes a viernes
 */
function generateScheduleBlocks(
  credits: number
): Array<{ day: string; startTime: string; endTime: string }> {
  // Días disponibles (lunes a viernes)
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Franjas horarias disponibles (bloques de 2 horas)
  const timeSlots = [
    { start: '06:00', end: '08:00' },
    { start: '08:00', end: '10:00' },
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
  ];

  // Calcular cantidad de bloques basado en créditos
  let hoursPerWeek = 0;
  if (credits === 2) hoursPerWeek = 2;
  else if (credits === 3) hoursPerWeek = 4;
  else if (credits === 4) hoursPerWeek = 6;
  else hoursPerWeek = Math.max(2, credits * 2); // Fallback

  // Cada bloque es de 2 horas
  const numberOfBlocks = Math.ceil(hoursPerWeek / 2);

  const blocks: Array<{ day: string; startTime: string; endTime: string }> = [];

  console.log(
    `[SCHEDULE-GEN] Créditos: ${credits} → ${hoursPerWeek} horas/semana → ${numberOfBlocks} bloques`
  );

  // Distribuir bloques aleatoriamente en días y horarios
  for (let i = 0; i < numberOfBlocks; i++) {
    // Seleccionar día (ciclando a través de lunes a viernes)
    const dayIndex = i % daysOfWeek.length;
    const day = daysOfWeek[dayIndex];

    // Seleccionar horario aleatorio
    const randomSlotIndex = Math.floor(Math.random() * timeSlots.length);
    const slot = timeSlots[randomSlotIndex];

    blocks.push({
      day,
      startTime: slot.start,
      endTime: slot.end,
    });

    console.log(
      `[SCHEDULE-GEN]   Bloque ${i + 1}: ${day} ${slot.start}-${slot.end}`
    );
  }

  return blocks;
}

// GET - Obtener todos los cursos
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

    const query = `
      SELECT 
        id, 
        name, 
        code, 
        teacher_id, 
        teacher, 
        credits, 
        enrolled_students, 
        capacity, 
        days_of_week, 
        start_time, 
        end_time,
        student_ids
      FROM courses
      ORDER BY name ASC
    `;

    const result = await client.query(query);
    await client.end();

    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('❌ Error al obtener cursos:', error);
    return NextResponse.json(
      {
        error: 'Error al obtener cursos',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo curso
export async function POST(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { name, code, teacher_id, credits, capacity } = await request.json();

    console.log('[COURSES-POST] Iniciando creación de curso:', {
      name,
      code,
      teacher_id,
      credits,
      capacity,
    });

    // Validar campos requeridos
    if (!name || !code || !teacher_id || !credits || !capacity) {
      console.error('[COURSES-POST] ❌ Faltan campos requeridos');
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, code, teacher_id, credits, capacity' },
        { status: 400 }
      );
    }

    await client.connect();
    console.log('[COURSES-POST] ✅ Conectado a la BD');

    // Validar que el código del curso no exista
    console.log('[COURSES-POST] Verificando que el código no exista...');
    const codeCheckResult = await client.query(
      'SELECT id FROM courses WHERE code = $1',
      [code]
    );

    if (codeCheckResult.rows.length > 0) {
      await client.end();
      console.error('[COURSES-POST] ❌ El código ya existe');
      return NextResponse.json(
        {
          error: `El código de curso "${code}" ya existe. Por favor usa un código diferente.`,
        },
        { status: 400 }
      );
    }

    // Obtener nombre del profesor
    console.log('[COURSES-POST] Buscando profesor...');
    const teacherResult = await client.query(
      'SELECT id, name FROM teachers WHERE id = $1',
      [teacher_id]
    );

    if (teacherResult.rows.length === 0) {
      await client.end();
      console.error('[COURSES-POST] ❌ Profesor no encontrado');
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    const teacherName = teacherResult.rows[0].name;
    console.log('[COURSES-POST] ✅ Profesor encontrado:', teacherName);

    // Generar UUID para el curso
    const courseId = uuidv4();
    console.log('[COURSES-POST] UUID del curso:', courseId);

    // Insertar curso en la tabla
    console.log('[COURSES-POST] Insertando curso en la BD...');
    const insertCourseResult = await client.query(
      `INSERT INTO courses 
        (id, name, code, teacher_id, teacher, credits, enrolled_students, capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, code, teacher_id, teacher, credits, capacity`,
      [courseId, name, code, teacher_id, teacherName, credits, 0, capacity]
    );

    const createdCourse = insertCourseResult.rows[0];
    console.log('[COURSES-POST] ✅ Curso creado en la BD');

    // Generar horarios automáticamente
    console.log('[COURSES-POST] Generando bloques de horario...');
    const scheduleBlocks = generateScheduleBlocks(credits);

    if (scheduleBlocks.length === 0) {
      console.warn('[COURSES-POST] ⚠️ No se generaron bloques de horario');
      await client.end();
      return NextResponse.json(
        {
          message: '✅ Curso creado pero sin horarios',
          course: createdCourse,
          schedules: [],
        },
        { status: 201 }
      );
    }

    console.log(`[COURSES-POST] Se generaron ${scheduleBlocks.length} bloques`);

    // Insertar cada bloque de horario
    const schedules = [];

    for (const block of scheduleBlocks) {
      try {
        const scheduleId = uuidv4();

        console.log(
          `[COURSES-POST] Insertando horario: ${block.day} ${block.startTime}-${block.endTime}`
        );

        // Insertar en la tabla schedules
        const scheduleResult = await client.query(
          `INSERT INTO schedules 
            (id, course_id, teacher_id, day_of_week, start_time, end_time)
           VALUES ($1, $2, $3, $4, $5::TIME, $6::TIME)
           RETURNING id, course_id, teacher_id, day_of_week, start_time, end_time`,
          [
            scheduleId,
            courseId,
            teacher_id,
            block.day,
            block.startTime,
            block.endTime,
          ]
        );

        if (scheduleResult.rows.length > 0) {
          const insertedSchedule = scheduleResult.rows[0];
          schedules.push(insertedSchedule);
          console.log(
            `[COURSES-POST] ✅ Horario insertado: ${insertedSchedule.id}`
          );
        } else {
          console.warn('[COURSES-POST] ⚠️ No se retornó fila después del INSERT');
        }
      } catch (scheduleError) {
        console.error(
          `[COURSES-POST] ❌ Error insertando horario ${block.day}:`,
          scheduleError
        );
        // No lanzar error, continuar con los siguientes
      }
    }

    console.log(
      `[COURSES-POST] ✅ Se insertaron ${schedules.length} horarios en la BD`
    );

    await client.end();

    return NextResponse.json(
      {
        message: '✅ Curso creado correctamente',
        course: createdCourse,
        schedules: schedules,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[COURSES-POST] ❌ Error al crear curso:', error);
    return NextResponse.json(
      {
        error: 'Error al crear curso',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar curso
export async function PUT(request: NextRequest) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    const { id, name, code, teacher_id, credits, capacity, days_of_week, start_time, end_time } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Course ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    // Obtener nombre del profesor
    const teacherQuery = 'SELECT name FROM teachers WHERE id = $1';
    const teacherResult = await client.query(teacherQuery, [teacher_id]);

    if (teacherResult.rows.length === 0) {
      await client.end();
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    const teacherName = teacherResult.rows[0].name;

    const updateQuery = `
      UPDATE courses
      SET name = $1, code = $2, teacher_id = $3, teacher = $4, credits = $5, capacity = $6, days_of_week = $7, start_time = $8, end_time = $9
      WHERE id = $10
      RETURNING id, name, code, teacher_id, teacher, credits, capacity, days_of_week, start_time, end_time
    `;

    const result = await client.query(updateQuery, [
      name,
      code,
      teacher_id,
      teacherName,
      credits,
      capacity,
      days_of_week || null,
      start_time || null,
      end_time || null,
      id,
    ]);

    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: '✅ Curso actualizado correctamente',
        course: result.rows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al actualizar curso:', error);
    return NextResponse.json(
      {
        error: 'Error al actualizar curso',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar curso
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
    const courseId = searchParams.get('id');

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID es requerido' },
        { status: 400 }
      );
    }

    await client.connect();

    console.log(`[COURSES-DELETE] Eliminando curso ${courseId}`);

    // Primero eliminar student_schedules asociados
    await client.query(`
      DELETE FROM student_schedules 
      WHERE schedule_id IN (
        SELECT id FROM schedules WHERE course_id = $1
      )
    `, [courseId]);
    console.log('[COURSES-DELETE] ✅ Registros de horarios de estudiantes eliminados');

    // Eliminar horarios del curso
    await client.query('DELETE FROM schedules WHERE course_id = $1', [courseId]);
    console.log('[COURSES-DELETE] ✅ Horarios eliminados');

    // Eliminar inscripciones asociadas
    await client.query('DELETE FROM enrollments WHERE course_id = $1', [courseId]);
    console.log('[COURSES-DELETE] ✅ Inscripciones eliminadas');

    // Luego eliminar el curso
    const deleteQuery = 'DELETE FROM courses WHERE id = $1 RETURNING id';
    const result = await client.query(deleteQuery, [courseId]);

    await client.end();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Curso no encontrado' },
        { status: 404 }
      );
    }

    console.log('[COURSES-DELETE] ✅ Curso eliminado');

    return NextResponse.json(
      { message: '✅ Curso eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error al eliminar curso:', error);
    return NextResponse.json(
      {
        error: 'Error al eliminar curso',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
