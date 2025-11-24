import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

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
    const { name, code, teacher_id, credits, capacity, days_of_week, start_time, end_time } = await request.json();

    // Validar campos requeridos
    if (!name || !code || !teacher_id || !credits || !capacity) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: name, code, teacher_id, credits, capacity' },
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

    // Generar UUID para el curso
    const courseId = uuidv4();

    // Insertar curso
    const insertQuery = `
      INSERT INTO courses (id, name, code, teacher_id, teacher, credits, enrolled_students, capacity, days_of_week, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, code, teacher_id, teacher, credits, capacity, days_of_week, start_time, end_time
    `;

    const result = await client.query(insertQuery, [
      courseId,
      name,
      code,
      teacher_id,
      teacherName,
      credits,
      0, // enrolled_students inicia en 0
      capacity,
      days_of_week || null,
      start_time || null,
      end_time || null,
    ]);

    await client.end();

    return NextResponse.json(
      {
        message: '✅ Curso creado correctamente',
        course: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error al crear curso:', error);
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

    // Primero eliminar inscripciones asociadas
    await client.query('DELETE FROM enrollments WHERE course_id = $1', [courseId]);

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
