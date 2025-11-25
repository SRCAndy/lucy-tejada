import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';

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
    if (!courseId) {
      return NextResponse.json({ error: 'courseId requerido' }, { status: 400 });
    }

    await client.connect();

    // Obtener tipos de calificaciones
    const gradeTypesResult = await client.query(
      'SELECT id, name FROM grade_types WHERE course_id = $1 ORDER BY created_at',
      [courseId]
    );

    // Obtener calificaciones de todos los estudiantes
    const gradesResult = await client.query(
      `SELECT g.*, gt.name as grade_type_name, s.name as student_name
       FROM grades g
       JOIN grade_types gt ON g.grade_type_id = gt.id
       JOIN students s ON g.student_id = s.id
       WHERE g.course_id = $1
       ORDER BY s.name, gt.created_at`,
      [courseId]
    );

    // Agrupar por estudiante
    const gradesMap: Record<string, Record<string, number>> = {};
    gradesResult.rows.forEach((row: any) => {
      if (!gradesMap[row.student_id]) {
        gradesMap[row.student_id] = {};
      }
      gradesMap[row.student_id][row.grade_type_id] = row.score;
    });

    await client.end();

    return NextResponse.json({
      gradeTypes: gradeTypesResult.rows,
      grades: gradesMap,
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    try {
      await client.end();
    } catch (e) {}
    return NextResponse.json(
      { error: 'Error al obtener calificaciones' },
      { status: 500 }
    );
  }
}

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
    const { grades, gradeTypes, teacherId } = body;

    if (!courseId || !teacherId) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    await client.connect();

    // Verificar permiso del profesor
    const courseResult = await client.query(
      'SELECT teacher_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (courseResult.rows[0].teacher_id !== teacherId) {
      await client.end();
      return NextResponse.json(
        { error: 'No tienes permiso para modificar las calificaciones de este curso' },
        { status: 403 }
      );
    }

    // Primero, crear/actualizar tipos de calificaciones
    const gradeTypeMap: Record<string, string> = {};

    for (const typeName of Object.keys(gradeTypes || {})) {
      const existingType = await client.query(
        'SELECT id FROM grade_types WHERE course_id = $1 AND name = $2',
        [courseId, typeName]
      );

      let typeId: string;
      if (existingType.rows.length > 0) {
        typeId = existingType.rows[0].id;
      } else {
        typeId = uuidv4();
        await client.query(
          'INSERT INTO grade_types (id, course_id, name) VALUES ($1, $2, $3)',
          [typeId, courseId, typeName]
        );
      }
      gradeTypeMap[typeName] = typeId;
    }

    // Luego, guardar/actualizar calificaciones
    let savedCount = 0;
    for (const [studentId, studentGrades] of Object.entries(grades || {})) {
      for (const [gradeTypeName, score] of Object.entries(studentGrades as Record<string, any>)) {
        if (score === null || score === undefined) continue;

        const typeId = gradeTypeMap[gradeTypeName];
        if (!typeId) continue;

        const numScore = Number(score);
        if (isNaN(numScore)) continue;

        await client.query(
          `INSERT INTO grades (id, course_id, student_id, grade_type_id, score, updated_at)
           VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
           ON CONFLICT (course_id, student_id, grade_type_id)
           DO UPDATE SET score = $5, updated_at = CURRENT_TIMESTAMP`,
          [uuidv4(), courseId, studentId, typeId, numScore]
        );
        savedCount++;
      }
    }

    await client.end();

    console.log(`[GRADES-SAVE] ✅ ${savedCount} calificaciones guardadas`);

    return NextResponse.json({
      message: '✅ Calificaciones guardadas correctamente',
      saved: savedCount,
    });
  } catch (error) {
    console.error('[GRADES-SAVE] ❌ Error:', error);
    try {
      await client.end();
    } catch (e) {}
    return NextResponse.json(
      { error: 'Error al guardar calificaciones' },
      { status: 500 }
    );
  }
}

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
    const { gradeTypeId, teacherId } = body;

    if (!courseId || !gradeTypeId || !teacherId) {
      return NextResponse.json({ error: 'Datos requeridos faltantes' }, { status: 400 });
    }

    await client.connect();

    // Verificar permiso del profesor
    const courseResult = await client.query(
      'SELECT teacher_id FROM courses WHERE id = $1',
      [courseId]
    );

    if (courseResult.rows.length === 0) {
      await client.end();
      return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    }

    if (courseResult.rows[0].teacher_id !== teacherId) {
      await client.end();
      return NextResponse.json(
        { error: 'No tienes permiso para modificar las calificaciones de este curso' },
        { status: 403 }
      );
    }

    // Eliminar todas las calificaciones de este tipo
    const deleteResult = await client.query(
      'DELETE FROM grades WHERE course_id = $1 AND grade_type_id = $2 RETURNING id',
      [courseId, gradeTypeId]
    );

    // Eliminar el tipo de calificación
    await client.query(
      'DELETE FROM grade_types WHERE id = $1',
      [gradeTypeId]
    );

    await client.end();

    console.log(`[GRADES-DELETE] ✅ ${deleteResult.rows.length} registros eliminados`);

    return NextResponse.json({
      message: '✅ Tipo de calificación eliminado',
      deleted: deleteResult.rows.length,
    });
  } catch (error) {
    console.error('[GRADES-DELETE] ❌ Error:', error);
    try {
      await client.end();
    } catch (e) {}
    return NextResponse.json(
      { error: 'Error al eliminar calificación' },
      { status: 500 }
    );
  }
}
