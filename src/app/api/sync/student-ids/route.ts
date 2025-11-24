import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await client.connect();
    console.log('📝 Sincronizando student_ids en cursos...');

    // 1. Agregar columna si no existe
    await client.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS student_ids UUID[] DEFAULT '{}';
    `);
    console.log('✅ Columna student_ids verificada');

    // 2. Actualizar todos los arrays de cursos con los datos existentes
    await client.query(`
      UPDATE courses c
      SET student_ids = COALESCE((
        SELECT ARRAY_AGG(DISTINCT e.student_id)
        FROM enrollments e
        WHERE e.course_id = c.id
      ), '{}')
    `);
    console.log('✅ Arrays de student_ids sincronizados');

    // 3. Verificar resultados
    const result = await client.query(`
      SELECT 
        id,
        name,
        code,
        ARRAY_LENGTH(student_ids, 1) as total_students,
        enrolled_students
      FROM courses
      ORDER BY name ASC
    `);

    await client.end();

    return NextResponse.json({
      message: '✅ Sincronización completada',
      courses: result.rows,
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    return NextResponse.json(
      {
        error: 'Error en sincronización',
        details: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
