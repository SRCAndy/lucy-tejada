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
    console.log('Ejecutando setup de columna student_ids...');

    // Agregar columna si no existe
    await client.query(`
      ALTER TABLE courses 
      ADD COLUMN IF NOT EXISTS student_ids UUID[] DEFAULT '{}';
    `);

    // Actualizar estudiantes existentes
    await client.query(`
      UPDATE courses c
      SET student_ids = COALESCE((
        SELECT ARRAY_AGG(DISTINCT e.student_id) 
        FROM enrollments e 
        WHERE e.course_id = c.id
      ), '{}')
      WHERE student_ids = '{}' OR student_ids IS NULL;
    `);

    await client.end();
    return NextResponse.json({ message: 'Setup completado' }, { status: 200 });
  } catch (error) {
    console.error('Error en setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    );
  }
}
